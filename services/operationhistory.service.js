const Operationhistory = require('../model/operationhistory.model');
const projects = require('../model/projects.model');
const Project = require('../model/projects.model');
const { abortServiceClient } = require('../grpcClient');
const JobProject = require('../model/jobprojects.model');

const addOrUpdateOperation = async (projectId) => {
    const projectDetails = await Project.findById(projectId);
    if (!projectDetails) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    const proArr = {
        projectId: projectId,
        currentFrameId: projectDetails.currentFrameId,
        imageFolInPtr: projectDetails.imageFolInPtr,
        videoFolInPtr: projectDetails.videoFolInPtr,
        imagePossibleUndoCount: projectDetails.imagePossibleUndoCount,
        imagePossibleRedoCount: projectDetails.imagePossibleRedoCount,
        operatePossibleOnVideoFlag: projectDetails.operatePossibleOnVideoFlag,
        handoverPossibleImageToVideoFlag: projectDetails.handoverPossibleImageToVideoFlag,
        curProcessingSourceFolType: projectDetails.curProcessingSourceFolType,
        curProcessingSourceFolPtr: projectDetails.curProcessingSourceFolPtr,
        curProcessingDestinationFolType: projectDetails.curProcessingDestinationFolType,
        curProcessingDestinationFolPtr: projectDetails.curProcessingDestinationFolPtr,
        videoPossibleUndoCount: projectDetails.videoPossibleUndoCount,

        videoToFrameWarningPopUpFlag: projectDetails.videoToFrameWarningPopUpFlag,
        processingGoingOnVideoOrFrameFlag: projectDetails.processingGoingOnVideoOrFrameFlag,
        processingGoingOnVideoNotFrameFlag: projectDetails.processingGoingOnVideoNotFrameFlag,

        curDisplayPreviewFolType: projectDetails.curDisplayPreviewFolType,
        curDisplayPreviewFolPtr: projectDetails.curDisplayPreviewFolPtr,

        curProcessingPreviewSourceFolType: projectDetails.curProcessingPreviewSourceFolType,
        curProcessingPreviewSourceFolPtr: projectDetails.curProcessingPreviewSourceFolPtr,
        curProcessingPreviewDestinationFolType: projectDetails.curProcessingPreviewDestinationFolType,
        curProcessingPreviewDestinationFolPtr: projectDetails.curProcessingPreviewDestinationFolPtr,
    }
    const operationDetails = await Operationhistory.findOne({ projectId: projectId });
    if (operationDetails) {
        await Operationhistory.findByIdAndUpdate(operationDetails.id, proArr, { new: true });
    } else {
        let operation = new Operationhistory(proArr);
        await operation.save();
    }
};

const revertOperation = async (jobId,projectId) => {
   

    return new Promise((resolve, reject) => {
        const request = { job_id:jobId };
        console.log('----------------',request)
        abortServiceClient.AbortProcess(request, async (error, response) => {
            if (error) {
                return resolve({
                    statusCode: 404,
                    status: 'Failed',
                    message: error.message || error
                });
            }

            const jobDetails = await JobProject.findOne({ jobId }).sort({ createdAt: -1 });
            if (!jobDetails) {
                return resolve({
                    statusCode: 404,
                    status: 'Failed',
                    message: 'Data not found'
                });
            }

            if (response && response.status_code==200) {
                await updateProjectDetails(projectId);
            }
            const jobProjectDetails = await Operationhistory.findOne({ projectId });
            resolve({
                statusCode: response.status_code,
                message: response.message?response.message:'ok',
                response,'jobDetails':jobProjectDetails});
        });
    });


};

async function updateProjectDetails(projectId) {
    const projectDetails = await Project.findById(projectId);
    if (!projectDetails) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    const operationDetails = await Operationhistory.findOne({ projectId: projectId });
    if (!operationDetails) {
        return;
    }
    const proArr = {
        currentFrameId: operationDetails.currentFrameId,
        imageFolInPtr: operationDetails.imageFolInPtr,
        videoFolInPtr: operationDetails.videoFolInPtr,
        imagePossibleUndoCount: operationDetails.imagePossibleUndoCount,
        imagePossibleRedoCount: operationDetails.imagePossibleRedoCount,
        operatePossibleOnVideoFlag: operationDetails.operatePossibleOnVideoFlag,
        handoverPossibleImageToVideoFlag: operationDetails.handoverPossibleImageToVideoFlag,
        curProcessingSourceFolType: operationDetails.curProcessingSourceFolType,
        curProcessingSourceFolPtr: operationDetails.curProcessingSourceFolPtr,
        curProcessingDestinationFolType: operationDetails.curProcessingDestinationFolType,
        curProcessingDestinationFolPtr: operationDetails.curProcessingDestinationFolPtr,
        videoPossibleUndoCount: operationDetails.videoPossibleUndoCount,

        videoToFrameWarningPopUpFlag: operationDetails.videoToFrameWarningPopUpFlag,
        processingGoingOnVideoOrFrameFlag: operationDetails.processingGoingOnVideoOrFrameFlag,
        processingGoingOnVideoNotFrameFlag: operationDetails.processingGoingOnVideoNotFrameFlag,

        curDisplayPreviewFolType: operationDetails.curDisplayPreviewFolType,
        curDisplayPreviewFolPtr: operationDetails.curDisplayPreviewFolPtr,

        curProcessingPreviewSourceFolType: operationDetails.curProcessingPreviewSourceFolType,
        curProcessingPreviewSourceFolPtr: operationDetails.curProcessingPreviewSourceFolPtr,
        curProcessingPreviewDestinationFolType: operationDetails.curProcessingPreviewDestinationFolType,
        curProcessingPreviewDestinationFolPtr: operationDetails.curProcessingPreviewDestinationFolPtr,
    }
    await projects.findByIdAndUpdate(projectId, proArr, { new: true });
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Update Successfully.'
    };
};

module.exports = {
    addOrUpdateOperation,
    revertOperation
};