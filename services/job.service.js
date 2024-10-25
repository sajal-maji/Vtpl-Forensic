const { channelServiceClient } = require('../grpcClient');
const JobProject = require('../model/jobprojects.model');
const Project = require('../model/projects.model');
const path = require('path');
const fs = require('fs');

const getStatus = async (job_id, userId) => {
    const request = { job_id };
    return new Promise((resolve, reject) => {
        channelServiceClient.GetJobStatus(request, async (error, response) => {
            if (error) {
                console.error("Error fetching job status:", error);
                return reject({ error: 'Error fetching job status', details: error });
            }
            if (response && response.completed) {
                console.log('-------------Step------------1', response.job_id)
                await updateJobDetails(response.job_id);
                await updateProjectDetails(response.job_id, userId);
                console.log('-------------Step End------------')
            }
            resolve(response);
        });
    });
};

async function updateJobDetails(jobId) {
    const jobProjectDetails = await JobProject.findOne({ jobId: jobId.toString() });
    if (!jobProjectDetails) {
        return;
    }
    let id = jobProjectDetails.projectId;
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

    await Project.findByIdAndUpdate(id, proArr, { new: true });
};


async function updateProjectDetails(jobId, userId) {
    console.log("1111111111111111111111111" +jobId);

    const jobProjectDetails = await JobProject.findOne({ jobId: jobId });
    console.log("222222222222222222222222222222"+jobProjectDetails);

    if (!jobProjectDetails) {
        return;
    }
    console.log('-------------Step------------1.1')
    let id = jobProjectDetails.projectId;
    const projectDetails = await Project.findById(id);

    if (!projectDetails) {
        return;
    }
    console.log('-------------Step------------1.2')
    let processingGoingOnVideoOrFrameFlag = false;

    let curDisplayThumbnailFolType = projectDetails.VideoFolderSet;
    let curDisplayThumbnailFolPtr = projectDetails.videoFolInPtr;
    let refreshThumbnailFlag = projectDetails.refreshThumbnailFlag;

    if (projectDetails.processingGoingOnVideoNotFrame) {
        refreshThumbnailFlag = true;
        console.log('-------------Step------------1.2.1')
    }

    if (projectDetails.curDisplayPreviewFolPtr === 2) {
        copyImage(projectDetails.currentFrameId, id, userId, {
            folderType: 'temp',
            folderPtr: 2
        }, {
            folderType: 'temp',
            folderPtr: 1
        });
        console.log('-------------Step------------1.3')
        curDisplayPreviewFolType = 'temp';
        curDisplayPreviewFolPtr = 1;
    } else {
        console.log('-------------Step------------1.4')
        if (projectDetails.processingGoingOnVideoNotFrame === true) {
            curDisplayPreviewFolType = projectDetails.VideoFolderSet;
            curDisplayPreviewFolPtr = projectDetails.videoFolInPtr;
            console.log('-------------Step------------1.4.1')
        } else {
            curDisplayPreviewFolType = projectDetails.ImageFolderSet;
            curDisplayPreviewFolPtr = projectDetails.imageFolInPtr;
            console.log('-------------Step------------1.4.2')
        }
    }

    curProcessingPreviewSourceFolType = projectDetails.curProcessingDestinationFolType;
    curProcessingPreviewSourceFolPtr = projectDetails.curProcessingDestinationFolPtr;
    curProcessingPreviewDestinationFolType = 'temp';
    curProcessingPreviewDestinationFolPtr = 1;
    console.log('-------------Step------------1.7')
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

function copyImage(currentFrameId, id, userId, source, destination) {
    const rootPath = `${userId}/${id}`;
    const sourcePath = `public/${rootPath}/${source.folderType}/${source.folderPtr}/${currentFrameId}`;
    const destinationPath = `public/${rootPath}/${destination.folderType}/${destination.folderPtr}/${currentFrameId}`;

    // Use fs.copyFile to copy the file
    fs.copyFile(sourcePath, destinationPath, (err) => {
        if (err) {
            console.error(`Error copying image: ${err.message}`);
        } else {
            console.log(`Copied image ${currentFrameId} from ${source.folderType} (${source.folderPtr}) to ${destination.folderType} (${destination.folderPtr})`);
        }
    });
}

module.exports = {
    getStatus
}