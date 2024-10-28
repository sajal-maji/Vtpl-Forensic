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

const changePointer = async function (id, msg, logfile = 'systemlog.text') {
    const projectDetails = await Project.findById(id);
    if (!projectDetails) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    let jsonData = {
        'currentFrameId': projectDetails.currentFrameId,
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
        'videoPossibleUndoCount': projectDetails.videoPossibleUndoCount,
        'videoPossibleRedoCount': projectDetails.videoPossibleRedoCount,
        'imagePossibleUndoCount': projectDetails.imagePossibleUndoCount,
        'imagePossibleRedoCount': projectDetails.imagePossibleRedoCount,
    }
    let msgWithData = `${msg} - ${JSON.stringify(jsonData)}`;
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');

    const logFileName = `${logfile}_${year}-${month}-${day}.txt`;


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