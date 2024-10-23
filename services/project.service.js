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
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        data: {
            'folderId': projectDetails.catId,
            'projectId': projectDetails.id,
            'curFrameId': projectDetails.currentFrameId,
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
            'framePath': `${req.user.id}/${id}/${projectDetails.curFrameFolType}/${(projectDetails.curFrameFolPtr && projectDetails.curFrameFolPtr > 0) ? projectDetails.curFrameFolPtr : 1}`,
            'basePath': `${req.user.id}/${id}/${projectDetails.curThumbFolType}/${(projectDetails.curThumbFolPtr && projectDetails.curThumbFolPtr > 0) ? projectDetails.curThumbFolPtr : 1}`,
            'projectDetails': JSON.parse(projectDetails.projectDetails),
            'filesName': (projectDetails.filesName) ? JSON.parse(projectDetails.filesName) : '',
        }
    };
};

const applyUndoAction = async (id) => {
    const project = await Project.findById(id);
    if (!project) {
        return ({
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        });
    };
    let imagePossibleUndoCount = 0;
    let imagePossibleRedoCount = 0;
    let videoPossibleUndoCount = 0;
    let videoPossibleRedoCount = 0;
    let imageFolInPtr = '';
    let videoFolInPtr = '';
    let curDisplayPreviewFolType = '';
    let curDisplayPreviewFolPtr = '';
    let curProcessingPreviewSourceFolType = '';
    let curProcessingPreviewSourceFolPtr = '';
    let curProcessingPreviewDestinationFolType = '';
    let curProcessingPreviewDestinationFolPtr = '';
    let curDisplayThumbnailFolType = '';
    let curDisplayThumbnailFolPtr = ''
    let refreshThumbnailFlag = false;

    if (project.imagePossibleUndoCount > 1) {
        imagePossibleUndoCount = project.imagePossibleUndoCount--;
        imagePossibleRedoCount = project.imagePossibleRedoCount++;
        imageFolInPtr = ((project.imageFolInPtr - 2 + project.totalImageFolderSet) % project.totalImageFolderSet) + 1

        curDisplayPreviewFolType = ImageFolderSet;
        curDisplayPreviewFolPtr = imageFolInPtr;

        curProcessingPreviewSourceFolType = ImageFolderSet;
        curProcessingPreviewSourceFolPtr = imageFolInPtr;

        curProcessingPreviewDestinationFolType = TempFolder;
        curProcessingPreviewDestinationFolPtr = 1;
    } else if (project.imagePossibleUndoCount == 1) {
        if (project.handoverPossibleImageToVideoFlag) {
            videoFolInPtr = ((project.videoFolInPtr - 2 + project.totalVideoFolderSet) % project.totalVideoFolderSet) + 1;
            imagePossibleRedoCount = project.imagePossibleRedoCount++;

            curDisplayThumbnailFolType = VideoFolderSet;
            curDisplayThumbnailFolPtr = videoFolInPtr;

            curDisplayPreviewFolType = VideoFolderSet;
            curDisplayPreviewFolPtr = videoFolInPtr;

            curProcessingPreviewSourceFolType = VideoFolderSet;
            curProcessingPreviewSourceFolPtr = videoFolInPtr;

            curProcessingPreviewDestinationFolType = TempFolder;
            curProcessingPreviewDestinationFolPtr = 1;
        } else {
            imagePossibleUndoCount = project.imagePossibleUndoCount--;
            imagePossibleRedoCount = project.imagePossibleRedoCount++;
            videoPossibleRedoCount = project.videoPossibleRedoCount
            imageFolInPtr = ((project.imageFolInPtr - 2 + project.totalImageFolderSet) % project.totalImageFolderSet) + 1;

            curDisplayPreviewFolType = ImageFolderSet;
            curDisplayPreviewFolPtr = imageFolInPtr;

            curProcessingPreviewSourceFolType = ImageFolderSet;
            curProcessingPreviewSourceFolPtr = imageFolInPtr;

            curProcessingPreviewDestinationFolType = TempFolder;
            curProcessingPreviewDestinationFolPtr = 1;
        }
    } else {
        if ((project.handoverPossibleImageToVideoFlag) && (project.videoPossibleUndoCount > 0)) {
            videoPossibleUndoCount = project.videoPossibleUndoCount--;
            videoPossibleRedoCount = project.videoPossibleRedoCount++;
            videoFolInPtr = ((project.videoFolInPtr - 2 + project.totalVideoFolderSet) % project.totalVideoFolderSet) + 1;

            curDisplayThumbnailFolType = VideoFolderSet;
            curDisplayThumbnailFolPtr = videoFolInPtr;

            curDisplayPreviewFolType = VideoFolderSet;
            curDisplayPreviewFolPtr = videoFolInPtr;

            curProcessingPreviewSourceFolType = VideoFolderSet;
            curProcessingPreviewSourceFolPtr = videoFolInPtr;

            curProcessingPreviewDestinationFolType = TempFolder;
            curProcessingPreviewDestinationFolPtr = 1;
        }
    }

    const projectUpdate = await Project.findByIdAndUpdate(id, {
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
        'refreshThumbnail': refreshThumbnailFlag
    }, { new: true });
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.'
    };
};

