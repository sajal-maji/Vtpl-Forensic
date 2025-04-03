const fs = require("fs");
const moment = require('moment');
const Project = require('../model/projects.model');

const createGlobalLogs = async function (logLevel = 'INFO', logMessage) {
    const http = require("http");

const data = JSON.stringify({
    userName : process.env.LOG_USER_NAME,
    password :process.env.LOG_PASSWORD,
    "moduleName":process.env.LOG_MODULE_NAME,
    "moduleVersion":process.env.LOG_MODULE_VERSION,
    "logLevel":logLevel,
    "logMessage":logMessage
});

const options = {
    hostname: process.env.LOG_HOST_NAME,
    port: process.env.LOG_PORT,
    path: "/createlog",
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length
    }
};

const req = http.request(options, res => {
    let responseData = "";
    res.on("data", chunk => {
        responseData += chunk;
    });
    res.on("end", () => {
        console.log("Response:", responseData);
    });
});

req.on("error", error => {
    console.error("Error:", error.message);
});

req.write(data);
req.end();

};

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
    createGlobalLogs,
    changePointer
}