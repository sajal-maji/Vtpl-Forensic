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
            console.log('Error writing log:', error);
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
    let jsonData = [1,msg,projectDetails.currentFrameId,projectDetails.undoVideoLimit,projectDetails.undoImageLimit,projectDetails.videoFolInPtr,projectDetails.imageFolInPtr,projectDetails.videoPossibleUndoCount,projectDetails.imagePossibleUndoCount,projectDetails.videoPossibleRedoCount,projectDetails.imagePossibleRedoCount,projectDetails.curDisplayThumbnailFolType,projectDetails.curDisplayThumbnailFolPtr,projectDetails.curDisplayPreviewFolType,projectDetails.curDisplayPreviewFolPtr,projectDetails.curProcessingSourceFolType,projectDetails.curProcessingSourceFolPtr,projectDetails.curProcessingDestinationFolType,projectDetails.curProcessingDestinationFolPtr,projectDetails.curProcessingPreviewSourceFolType,projectDetails.curProcessingPreviewSourceFolPtr,projectDetails.curProcessingPreviewDestinationFolType,projectDetails.curProcessingPreviewDestinationFolPtr,projectDetails.operatePossibleOnVideoFlag,projectDetails.handoverPossibleImageToVideoFlag,projectDetails.processingGoingOnVideoOrFrameFlag,projectDetails.processingGoingOnVideoNotFrameFlag,projectDetails.refreshThumbnailFlag,projectDetails.videoToFrameWarningPopUpFlag]
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
            console.log('Error writing log:', error);
        } else {
            console.log('Log written successfully.');
        }
    });
};

module.exports = {
    logCreate,
    changePointer
}