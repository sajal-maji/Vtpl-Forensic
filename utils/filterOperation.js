const { channelServiceClient, adjustServiceClient } = require('../grpcClient');
const Project = require('../model/projects.model');
const logger = require("../helpers/logEvents");
const projectService = require("../services/project.service");
const Imageoperation = require('../services/imageoperation.service');
const fs = require('fs');
const fsExtra = require('fs-extra');

const { managePointer, folderPath, savePointer, cloneImage, checkFile, copyFolderExcluding } = require('../utils/servicePointer');

const filterOperation = async (req, res, next, requestObj, grpcServiceName, processName, operationName = null) => {
    logger.logCreate(`colorConversion: ${JSON.stringify(req.body)}`, 'systemlog');
    const { projectId: id, isApplyToAll, frame, isPreview } = req.body;

    const project = await Project.findById(id);
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    if (project.currentFrameId != frame[0]) {
        logger.logCreate(`selectThumbnailFrame: chnage frame from ${project.currentFrameId}to ${frame[0]}`, 'systemlog');
        const selectThumbnailFrame = await projectService.selectThumbnailFrame(req, id, frame[0]);
    }
    const { proDetails } = await managePointer(id, isApplyToAll, isPreview, frame, req, res);

    logger.logCreate(`managePointer: response ${JSON.stringify(proDetails)}`, 'systemlog');
    if (proDetails.statusCode != 200) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: proDetails.message
        };
    }

    const { errStatus, message } = await checkFile(id, isApplyToAll, isPreview, proDetails, req, res);
    logger.logCreate(`checkFile: response status - ${errStatus} and response message - ${message}`, 'systemlog');

    if (errStatus) {
        return {
            statusCode: 404,
            status: 'Failed',
            message
        };
    }
    if (operationName && !isPreview) {
        const oppData = {
            projectId: id,
            processType: (isPreview) ? 'preview' : (isApplyToAll) ? 'apply_to_all' : 'apply_to_frame',
            processName: operationName,
            exeDetailsAvailFlag: (requestObj) ? true : false,
            exeDetails: JSON.stringify(requestObj)
        }
        await Imageoperation.createOperation(oppData)
    }

    const { imgBasePathFrom, imgBasePathTo } = await folderPath(id, isApplyToAll, isPreview, proDetails, req, res);
    logger.logCreate(`folderPath: imgBasePathFrom - ${imgBasePathFrom}, imgBasePathTo - ${imgBasePathTo}`, 'systemlog');
    const srcTypeLoc = (isPreview) ? proDetails.curProcessingPreviewSourceFolType : proDetails.curProcessingSourceFolType

    let frameLoc = [];

    if (isPreview && srcTypeLoc == 'temp') {
        frameLoc[0] = proDetails.currentPreviewFrameId;
    }



    const jobObj = {
        process_all_flag: false,   // Process all flag
        is_preview_flag: isPreview,
        // in_img_list: isPreview && srcTypeLoc == 'temp' ? frameLoc : frame,  
        in_img_list: frame,                 // Input image list
        in_img_path: imgBasePathFrom,
        out_img_path: imgBasePathTo
    };

    const request = Object.assign({}, requestObj, jobObj);
    const rootPath = `${req.user.id}/${id}`;

    if (!isPreview) {
        const operationPath = `public/${rootPath}/${proDetails.curProcessingDestinationFolType}/${proDetails.curProcessingDestinationFolPtr}`
        await removeAndCreateFolder(operationPath);
    }

    if (isApplyToAll) {
        const sourceFolder = `public/${rootPath}/${proDetails.curProcessingSourceFolType}/${proDetails.curProcessingSourceFolPtr}`;
        const destinationFolder = `public/${rootPath}/${proDetails.curProcessingDestinationFolType}/${proDetails.curProcessingDestinationFolPtr}`;
        await copyFolderExcluding(sourceFolder, destinationFolder, frame);
    }

    // Make the gRPC request to the grayscale method (modify according to your method name)
    logger.logCreate(`grpc: request - ${JSON.stringify(request)}`, 'systemlog');

    const responseData = await callGrpcService(grpcServiceName, processName, request, req, res, proDetails);
    return responseData
};
async function removeAndCreateFolder(operationPath) {
    fsExtra.remove(operationPath, (removeErr) => {
        if (removeErr) {
            logger.logCreate(`deleteimage: response ${removeErr}`, 'systemlog');
        } else {
            logger.logCreate(`deleteimage: response success`, 'systemlog');
        }
        fs.mkdir(operationPath, { recursive: true }, (err) => {
        });
    });
}

async function callGrpcService(grpcServiceName, processName, request, req, res, proDetails) {
    return new Promise((resolve, reject) => {
        if (typeof grpcServiceName[processName] !== 'function') {
            return reject(new Error(`Method ${processName} is not available on the provided gRPC service.`));
        }

        // Call the method dynamically if it exists
        grpcServiceName[processName](request, async (error, response) => {
            try {
                const { projectId: id, isApplyToAll, frame, isPreview } = req.body;
                if (error) {
                    return resolve({
                        statusCode: 404,
                        status: 'Failed',
                        message: error.message || error
                    });
                }

                const { colData } = await savePointer(id, isApplyToAll, isPreview, frame, req, res, proDetails, response);

                logger.logCreate(`gRPC response: ${JSON.stringify(response)}`, 'systemlog');
                logger.logCreate(`savePointer response: ${JSON.stringify(colData)}`, 'systemlog');

                resolve({
                    message: 'Processing successfully done',
                    data: colData,
                    response
                });
            } catch (saveError) {
                reject({
                    error: 'Failed to save image filter',
                    details: saveError.message
                });
            }
        });
    });
}


module.exports = {
    filterOperation
}
