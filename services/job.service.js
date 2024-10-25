const { channelServiceClient } = require('../grpcClient');
const JobProject = require('../model/jobprojects.model');
const Project = require('../model/projects.model');

const getStatus = async (job_id) => {
    const request = { job_id };
    return new Promise((resolve, reject) => {
        channelServiceClient.GetJobStatus(request, async (error, response) => {
            if (error) {
                console.error("Error fetching job status:", error);
                return reject({ error: 'Error fetching job status', details: error });
            }

            // If there is any condition to check, you can add it here
            if (response && response.completed) {
                await updateJobDetails(response.job_id);
                await updateProjectDetails(response.job_id);
            }
            resolve(response);
        });
    });
};

async function updateJobDetails(jobId) {
    const jobProjectDetails = await JobProject.findById(jobId);
    if (!jobProjectDetails) {
        return;
    }
    const proArr = {
        currentFrameId: jobProjectDetails.currentFrameId,
        imageFolInPtr: jobProjectDetails.imageFolInPtr,
        videoFolInPtr: jobProjectDetails.videoFolInPtr,
        imagePossibleUndoCount: jobProjectDetails.imagePossibleUndoCount,
        imagePossibleRedoCount: jobProjectDetails.imagePossibleRedoCount,
        operatePossibleOnVideoFlag: jobProjectDetails.operatePossibleOnVideoFlag,
        handoverPossibleImageToVideoFlag: jobProjectDetails.handoverPossibleImageToVideoFlag,
        curProcessingSourceFolType: jobProjectDetails.curProcessingSourceFolType,
        curProcessingSourceFolPtr: jobProjectDetails.curProcessingSourceFolPtr,
        curProcessingDestinationFolType: jobProjectDetails.curProcessingDestinationFolType,
        curProcessingDestinationFolPtr: jobProjectDetails.curProcessingDestinationFolPtr,
        videoPossibleUndoCount: jobProjectDetails.videoPossibleUndoCount,

        videoToFrameWarningPopUp: jobProjectDetails.videoToFrameWarningPopUp,
        processingGoingOnVideoOrFrameFlag: jobProjectDetails.processingGoingOnVideoOrFrameFlag,
        processingGoingOnVideoNotFrame: jobProjectDetails.processingGoingOnVideoNotFrame,

        curDisplayPreviewFolType: jobProjectDetails.curDisplayPreviewFolType,
        curDisplayPreviewFolPtr: jobProjectDetails.curDisplayPreviewFolPtr,

        curProcessingPreviewSourceFolType: jobProjectDetails.curProcessingPreviewSourceFolType,
        curProcessingPreviewSourceFolPtr: jobProjectDetails.curProcessingPreviewSourceFolPtr,
        curProcessingPreviewDestinationFolType: jobProjectDetails.curProcessingPreviewDestinationFolType,
        curProcessingPreviewDestinationFolPtr: jobProjectDetails.curProcessingPreviewDestinationFolPtr,

    }

    await Project.findByIdAndUpdate(jobProjectDetails.projectId, proArr, { new: true });
};


async function updateProjectDetails(jobId) {
    const jobProjectDetails = await JobProject.findById(jobId);
    if (!jobProjectDetails) {
        return;
    }
    const projectDetails = await Project.findById(jobProjectDetails.projectId);

    if (!projectDetails) {
        return;
    }
    let processingGoingOnVideoOrFrameFlag = false;

    let curDisplayThumbnailFolType = projectDetails.VideoFolderSet;
    let curDisplayThumbnailFolPtr = projectDetails.videoFolInPtr;
    let refreshThumbnailFlag = projectDetails.refreshThumbnailFlag;

    if (projectDetails.processingGoingOnVideoNotFrame) {
        refreshThumbnailFlag = true;
    }

    if (projectDetails.curDisplayPreviewFolPtr === 2) {
        // copyImage(projectDetails.currentFrameId, {
        //     folderType: 'TempFolder',
        //     folderPtr: 2
        // }, {
        //     folderType: 'TempFolder',
        //     folderPtr: 1
        // });

        curDisplayPreviewFolType = 'TempFolder';
        curDisplayPreviewFolPtr = 1;
    } else {
        if (projectDetails.processingGoingOnVideoNotFrame === true) {
            curDisplayPreviewFolType = projectDetails.VideoFolderSet;
            curDisplayPreviewFolPtr = projectDetails.videoFolInPtr;
        } else {
            curDisplayPreviewFolType = projectDetails.ImageFolderSet;
            curDisplayPreviewFolPtr = projectDetails.imageFolInPtr;
        }
    }

    curProcessingPreviewSourceFolType = projectDetails.curProcessingDestinationFolType;
    curProcessingPreviewSourceFolPtr = projectDetails.curProcessingDestinationFolPtr;
    curProcessingPreviewDestinationFolType = 'TempFolder';
    curProcessingPreviewDestinationFolPtr = 1;

    const projectUpdate = await Project.findByIdAndUpdate(id, {
        processingGoingOnVideoOrFrameFlag,
        curDisplayThumbnailFolType,
        curDisplayThumbnailFolPtr,
        refreshThumbnailFlag,
        curDisplayPreviewFolType,
        curDisplayPreviewFolPtr,
        curProcessingPreviewSourceFolType,
        curProcessingPreviewSourceFolPtr,
        curProcessingPreviewDestinationFolType,
        curProcessingPreviewDestinationFolPtr
    }, { new: true });
};

function copyImage(currentFrameId, source, destination) {
    console.log(`Copying image ${currentFrameId} from ${source.folderType} (${source.folderPtr}) to ${destination.folderType} (${destination.folderPtr})`);
}

module.exports = {
    getStatus
}