const { channelServiceClient } = require('../grpcClient');
const JobProject = require('../model/jobprojects.model');
const Project = require('../model/projects.model');

const getStatus = async (job_id) => {
    const request = { job_id };
    return new Promise((resolve, reject) => {
        channelServiceClient.GetJobStatus(request, (error, response) => {
            if (error) {
                console.error("Error fetching job status:", error);
                return reject({ error: 'Error fetching job status', details: error });
            }

            // If there is any condition to check, you can add it here
            // if (response && response.completed) {
            //     await updateJobDetails(response.job_id);
            // }
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

module.exports = {
    getStatus
}