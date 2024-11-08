const Project = require('../model/projects.model');
const Casefolder = require('../model/casefolder.model');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fsExtra = require('fs-extra');
const { errorLogger } = require("../config/log.config");
const VideoFolderSet = 'video'
const ImageFolderSet = 'image'
const TempFolder = 'temp'
const logger = require("../helpers/logEvents");
const Imageoperation = require('../services/imageoperation.service');

const createProject = async (req, catId, projectName) => {
    let casefolder = await Casefolder.findById(catId);
    if (!casefolder) {
        casefolder = new Casefolder({
            folderName: 'anonymous',
            userId: req.user.id
        })
        await casefolder.save();
    }
    const project = new Project({
        projectName,
        catId: catId,
        catName: casefolder.folderName,
        userId: req.user.id,
    })
    await project.save();
    const basePath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${project.id}`;

    createFolder(`${basePath}/main`);
    createFolder(`${basePath}/snap`);
    createFolder(`${basePath}/temp/1`);

    for (let i = 1; i <= project.totalVideoFolderSet; i++) {
        const dynamicFolderName = `${basePath}/video/${i}`;
        createFolder(dynamicFolderName);
    }

    for (let i = 1; i <= project.totalImageFolderSet; i++) {
        const dynamicFolderNameImg = `${basePath}/image/${i}`;
        createFolder(dynamicFolderNameImg);
    }
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully created.'
    }
};

const resetPointer = async (userId, id, updateData) => {
    const projectDetails = await Project.findById(id);
    if (!projectDetails) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    const project = await Project.findByIdAndUpdate(id, updateData, { new: true });
    logger.changePointer(userId, id, 'RTH', 'pointerDetails');
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Update Successfully.'
    };
};

const updateProject = async (id, projectName) => {
    const projectDetails = await Project.findById(id);
    if (!projectDetails) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    const project = await Project.findByIdAndUpdate(id, {
        'projectName': projectName
    }, { new: true });

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Update Successfully.'
    };
};

const deleteProject = async (id) => {
    const project = await Project.findByIdAndDelete(id);
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Project not found',
        };
    }

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Project deleted successfully.',
    };
};

const projectList = async (req, catId) => {
    const project = await Project.find({ 'catId': catId }).sort({ updateAt: -1 });
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    let items = [];
    project.forEach((val) => {
        items.push(
            {
                'folderId': val.catId,
                'projectId': val.id,
                'curFrameId': val.currentFrameId,
                'srcFolType': VideoFolderSet,
                'srcFolPtr': val.videoFolInPtr,
                'dstFolType': ImageFolderSet,
                'dstFolPtr': val.imageFolInPtr,
                'videoToFrameWarmPopUp': val.videoToFrameWarningPopUp,
                'updateAt': project.updateAt,
                'basePath': `${req.user.id}/${val.id}/${VideoFolderSet}/${val.videoFolInPtr}/${(val.currentFrameId) ? val.currentFrameId : 'frame_1.png'}`
            }
        )
    });
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        data: items
    }
};

const projectDetails = async (req, id) => {
    const projectDetails = await Project.findById(id);
    if (!projectDetails) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    let isUndoPossible = false;
    let isSaveFramePossible = false;
    let isDiscardFramePossible = false;
    if (projectDetails.imagePossibleUndoCount > 0) {
        isUndoPossible = true;
        isSaveFramePossible = true;
        isDiscardFramePossible = true;
    } else if ((projectDetails.handoverPossibleImageToVideoFlag) && (projectDetails.videoPossibleUndoCount > 0)) {
        isUndoPossible = true;
    }

    let isRedoPossible = false;
    if ((projectDetails.handoverPossibleImageToVideoFlag) && (projectDetails.videoPossibleRedoCount > 0)) {
        isRedoPossible = true;
    } else if (projectDetails.imagePossibleRedoCount > 0) {
        isRedoPossible = true;
    }
    logger.logCreate(`project details: ${JSON.stringify(projectDetails)}`, 'systemlog');
    logger.changePointer(req.user.id, id, 'JOB 100', 'pointerDetails');
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        data: {
            'folderId': projectDetails.catId,
            'projectId': projectDetails.id,
            'curFrameId': (projectDetails.curDisplayPreviewFolType == 'temp') ? projectDetails.currentPreviewFrameId : projectDetails.currentFrameId,
            'isUndoPossible': isUndoPossible,
            'isRedoPossible': isRedoPossible,
            'isRedoPossible': isRedoPossible,
            'isSaveFramePossible': isSaveFramePossible,
            'isDiscardFramePossible': isDiscardFramePossible,
            'imageFolInPtr': projectDetails.imageFolInPtr,
            'videoFolInPtr': projectDetails.videoFolInPtr,
            'operatePossibleOnVideoFlag': projectDetails.operatePossibleOnVideoFlag,
            'curProcessingSourceFolType': projectDetails.curProcessingSourceFolType,
            'curProcessingSourceFolPtr': projectDetails.curProcessingSourceFolPtr,
            'curProcessingDestinationFolType': projectDetails.curProcessingDestinationFolType,
            'curProcessingDestinationFolPtr': projectDetails.curProcessingDestinationFolPtr,
            'curDisplayThumbnailFolType': projectDetails.curDisplayThumbnailFolType,
            'curDisplayThumbnailFolPtr': projectDetails.curDisplayThumbnailFolPtr,
            'curDisplayPreviewFolType': projectDetails.curDisplayPreviewFolType,
            'curDisplayPreviewFolPtr': projectDetails.curDisplayPreviewFolPtr,
            'videoToFrameWarningPopUp': projectDetails.videoToFrameWarningPopUp,
            'handoverPossibleImageToVideoFlag': projectDetails.handoverPossibleImageToVideoFlag,
            'videoPossibleRedoCount': projectDetails.videoPossibleRedoCount,
            'videoPossibleUndoCount': projectDetails.videoPossibleUndoCount,
            'imagePossibleUndoCount': projectDetails.imagePossibleUndoCount,
            'imagePossibleRedoCount': projectDetails.imagePossibleRedoCount,
            'framePath': `${req.user.id}/${id}/${projectDetails.curDisplayPreviewFolType}/${(projectDetails.curDisplayPreviewFolType && projectDetails.curDisplayPreviewFolPtr > 0) ? projectDetails.curDisplayPreviewFolPtr : 1}`,
            'basePath': `${req.user.id}/${id}/${projectDetails.curDisplayThumbnailFolType}/${(projectDetails.curDisplayThumbnailFolPtr && projectDetails.curDisplayThumbnailFolPtr > 0) ? projectDetails.curDisplayThumbnailFolPtr : 1}`,
            'projectDetails': JSON.parse(projectDetails.projectDetails),
            'filesName': (projectDetails.filesName) ? JSON.parse(projectDetails.filesName) : '',
        }
    };
};

const applyUndoAction = async (id, userId, requestObj) => {
    const project = await Project.findById(id);
    if (!project) {
        return ({
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        });
    };
    let imagePossibleUndoCount = project.imagePossibleUndoCount;
    let imagePossibleRedoCount = project.imagePossibleRedoCount;
    let videoPossibleUndoCount = project.videoPossibleUndoCount;
    let videoPossibleRedoCount = project.videoPossibleRedoCount;
    let imageFolInPtr = project.imageFolInPtr;
    let videoFolInPtr = project.videoFolInPtr;
    let curDisplayPreviewFolType = project.curDisplayPreviewFolType;
    let curDisplayPreviewFolPtr = project.curDisplayPreviewFolPtr;
    let curProcessingPreviewSourceFolType = project.curProcessingPreviewSourceFolType;
    let curProcessingPreviewSourceFolPtr = project.curProcessingPreviewSourceFolPtr;
    let curProcessingPreviewDestinationFolType = project.curProcessingPreviewDestinationFolType;
    let curProcessingPreviewDestinationFolPtr = project.curProcessingPreviewDestinationFolPtr;
    let curDisplayThumbnailFolType = project.curDisplayThumbnailFolType;
    let curDisplayThumbnailFolPtr = project.curDisplayThumbnailFolPtr
    let refreshThumbnailFlag = project.refreshThumbnailFlag;

    if (project.imagePossibleUndoCount > 1) {
        imagePossibleUndoCount = project.imagePossibleUndoCount - 1;
        imagePossibleRedoCount = project.imagePossibleRedoCount + 1;
        imageFolInPtr = (((project.imageFolInPtr - 2) + project.totalImageFolderSet) % project.totalImageFolderSet) + 1

        curDisplayPreviewFolType = ImageFolderSet;
        curDisplayPreviewFolPtr = imageFolInPtr;

        curProcessingPreviewSourceFolType = ImageFolderSet;
        curProcessingPreviewSourceFolPtr = imageFolInPtr;

        curProcessingPreviewDestinationFolType = TempFolder;
        curProcessingPreviewDestinationFolPtr = 1;

        refreshThumbnailFlag = false;

        let projectUpdate = await Project.findByIdAndUpdate(id, {
            imagePossibleUndoCount,
            imagePossibleRedoCount,
            videoPossibleUndoCount,
            videoPossibleRedoCount,
            imageFolInPtr,
            videoFolInPtr,
            curDisplayPreviewFolType,
            curDisplayPreviewFolPtr,
            curProcessingPreviewSourceFolType,
            curProcessingPreviewSourceFolPtr,
            curProcessingPreviewDestinationFolType,
            curProcessingPreviewDestinationFolPtr,
            curDisplayThumbnailFolType,
            curDisplayThumbnailFolPtr,
            refreshThumbnailFlag
        }, { new: true });

    } else if (project.imagePossibleUndoCount == 1) {
        if (project.handoverPossibleImageToVideoFlag) {
            imagePossibleUndoCount = 0
            imagePossibleRedoCount = project.imagePossibleRedoCount + 1;

            curDisplayThumbnailFolType = VideoFolderSet;
            curDisplayThumbnailFolPtr = project.videoFolInPtr;

            curDisplayPreviewFolType = VideoFolderSet;
            curDisplayPreviewFolPtr = project.videoFolInPtr;

            curProcessingPreviewSourceFolType = VideoFolderSet;
            curProcessingPreviewSourceFolPtr = project.videoFolInPtr;

            curProcessingPreviewDestinationFolType = TempFolder;
            curProcessingPreviewDestinationFolPtr = 1;

            refreshThumbnailFlag = false
        } else {
            imagePossibleUndoCount = project.imagePossibleUndoCount - 1;
            imagePossibleRedoCount = project.imagePossibleRedoCount + 1;
            videoPossibleRedoCount = project.videoPossibleRedoCount
            imageFolInPtr = (((project.imageFolInPtr - 2) + project.totalImageFolderSet) % project.totalImageFolderSet) + 1;

            curDisplayPreviewFolType = ImageFolderSet;
            curDisplayPreviewFolPtr = imageFolInPtr;

            curProcessingPreviewSourceFolType = ImageFolderSet;
            curProcessingPreviewSourceFolPtr = imageFolInPtr;

            curProcessingPreviewDestinationFolType = TempFolder;
            curProcessingPreviewDestinationFolPtr = 1;
            refreshThumbnailFlag = false
        }
        let projectUpdate = await Project.findByIdAndUpdate(id, {
            imagePossibleUndoCount,
            imagePossibleRedoCount,
            videoPossibleUndoCount,
            videoPossibleRedoCount,
            imageFolInPtr,
            videoFolInPtr,
            curDisplayPreviewFolType,
            curDisplayPreviewFolPtr,
            curProcessingPreviewSourceFolType,
            curProcessingPreviewSourceFolPtr,
            curProcessingPreviewDestinationFolType,
            curProcessingPreviewDestinationFolPtr,
            curDisplayThumbnailFolType,
            curDisplayThumbnailFolPtr,
            refreshThumbnailFlag
        }, { new: true });
    } else {
        if ((project.handoverPossibleImageToVideoFlag) && (project.videoPossibleUndoCount > 0)) {
            videoPossibleUndoCount = project.videoPossibleUndoCount - 1;
            videoPossibleRedoCount = project.videoPossibleRedoCount + 1;
            videoFolInPtr = (((project.videoFolInPtr - 2) + project.totalVideoFolderSet) % project.totalVideoFolderSet) + 1;

            curDisplayThumbnailFolType = VideoFolderSet;
            curDisplayThumbnailFolPtr = videoFolInPtr;

            curDisplayPreviewFolType = VideoFolderSet;
            curDisplayPreviewFolPtr = videoFolInPtr;

            curProcessingPreviewSourceFolType = VideoFolderSet;
            curProcessingPreviewSourceFolPtr = videoFolInPtr;

            curProcessingPreviewDestinationFolType = TempFolder;
            curProcessingPreviewDestinationFolPtr = 1;

            refreshThumbnailFlag = true

            let projectUpdate = await Project.findByIdAndUpdate(id, {
                imagePossibleUndoCount,
                imagePossibleRedoCount,
                videoPossibleUndoCount,
                videoPossibleRedoCount,
                imageFolInPtr,
                videoFolInPtr,
                curDisplayPreviewFolType,
                curDisplayPreviewFolPtr,
                curProcessingPreviewSourceFolType,
                curProcessingPreviewSourceFolPtr,
                curProcessingPreviewDestinationFolType,
                curProcessingPreviewDestinationFolPtr,
                curDisplayThumbnailFolType,
                curDisplayThumbnailFolPtr,
                refreshThumbnailFlag
            }, { new: true });
        }
    }
    const oppData = {
        projectId: id,
        processType: 'undo',
        processName: 'undo',
        exeDetailsAvailFlag: (requestObj) ? true : false,
        exeDetails: JSON.stringify(requestObj)
    }
    await Imageoperation.createOperation(req, oppData)
    logger.changePointer(userId, id, 'UN', 'pointerDetails');
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.'
    };
};

const applyRedoAction = async (id, userId, requestObj) => {
    const project = await Project.findById(id);
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    let imagePossibleUndoCount = project.imagePossibleUndoCount;
    let imagePossibleRedoCount = project.imagePossibleRedoCount;
    let videoPossibleUndoCount = project.videoPossibleUndoCount;
    let videoPossibleRedoCount = project.videoPossibleRedoCount;
    let curDisplayThumbnailFolType = project.curDisplayThumbnailFolType;
    let curDisplayThumbnailFolPtr = project.curDisplayThumbnailFolPtr;
    let curDisplayPreviewFolType = project.curDisplayPreviewFolType;
    let curDisplayPreviewFolPtr = project.curDisplayPreviewFolPtr;
    let curProcessingPreviewSourceFolType = project.curProcessingPreviewSourceFolType
    let curProcessingPreviewSourceFolPtr = project.curProcessingPreviewSourceFolPtr
    let curProcessingPreviewDestinationFolType = project.curProcessingPreviewDestinationFolType
    let curProcessingPreviewDestinationFolPtr = project.curProcessingPreviewDestinationFolPtr
    let refreshThumbnailFlag = project.refreshThumbnailFlag;
    let videoFolInPtr = project.videoFolInPtr



    if (project.videoPossibleRedoCount > 0) {
        videoPossibleRedoCount = project.videoPossibleRedoCount - 1
        videoPossibleUndoCount = project.videoPossibleUndoCount + 1
        videoFolInPtr = (project.videoFolInPtr % project.totalVideoFolderSet) + 1

        curDisplayThumbnailFolType = VideoFolderSet
        curDisplayThumbnailFolPtr = videoFolInPtr
        curDisplayPreviewFolType = VideoFolderSet
        curDisplayPreviewFolPtr = videoFolInPtr

        curProcessingPreviewSourceFolType = VideoFolderSet
        curProcessingPreviewSourceFolPtr = videoFolInPtr
        curProcessingPreviewDestinationFolType = TempFolder
        curProcessingPreviewDestinationFolPtr = 1

        refreshThumbnailFlag = true;

        let projectDetails = await Project.findByIdAndUpdate(id, {
            imagePossibleUndoCount,
            imagePossibleRedoCount,
            videoPossibleUndoCount,
            videoPossibleRedoCount,
            videoFolInPtr,
            curDisplayThumbnailFolType,
            curDisplayThumbnailFolPtr,
            curDisplayPreviewFolType,
            curDisplayPreviewFolPtr,
            curProcessingPreviewSourceFolType,
            curProcessingPreviewSourceFolPtr,
            curProcessingPreviewDestinationFolType,
            curProcessingPreviewDestinationFolPtr,
            refreshThumbnailFlag
        }, { new: true });
    } else if (project.imagePossibleRedoCount > 0) {
        if (project.handoverPossibleImageToVideoFlag && (project.imagePossibleUndoCount == 0)) {
            imageFolInPtr = 1
            imagePossibleUndoCount = 1
            imagePossibleRedoCount = project.imagePossibleRedoCount - 1
            videoPossibleRedoCount = 0

            curDisplayPreviewFolType = ImageFolderSet
            curDisplayPreviewFolPtr = imageFolInPtr

            curProcessingPreviewSourceFolType = ImageFolderSet
            curProcessingPreviewSourceFolPtr = imageFolInPtr
            curProcessingPreviewDestinationFolType = TempFolder
            curProcessingPreviewDestinationFolPtr = 1

            refreshThumbnailFlag = false;

            let projectDetails = await Project.findByIdAndUpdate(id, {
                imagePossibleUndoCount,
                imagePossibleRedoCount,
                videoPossibleUndoCount,
                videoPossibleRedoCount,
                videoFolInPtr,
                imageFolInPtr,
                curDisplayThumbnailFolType,
                curDisplayThumbnailFolPtr,
                curDisplayPreviewFolType,
                curDisplayPreviewFolPtr,
                curProcessingPreviewSourceFolType,
                curProcessingPreviewSourceFolPtr,
                curProcessingPreviewDestinationFolType,
                curProcessingPreviewDestinationFolPtr,
                refreshThumbnailFlag
            }, { new: true });
        } else {
            imagePossibleRedoCount = project.imagePossibleRedoCount - 1
            imagePossibleUndoCount = project.imagePossibleUndoCount + 1
            imageFolInPtr = (project.imageFolInPtr % project.totalImageFolderSet) + 1

            curDisplayPreviewFolType = ImageFolderSet
            curDisplayPreviewFolPtr = imageFolInPtr

            curProcessingPreviewSourceFolType = ImageFolderSet
            curProcessingPreviewSourceFolPtr = imageFolInPtr
            curProcessingPreviewDestinationFolType = TempFolder
            curProcessingPreviewDestinationFolPtr = 1

            refreshThumbnailFlag = false;

            let projectDetails = await Project.findByIdAndUpdate(id, {
                imagePossibleUndoCount,
                imagePossibleRedoCount,
                videoPossibleUndoCount,
                videoPossibleRedoCount,
                videoFolInPtr,
                imageFolInPtr,
                curDisplayThumbnailFolType,
                curDisplayThumbnailFolPtr,
                curDisplayPreviewFolType,
                curDisplayPreviewFolPtr,
                curProcessingPreviewSourceFolType,
                curProcessingPreviewSourceFolPtr,
                curProcessingPreviewDestinationFolType,
                curProcessingPreviewDestinationFolPtr,
                refreshThumbnailFlag
            }, { new: true });
        }
    }
    const oppData = {
        projectId: id,
        processType: 'redo',
        processName: 'redo',
        exeDetailsAvailFlag: (requestObj) ? true : false,
        exeDetails: JSON.stringify(requestObj)
    }
    await Imageoperation.createOperation(req, oppData)
    logger.changePointer(userId, id, 'RE', 'pointerDetails');
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.'
    };
};

const selectThumbnailFrame = async (req, id, frameId) => {
    const project = await Project.findById(id);
    const rootPath = `${req.user.id}/${id}`;
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    let currentFrameId = frameId;
    let imagePossibleUndoCount = 0;
    let videoPossibleRedoCount = 0;
    let imagePossibleRedoCount = 0;
    let curDisplayThumbnailFolType = VideoFolderSet;
    let curDisplayThumbnailFolPtr = project.videoFolInPtr;
    let curDisplayPreviewFolType = VideoFolderSet;
    let curDisplayPreviewFolPtr = project.videoFolInPtr;
    let curProcessingPreviewSourceFolType = VideoFolderSet;
    let curProcessingPreviewSourceFolPtr = project.videoFolInPtr;
    let curProcessingPreviewDestinationFolType = TempFolder;
    let curProcessingPreviewDestinationFolPtr = 1;
    let operatePossibleOnVideoFlag = true;
    let handoverPossibleImageToVideoFlag = true;
    let refreshThumbnailFlag = false;

    const projectUpdate = await Project.findByIdAndUpdate(id, {
        currentFrameId,
        imagePossibleUndoCount,
        videoPossibleRedoCount,
        imagePossibleRedoCount,
        curDisplayThumbnailFolType,
        curDisplayThumbnailFolPtr,
        curDisplayPreviewFolType,
        curDisplayPreviewFolPtr,
        curProcessingPreviewSourceFolType,
        curProcessingPreviewSourceFolPtr,
        curProcessingPreviewDestinationFolType,
        curProcessingPreviewDestinationFolPtr,
        operatePossibleOnVideoFlag,
        handoverPossibleImageToVideoFlag,
        refreshThumbnailFlag,
    }, { new: true });
    logger.changePointer(req.user.id, id, 'TNL', 'pointerDetails');
    logger.logCreate(`selectThumbnailFrame: Updated project details : ${projectUpdate}`, 'systemlog');

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        data: {
            'folderId': projectUpdate.catId,
            'projectId': projectUpdate.id,
            'curFrameId': projectUpdate.currentFrameId,
            'srcFolType': ImageFolderSet,
            'srcFolPtr': projectUpdate.imageFolInPtr,
            'videoToFrameWarmPopUp': true,
        }
    };
};

const discardImage = async (id) => {
    const project = await Project.findById(id);
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    if (project.imagePossibleUndoCount > 0) {
        let imagePossibleUndoCount = 0
        let videoPossibleRedoCount = 0
        let imagePossibleRedoCount = 0
        let curDisplayThumbnailFolType = VideoFolderSet
        let curDisplayThumbnailFolPtr = project.videoFolInPtr
        let curDisplayPreviewFolType = VideoFolderSet
        let curDisplayPreviewFolPtr = project.videoFolInPtr
        let curProcessingPreviewSourceFolType = VideoFolderSet
        let curProcessingPreviewSourceFolPtr = project.videoFolInPtr
        let curProcessingPreviewDestinationFolType = TempFolder
        let curProcessingPreviewDestinationFolPtr = 1
        let operatePossibleOnVideoFlag = true
        let handoverPossibleImageToVideoFlag = true
        let refreshThumbnailFlag = false

        const projectUpdate = await Project.findByIdAndUpdate(id, {
            imagePossibleUndoCount,
            videoPossibleRedoCount,
            imagePossibleRedoCount,
            curDisplayThumbnailFolType,
            curDisplayThumbnailFolPtr,
            curDisplayPreviewFolType,
            curDisplayPreviewFolPtr,
            curProcessingPreviewSourceFolType,
            curProcessingPreviewSourceFolPtr,
            curProcessingPreviewDestinationFolType,
            curProcessingPreviewDestinationFolPtr,
            operatePossibleOnVideoFlag,
            handoverPossibleImageToVideoFlag,
            refreshThumbnailFlag
        }, { new: true });

        return {
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.'
        };
    } else {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Image discard not possible as undo count disable'
        };
    }
};

const saveImage = async (req, id) => {
    const project = await Project.findById(id);
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    const rootPath = `${req.user.id}/${id}`;

    fsExtra.copy(`public/${rootPath}/${project.curDisplayPreviewFolType}/${project.curDisplayPreviewFolPtr}/${project.currentFrameId}`, `public/${rootPath}/snap/${project.currentFrameId}`, (err) => {
        if (err) {
            console.log('Error copying the file:', err);
        } else {
            console.log('Snap File copied successfully.');
        }
    });

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.'
    };
};

function createFolder(folderPath) {
    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
            return console.error(`Error creating folder: ${err.message}`);
        }
    });
};



module.exports = {
    createProject,
    updateProject,
    deleteProject,
    projectList,
    projectDetails,
    selectThumbnailFrame,
    applyUndoAction,
    applyRedoAction,
    discardImage,
    saveImage,
    resetPointer
};