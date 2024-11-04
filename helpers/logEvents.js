const fs = require("fs");
const moment = require('moment');
const Project = require('../model/projects.model');

const logCreate = async function (msg, logfile = 'systemlog.text') {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    const logFileName = `${logfile}_${year}-${month}-${day}.txt`;

    let ccavnueResponceStream = fs.createWriteStream("public/logs/" + logFileName, { flags: "a" });
    const message = `${moment(new Date()).format('YYYY-MM-DDTHH:mm:ss')} : ${msg}\n`;
    ccavnueResponceStream.write(message, (error) => {
        if (error) {
            console.error('Error writing log:', error);
        } else {
            console.log('Log written successfully.');
        }
    });
};

const changePointer = async function (userId, id, msg, logfile = 'systemlog.text') {
    const projectDetails = await Project.findById(id);
    if (!projectDetails) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    let jsonData = {
        'call_number': 1,
        'process_no': 1,
        'process_name': msg,
        'Response' : 'Possible',
        'currentFrameId': projectDetails.currentFrameId,
        'undoVideoLimit' : projectDetails.undoVideoLimit,
        'undoImageLimit' : projectDetails.undoImageLimit,
        'videoFolInPtr' : projectDetails.videoFolInPtr,
        'imageFolInPtr' : projectDetails.imageFolInPtr,
        'videoPossibleUndoCount': projectDetails.videoPossibleUndoCount,
        'imagePossibleUndoCount': projectDetails.imagePossibleUndoCount,
        'videoPossibleRedoCount': projectDetails.videoPossibleRedoCount,
        'imagePossibleRedoCount': projectDetails.imagePossibleRedoCount,
        'curDisplayThumbnailFolType': projectDetails.curDisplayThumbnailFolType,
        'curDisplayThumbnailFolPtr': projectDetails.curDisplayThumbnailFolPtr,
        'curDisplayPreviewFolType': projectDetails.curDisplayPreviewFolType,
        'curDisplayPreviewFolPtr': projectDetails.curDisplayPreviewFolPtr,
        'curProcessingSourceFolType': projectDetails.curProcessingSourceFolType,
        'curProcessingSourceFolPtr': projectDetails.curProcessingSourceFolPtr,
        'curProcessingDestinationFolType': projectDetails.curProcessingDestinationFolType,
        'curProcessingDestinationFolPtr': projectDetails.curProcessingDestinationFolPtr,
        'curProcessingPreviewSourceFolType': projectDetails.curProcessingPreviewSourceFolType,
        'curProcessingPreviewSourceFolPtr': projectDetails.curProcessingPreviewSourceFolPtr,
        'curProcessingPreviewDestinationFolType': projectDetails.curProcessingPreviewDestinationFolType,
        'curProcessingPreviewDestinationFolPtr': projectDetails.curProcessingPreviewDestinationFolPtr,
        'operatePossibleOnVideoFlag': projectDetails.operatePossibleOnVideoFlag,
        'handoverPossibleImageToVideoFlag': projectDetails.handoverPossibleImageToVideoFlag,
        'processingGoingOnVideoOrFrameFlag': projectDetails.processingGoingOnVideoOrFrameFlag,
        'processingGoingOnVideoNotFrame': projectDetails.processingGoingOnVideoNotFrame,
        'refreshThumbnailFlag': projectDetails.refreshThumbnailFlag,
        'videoToFrameWarningPopUp': projectDetails.videoToFrameWarningPopUp,

    }
    let msgWithData = `${msg} - ${JSON.stringify(jsonData)}`;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    const logFileName = `${logfile}_${userId}_${year}-${month}-${day}.txt`;


    let ccavnueResponceStream = fs.createWriteStream("public/logs/" + logFileName, { flags: "a" });
    const message = `${moment(new Date()).format('YYYY-MM-DDTHH:mm:ss')} : ${msgWithData}\n`;
    ccavnueResponceStream.write(message, (error) => {
        if (error) {
            console.error('Error writing log:', error);
        } else {
            console.log('Log written successfully.');
        }
    });
};

module.exports = {
    logCreate,
    changePointer
}