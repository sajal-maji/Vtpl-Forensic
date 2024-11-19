const Operationhistory = require('../model/operationhistory.model');
const projects = require('../model/projects.model');
const Project = require('../model/projects.model');

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

        videoToFrameWarningPopUp: projectDetails.videoToFrameWarningPopUp,
        processingGoingOnVideoOrFrameFlag: projectDetails.processingGoingOnVideoOrFrameFlag,
        processingGoingOnVideoNotFrame: projectDetails.processingGoingOnVideoNotFrame,

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

const revertOperation = async (projectId) => {
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

        videoToFrameWarningPopUp: operationDetails.videoToFrameWarningPopUp,
        processingGoingOnVideoOrFrameFlag: operationDetails.processingGoingOnVideoOrFrameFlag,
        processingGoingOnVideoNotFrame: operationDetails.processingGoingOnVideoNotFrame,

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