const { channelServiceClient } = require('../grpcClient');
const JobProject = require('../model/jobprojects.model');
const Operationhistory = require('../model/operationhistory.model');

const Project = require('../model/projects.model');
const path = require('path');
const fs = require('fs');
const VideoFolderSet = 'video'
const ImageFolderSet = 'image'
const TempFolder = 'temp'

const getStatus = async (job_id, userId) => {
    const request = { job_id };
    return new Promise((resolve, reject) => {
        channelServiceClient.GetJobStatus(request, async (error, response) => {
            if (error) {
                console.error("Error fetching job status:", error);
                return reject({ error: 'Error fetching job status', details: error });
            }
            if (response && response.completed) {
                const proArr = {
                    JobStatus: 'complete',
                }
                await updateJobDetails(response.job_id, proArr);
                await updateProjectDetails(response.job_id, userId);
            }
            const jobProjectDetails = await JobProject.findOne({ jobId: response.job_id });
            resolve({response,'jobDetails':jobProjectDetails});
        });
    });
};

async function updateJobDetails(jobId,proArr) {
    const jobProjectDetails = await JobProject.findOne({ jobId: jobId.toString() });
    if (!jobProjectDetails) {
        return;
    }
    let id = jobProjectDetails.projectId;
    

    await Project.findByIdAndUpdate(id, proArr, { new: true });
};

async function updateProjectDetails(jobId, userId) {
    const jobProjectDetails = await JobProject.findOne({ jobId: jobId });
    if (!jobProjectDetails) {
        return;
    }

    let id = jobProjectDetails.projectId;
    const projectDetails = await Project.findById(id);
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

    if (projectDetails.curDisplayPreviewFolPtr == 2) {
        copyImage(projectDetails.currentFrameId, id, userId, {
            folderType: TempFolder,
            folderPtr: 2
        }, {
            folderType: TempFolder,
            folderPtr: 1
        });
        curDisplayPreviewFolType = TempFolder;
        curDisplayPreviewFolPtr = 1;
    } else {
        if (projectDetails.processingGoingOnVideoNotFrame == true) {
            curDisplayPreviewFolType = VideoFolderSet;
            curDisplayPreviewFolPtr = projectDetails.videoFolInPtr;
        } else {
            curDisplayPreviewFolType = ImageFolderSet;
            curDisplayPreviewFolPtr = projectDetails.imageFolInPtr;
        }
    }

    curProcessingPreviewSourceFolType = projectDetails.curProcessingDestinationFolType;
    curProcessingPreviewSourceFolPtr = projectDetails.curProcessingDestinationFolPtr;
    curProcessingPreviewDestinationFolType = 'temp';
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