const applyRedoAction = async (id) => {
    const project = await Project.findById(id);
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    let imagePossibleUndoCount = 1;
    let imagePossibleRedoCount = 0;
    let videoPossibleUndoCount = 0;
    let videoPossibleRedoCount = 0;
    let imageFolInPtr = (project.imageFolInPtr % project.totalImageFolderSet) + 1;
    let curDisplayThumbnailFolType = '';
    let curDisplayThumbnailFolPtr = 0;
    let curDisplayPreviewFolType = '';
    let curDisplayPreviewFolPtr = 0;
    let curProcessingPreviewSourceFolType = '';
    let curProcessingPreviewSourceFolPtr = 0;
    let curProcessingPreviewDestinationFolType = '';
    let curProcessingPreviewDestinationFolPtr = 0;
    let refreshThumbnailFlag = false;



    if (project.imagePossibleRedoCount > 0) {
        if (project.handoverPossibleImageToVideoFlag && (project.imagePossibleUndoCount == 0)) {
            imagePossibleRedoCount = project.imagePossibleRedoCount--;
            curDisplayPreviewFolType = ImageFolderSet;
            curDisplayPreviewFolPtr = imageFolInPtr;

            curProcessingPreviewSourceFolType = ImageFolderSet;
            curProcessingPreviewSourceFolPtr = imageFolInPtr;

            curProcessingPreviewDestinationFolType = TempFolder;
            curProcessingPreviewDestinationFolPtr = 1;
        } else {
            imagePossibleRedoCount = project.imagePossibleRedoCount--;
            imagePossibleUndoCount = project.imagePossibleUndoCount++;

            curDisplayPreviewFolType = ImageFolderSet;
            curDisplayPreviewFolPtr = imageFolInPtr;

            curProcessingPreviewSourceFolType = ImageFolderSet;
            curProcessingPreviewSourceFolPtr = imageFolInPtr;

            curProcessingPreviewDestinationFolType = TempFolder;
            curProcessingPreviewDestinationFolPtr = 1;
        }
    } else if (project.handoverPossibleImageToVideoFlag && (project.videoPossibleRedoCount > 0)) {
        videoPossibleRedoCount = project.videoPossibleRedoCount--;
        videoPossibleUndoCount = project.videoPossibleUndoCount++;

        curDisplayThumbnailFolType = VideoFolderSet;
        curDisplayThumbnailFolPtr = videoFolInPtr;

        curDisplayPreviewFolType = VideoFolderSet;
        curDisplayPreviewFolPtr = videoFolInPtr;

        curProcessingPreviewSourceFolType = VideoFolderSet;
        curProcessingPreviewSourceFolPtr = videoFolInPtr;

        curProcessingPreviewDestinationFolType = TempFolder;
        curProcessingPreviewDestinationFolPtr = 1;

        refreshThumbnailFlag = true;
    }
    await Project.findByIdAndUpdate(id, {
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
    let curDisplayThumbnailFolPtr = videoFolInPtr;
    let curDisplayPreviewFolType = VideoFolderSet;
    let curDisplayPreviewFolPtr = videoFolInPtr;
    let curProcessingPreviewSourceFolType = VideoFolderSet;
    let curProcessingPreviewSourceFolPtr = videoFolInPtr;
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
        let curDisplayThumbnailFolPtr = videoFolInPtr
        let curDisplayPreviewFolType = VideoFolderSet
        let curDisplayPreviewFolPtr = videoFolInPtr
        let curProcessingPreviewSourceFolType = VideoFolderSet
        let curProcessingPreviewSourceFolPtr = videoFolInPtr
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
            message: 'Image undo not possible'
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
    const imagePossibleUndoCount = 0
    const videoPossibleRedoCount = 0
    const imagePossibleRedoCount = 0
    const operatePossibleOnVideoFlag = true
    const handoverPossibleImageToVideoFlag = true

    const rootPath = `${req.user.id}/${id}`;

    fsExtra.copy(`public/${rootPath}/${ImageFolderSet}/${project.imageFolInPtr}/${project.currentFrameId}.png`, `public/${rootPath}/snap/${project.currentFrameId}.png`, (err) => {
        if (err) {
            console.log('Error copying the file:', err);
        } else {
            console.log('Snap File copied successfully.');
        }
    });

    for (var i = 1; i <= project.totalImageFolderSet; i++) {
        const sourcePath = `public/${rootPath}/${VideoFolderSet}/${i}/${project.currentFrameId}.png`;
        const destPath = `public/${rootPath}/${ImageFolderSet}/${i}/${project.currentFrameId}.png`;
        if (fs.existsSync(sourcePath)) {
            fsExtra.copy(sourcePath, destPath, (err) => {
                if (err) {
                    console.error('Error copying the file:', err);
                } else {
                    console.log(sourcePath);
                }
            });
        } else {
            console.log(`File not found: ${sourcePath}`);
        }
    }

    const projectUpdate = await Project.findByIdAndUpdate(id, {
        imagePossibleUndoCount,
        videoPossibleRedoCount,
        imagePossibleRedoCount,
        operatePossibleOnVideoFlag,
        handoverPossibleImageToVideoFlag,
        'srcFolType': VideoFolderSet,
        'srcFolPtr': projectUpdate.videoFolInPtr,
        'refreshThumbnail': false,
    }, { new: true });

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
    saveImage
};