const Project = require('../model/projects.model');
const User = require('../model/user.model');
const Casefolder = require('../model/casefolder.model');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fsExtra = require('fs-extra');
const { errorLogger } = require("../config/log.config");
const VideoFolderSet = 'video'
const ImageFolderSet = 'image'
const TempFolderSet = 'temp'
const logger = require("../helpers/logEvents");
const Imageoperation = require('../services/imageoperation.service');
const moment = require('moment');

const createProject = async (req, catId, projectName) => {
    let casefolder = await Casefolder.findById(catId);
    if (!casefolder) {
        const totalCount = await Casefolder.countDocuments({ userId: req.user.id });
        casefolder = new Casefolder({
            folderName: `Case Folder ${totalCount + 1}`,
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


const deleteProject = async (req,id) => {
    const checkProject = await Project.findOne({ _id: id,status:'deleted'});
    if(checkProject){
        const project = await Project.findByIdAndDelete(id);
        if (!project) {
            return {
                statusCode: 404,
                status: 'Failed',
                message: 'Project not found',
            };
        }

        const rootPath = `${req.user.id}/${id}`;
        const operationPath = `public/${rootPath}`
        await removeFolder(operationPath);

        return {
            statusCode: 200,
            status: 'Success',
            message: 'Project successfully deleted.',
        };

    }else{
        const casefolderRecyle = await Casefolder.findOne({ 'userId': req.user.id,slag: 'recyclebin' });
        const catId=casefolderRecyle.id
        const project = await Project.findByIdAndUpdate(id,{'status':'deleted','catId':catId}, { new: true });
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
            message: 'Project successfully moved to recycle bin',
        };

    }
    
};

async function removeFolder(operationPath) {
    fsExtra.remove(operationPath, (removeErr) => {
        if (removeErr) {
            logger.logCreate(`deleteimage: response ${removeErr}`, 'systemlog');
        } else {
            logger.logCreate(`deleteimage: response success`, 'systemlog');
        }
    });
}

const imageCompair = async (req,id) => {
    
    const project = await Project.findById(id);
    // console.log(project)
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    
    const rootPath = `${req.user.id}/${id}`;

    return {
        statusCode: 200,
        status: 'Success',
        orginalImgPath:`${rootPath}/main`,
        previousImgPath:`${rootPath}/${project.curProcessingPreviewSourceFolType}/${project.curProcessingPreviewSourceFolPtr}`,
        message: 'Successfully authenticated.'
    };
};

const projectList = async (req, catId,keyword=null,sort) => {
    
    // if(keyword!=''){
    //     let projects = await Project.find({ 'catId': catId , projectName: { $regex: 'keyword', $options: 'i' } })
    //     .sort({ updateAt: -1 });
    // }else{
    //     let project = await Project.find({ 'catId': catId }).sort({ updateAt: -1 });
    // }
    
    let query = { catId: catId };
    const sortOrder = sort === 'asc' ? 1 : -1;
    // Add the "like" query conditionally
    if (typeof keyword === 'string' && keyword.trim() !== '') {
        query.projectName = { $regex: keyword, $options: 'i' };
    }

    const folderDetails = await Casefolder.findById(catId).select('folderName slag');
    if(folderDetails && folderDetails.slag=='recyclebin')
    query.status='deleted'
    else
    query.status='active'

        
    let project = await Project.find(query).sort({ updatedAt: sortOrder });

    
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    let items = [];
    let sizes = [];
    // const folderSize = getFolderSize(folderPath);
        // console.log(`Total size of folder and subfolders: ${formatSize(folderSize)}`);
    project.forEach((val, index) => {
        const formattedUpdatedAt = moment(val.updatedAt).format('YYYY-MM-DD HH:mm:ss');
        let folderPath = `public/${req.user.id}/${val.id}`;
        let folderSize = getFolderSize(folderPath);
        sizes.push(folderSize)
        items.push(
            {
                'folderId': val.catId,
                folderName: folderDetails?.folderName === 'anonymous' ? `Case Folder ${index + 1}` : folderDetails?.folderName || 'Unknown Folder',
                'projectId': val.id,
                'projectName':val.projectName,
                'projectSize':formatSize(folderSize),
                'curFrameId': val.currentFrameId,
                'srcFolType': VideoFolderSet,
                'srcFolPtr': val.videoFolInPtr,
                'dstFolType': ImageFolderSet,
                'dstFolPtr': val.imageFolInPtr,
                'videoToFrameWarningPopUpFlag': val.videoToFrameWarningPopUpFlag,
                'updatedAt': formattedUpdatedAt,
                'basePath': `${req.user.id}/${val.id}/${VideoFolderSet}/${(val.curDisplayThumbnailFolPtr > 0) ? val.curDisplayThumbnailFolPtr : 1}/${(val.currentFrameId) ? val.currentFrameId : 'frame_000001.jpg'}`
            }
        )
    });
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        data: {
            folderId:folderDetails?.id,
            folderName: folderDetails?.folderName,
            folderSize: formatSize(sizes.reduce((sum, size) => sum + size, 0)),
            projectList:items
        }
    }
};

function getFolderSize(folderPath) {
    let totalSize = 0;

    // Read the contents of the directory
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stats = fs.statSync(filePath);

        // If it's a directory, recursively calculate its size
        if (stats.isDirectory()) {
            totalSize += getFolderSize(filePath);
        } else {
            // Add file size
            totalSize += stats.size;
        }
    }

    return totalSize;
}

function formatSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const power = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
    return (bytes / Math.pow(1024, power)).toFixed(2) + ' ' + units[power];
}

const deletedProjectList = async (req, catId,keyword=null,sort) => {
    
    let query = { status: 'deleted' };
    if(catId){
        query.catId = catId;
    }
     
    const sortOrder = sort === 'asc' ? 1 : -1;
    // Add the "like" query conditionally
    if (typeof keyword === 'string' && keyword.trim() !== '') {
        query.projectName = { $regex: keyword, $options: 'i' };
    }
    let project = await Project.find(query).sort({ updatedAt: sortOrder });

    const folderDetails = await Casefolder.findById(catId).select('folderName');
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    let items = [];
    project.forEach((val, index) => {
        const formattedUpdatedAt = moment(val.updatedAt).format('YYYY-MM-DD HH:mm:ss');
        items.push(
            {
                'folderId': val.catId,
                folderName: folderDetails?.folderName === 'anonymous' ? `Case Folder ${index + 1}` : folderDetails?.folderName || 'Unknown Folder',
                'projectId': val.id,
                'projectName':val.projectName,
                'curFrameId': val.currentFrameId,
                'srcFolType': VideoFolderSet,
                'srcFolPtr': val.videoFolInPtr,
                'dstFolType': ImageFolderSet,
                'dstFolPtr': val.imageFolInPtr,
                'videoToFrameWarningPopUpFlag': val.videoToFrameWarningPopUpFlag,
                'updatedAt': formattedUpdatedAt,
                'basePath': `${req.user.id}/${val.id}/${VideoFolderSet}/${(val.curDisplayThumbnailFolPtr > 0) ? val.curDisplayThumbnailFolPtr : 1}/${(val.currentFrameId) ? val.currentFrameId : 'frame_000001.jpg'}`
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

const recentprojectList = async (req, userId, keyword, sort) => {
    // const project = await Project.find({ 'userId': userId }).sort({ updateAt: -1 });

    let query = { userId: userId };
    const sortOrder = sort === 'asc' ? 1 : -1;
    // Add the "like" query conditionally
    if (typeof keyword === 'string' && keyword.trim() !== '') {
        query.projectName = { $regex: keyword, $options: 'i' };
    }
    // query.catName = { $ne: 'Inbox' };
    query.status='active'
    let project = await Project.find(query).sort({ updatedAt: sortOrder });
    

    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    const items = await Promise.all(
        project.map(async (val, index) => {
            try {
                const folderDetails = await Casefolder.findById(val.catId).select('folderName');
                const formattedUpdatedAt = moment(val.updatedAt).format('YYYY-MM-DD HH:mm:ss');
                return {
                    folderId: val.catId,
                    folderName: folderDetails?.folderName === 'anonymous' ? `Case Folder ${index + 1}` : folderDetails?.folderName || 'Unknown Folder',
                    projectId: val.id,
                    projectName: val.projectName,
                    curFrameId: val.currentFrameId,
                    srcFolType: VideoFolderSet,
                    srcFolPtr: val.videoFolInPtr,
                    dstFolType: ImageFolderSet,
                    dstFolPtr: val.imageFolInPtr,
                    videoToFrameWarningPopUpFlag: val.videoToFrameWarningPopUpFlag,
                    updatedAt: formattedUpdatedAt,
                    basePath: `${req.user.id}/${val.id}/${VideoFolderSet}/${val.curDisplayThumbnailFolPtr > 0 ? val.curDisplayThumbnailFolPtr : 1}/${val.currentFrameId || 'frame_000001.jpg'}`
                };
            } catch (error) {
                console.log(`Error processing project with ID ${val.id}:`, error);
                return null; // Return null for failed items
            }
        })
    );
    
    // Filter out any null items
    const validItems = items.filter(item => item !== null);

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        data: validItems
    }
};

const projectDetails = async (req, id) => {
    const projectDetails = await Project.findById(id);
    const userDetails = await User.findById(req.user.id);
    if (!userDetails) {
        return {
            statusCode: 404,
            status: 'Failed',
            isActiveUser : false,
            message: 'User not found'
        };
    }
    if (!projectDetails) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    const rootPath = `${req.user.id}/${id}`;
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
    const folderDetails = await Casefolder.findById(projectDetails.catId).select('folderName');
    const formattedUpdatedAt = moment(projectDetails.updatedAt).format('YYYY-MM-DD HH:mm:ss');

    let folderPath = `public/${req.user.id}/${id}`;
    let folderSize = getFolderSize(folderPath);

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        data: {
            'folderId': projectDetails.catId,
            'projectId': projectDetails.id,
            'folderName': folderDetails?.folderName === 'anonymous' ? `Case Folder ` : folderDetails?.folderName || 'Unknown Folder',
            'projectName':projectDetails.projectName,
            'projectSize':formatSize(folderSize),
            'updatedAt': formattedUpdatedAt,
            'curFrameId': (projectDetails.curDisplayPreviewFolType == 'temp') ? projectDetails.currentPreviewFrameId : projectDetails.currentFrameId,
            'isUndoPossible': isUndoPossible,
            'isRedoPossible': isRedoPossible,
            'isRedoPossible': isRedoPossible,
            'isSaveFramePossible': isSaveFramePossible,
            'isDiscardFramePossible': isDiscardFramePossible,
            'imageFolInPtr': projectDetails.imageFolInPtr,
            'videoFolInPtr': projectDetails.videoFolInPtr,
            'operatePossibleOnVideoFlag': projectDetails.operatePossibleOnVideoFlag,
            'processingGoingOnVideoOrFrameFlag': projectDetails.processingGoingOnVideoOrFrameFlag,
            'curProcessingSourceFolType': projectDetails.curProcessingSourceFolType,
            'curProcessingSourceFolPtr': projectDetails.curProcessingSourceFolPtr,
            'curProcessingDestinationFolType': projectDetails.curProcessingDestinationFolType,
            'curProcessingDestinationFolPtr': projectDetails.curProcessingDestinationFolPtr,
            'curDisplayThumbnailFolType': projectDetails.curDisplayThumbnailFolType,
            'curDisplayThumbnailFolPtr': projectDetails.curDisplayThumbnailFolPtr,
            'curDisplayPreviewFolType': projectDetails.curDisplayPreviewFolType,
            'curDisplayPreviewFolPtr': projectDetails.curDisplayPreviewFolPtr,
            'videoToFrameWarningPopUpFlag': projectDetails.videoToFrameWarningPopUpFlag,
            'handoverPossibleImageToVideoFlag': projectDetails.handoverPossibleImageToVideoFlag,
            'videoPossibleRedoCount': projectDetails.videoPossibleRedoCount,
            'videoPossibleUndoCount': projectDetails.videoPossibleUndoCount,
            'imagePossibleUndoCount': projectDetails.imagePossibleUndoCount,
            'imagePossibleRedoCount': projectDetails.imagePossibleRedoCount,
            'framePath': `${req.user.id}/${id}/${projectDetails.curDisplayPreviewFolType}/${(projectDetails.curDisplayPreviewFolType && projectDetails.curDisplayPreviewFolPtr > 0) ? projectDetails.curDisplayPreviewFolPtr : 1}`,
            'basePath': `${req.user.id}/${id}/${projectDetails.curDisplayThumbnailFolType}/${(projectDetails.curDisplayThumbnailFolPtr && projectDetails.curDisplayThumbnailFolPtr > 0) ? projectDetails.curDisplayThumbnailFolPtr : 1}`,
            'projectDetails': (projectDetails.projectDetails)?JSON.parse(projectDetails.projectDetails):'',
            'orginalImgPath':`${rootPath}/main`,
            'previousImgPath':`${rootPath}/${projectDetails.curProcessingPreviewSourceFolType}/${projectDetails.curProcessingPreviewSourceFolPtr}`,
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
    let operatePossibleOnVideoFlag = project.operatePossibleOnVideoFlag;

    if (project.imagePossibleUndoCount > 1) {
        imagePossibleUndoCount = project.imagePossibleUndoCount - 1;
        imagePossibleRedoCount = project.imagePossibleRedoCount + 1;
        imageFolInPtr = (((project.imageFolInPtr - 2) + project.totalImageFolderSet) % project.totalImageFolderSet) + 1

        curDisplayPreviewFolType = ImageFolderSet;
        curDisplayPreviewFolPtr = imageFolInPtr;

        curProcessingPreviewSourceFolType = ImageFolderSet;
        curProcessingPreviewSourceFolPtr = imageFolInPtr;

        curProcessingPreviewDestinationFolType = TempFolderSet;
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

            curProcessingPreviewDestinationFolType = TempFolderSet;
            curProcessingPreviewDestinationFolPtr = 1;

            operatePossibleOnVideoFlag = true
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

            curProcessingPreviewDestinationFolType = TempFolderSet;
            curProcessingPreviewDestinationFolPtr = 1;
            operatePossibleOnVideoFlag = project.operatePossibleOnVideoFlag
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
            operatePossibleOnVideoFlag,
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

            curProcessingPreviewDestinationFolType = TempFolderSet;
            curProcessingPreviewDestinationFolPtr = 1;

            operatePossibleOnVideoFlag = true
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
                operatePossibleOnVideoFlag,
                refreshThumbnailFlag
            }, { new: true });
        }
    }
    const oppData = {
        projectId: id,
        processType: 'undo',
        processName: 'undo',
        exeDetailsAvailFlag: (requestObj) ? true : false,
        exeDetails: requestObj? JSON.stringify(requestObj): ''
    }
    await Imageoperation.createOperation(oppData)
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
    let operatePossibleOnVideoFlag = project.operatePossibleOnVideoFlag



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
        curProcessingPreviewDestinationFolType = TempFolderSet
        curProcessingPreviewDestinationFolPtr = 1

        operatePossibleOnVideoFlag = true
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
            operatePossibleOnVideoFlag,
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
            curProcessingPreviewDestinationFolType = TempFolderSet
            curProcessingPreviewDestinationFolPtr = 1

            operatePossibleOnVideoFlag = false
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
                operatePossibleOnVideoFlag,
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
            curProcessingPreviewDestinationFolType = TempFolderSet
            curProcessingPreviewDestinationFolPtr = 1

            operatePossibleOnVideoFlag = false
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
                operatePossibleOnVideoFlag,
                refreshThumbnailFlag
            }, { new: true });
        }
    }
    const oppData = {
        projectId: id,
        processType: 'redo',
        processName: 'redo',
        exeDetailsAvailFlag: (requestObj) ? true : false,
        exeDetails: requestObj? JSON.stringify(requestObj): ''
    }
    await Imageoperation.createOperation(oppData)
    logger.changePointer(userId, id, 'RE', 'pointerDetails');
    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.'
    };
};

const selectThumbnailFrame = async (req, id, frameId) => {          //Select a Frame from Thumbnail
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
    let curProcessingPreviewDestinationFolType = TempFolderSet;
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
            'videoToFrameWarningPopUpFlag': true,
        }
    };
};

const discardImage = async (id) => {                    // Discard Frame operation
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
        let curProcessingPreviewDestinationFolType = TempFolderSet
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

const saveImage = async (req, id,image,exeName='jpg') => {              // Save the Frame
    const project = await Project.findById(id);
    if (!project) {
        return {
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        };
    }
    const rootPath = `${req.user.id}/${id}`;
    if(image && image.length > 0){
        image.forEach((val) => {
            const timestamp = Date.now();
            const newFileName = `${timestamp}_frame.${exeName}`;
            fsExtra.copy(`public/${rootPath}/${project.curDisplayPreviewFolType}/${project.curDisplayPreviewFolPtr}/${val}`, `public/${rootPath}/snap/${newFileName}`, (err) => {
                if (err) {
                    // console.log('Error copying the file:', err);
                    return {
                        statusCode: 404,
                        status: 'Failed',
                        message: 'Error copying the file: '+err
                    };
                } else {
                    console.log('Snap File copied successfully.');
                }
            });
        });
        
            return {
                statusCode: 200,
                status: 'Success',
                message: 'Successfully authenticated.'
            };
    }
    
    return {
        statusCode: 404,
        status: 'Failed',
        message: 'Image Not found.'
    };
};

function createFolder(folderPath) {
    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
            return console.log(`Error creating folder: ${err.message}`);
        }
    });
};



const shareProject = async(req,shareUserId,projectId,catId,projectIdTo=null) =>{
    const rootPath = `${req.user.id}/${projectId}`;
    const projectData = await Project.findById(projectId);
    if(!projectIdTo){
        const newProjectData = {
            ...projectData._doc, // Spread the original project's data
            catId, // Use the new category ID
            catName: 'Inbox', // Assign 'Inbox' category
            userId: shareUserId, // Assign to the new user
        };
        delete newProjectData._id;
        const project = new Project(newProjectData);
        await project.save();
        projectIdTo= project.id
    }
    
    
    fsExtra.copy(`public/${rootPath}`, `public/${shareUserId}/${projectIdTo}`, (err) => {
        if (err) {
            // console.log('Error copying the file:', err);
            return {
                statusCode: 404,
                status: 'Failed',
                message: 'Error copying the file: '+err
            };
        } else {
            console.log('Snap File copied successfully.');
        }
    });
    
};

const draganddropProject = async(req,shareUserId,projectId,catId,projectIdTo=null) =>{
    const rootPath = `${req.user.id}/${projectId}`;
    const projectData = await Project.findById(projectId);
    if(!projectIdTo){
        const project = new Project({
            projectName:projectData.projectName,
            catId,
            catName: 'Inbox',
            userId: shareUserId,
        })
        await project.save();
        projectIdTo= project.id
    }
    
    
    // const rootPath = `${req.user.id}/${projectId}`;
    const sourcePath = `public/${rootPath}`;
    const destinationPath = `public/${shareUserId}/${projectIdTo}`;
    
    try {
       // Copy the folder
    await fsExtra.copy(sourcePath, destinationPath, { overwrite: true });
    console.log('Folder copied successfully.');

    // Remove the original folder
    await fsExtra.remove(sourcePath);
    console.log('Original folder deleted successfully.');

        return {
            statusCode: 200,
            status: 'Success',
            message: 'Folder moved successfully.',
        };
    } catch (err) {
        console.error('Error moving the folder:', err);
        return {
            statusCode: 500,
            status: 'Failed',
            message: `Error moving the folder: ${err.message}`,
        };
    }
    
};

const moveProject = async(req,id,catId) =>{
    try {
        const project = await Project.findByIdAndUpdate(id, {'catId':catId}, { new: true });

        return {
            statusCode: 200,
            status: 'Success',
            message: 'Folder moved successfully.',
        };
    } catch (err) {
        console.error('Error moving the folder:', err);
        return {
            statusCode: 500,
            status: 'Failed',
            message: `Error moving the folder: ${err.message}`,
        };
    }
    
};

const cleanProject = async(req,id) =>{
    try {
        const project = await Project.find(id);
        const basePath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${project.id}`;

        await removeFolder(`${basePath}/video/1`);
        createFolder(`${basePath}/video/1`);

        const sourcePath = `${basePath}/video/${project.curDisplayPreviewFolPtr}`;
        const destinationPath = `${basePath}/video/1`;
        await fsExtra.copy(sourcePath, destinationPath, { overwrite: true });

        
        for (let i = 2; i <= project.totalVideoFolderSet; i++) {
            const dynamicFolderName = `${basePath}/video/${i}`; // Create a folder with the project limit
            await removeFolder(dynamicFolderName);
            createFolder(dynamicFolderName);
        }
        const projectUpdate = await Project.findByIdAndUpdate(id, {
            imagePossibleUndoCount:0,
            imagePossibleRedoCount:0,
            videoPossibleUndoCount:0,
            videoPossibleRedoCount:0,
            imageFolInPtr:1,
            videoFolInPtr:1,
            curDisplayPreviewFolType:'video',
            curDisplayPreviewFolPtr:1,
            curProcessingPreviewSourceFolType:'video',
            curProcessingPreviewSourceFolPtr:1,
            curProcessingPreviewDestinationFolType:'temp',
            curProcessingPreviewDestinationFolPtr:1,
            curDisplayThumbnailFolType:'video',
            curDisplayThumbnailFolPtr:1,
            refreshThumbnailFlag:true,
            curProcessingSourceFolType:'video',
            curProcessingSourceFolPtr:1,
            curProcessingDestinationFolType:'video',
            curProcessingDestinationFolPtr:1,
            operatePossibleOnVideoFlag:true,
            handoverPossibleImageToVideoFlag:true,
            processingGoingOnVideoOrFrameFlag:true,
            processingGoingOnVideoNotFrameFlag:true,
        }, { new: true });
       
        return {
            statusCode: 200,
            status: 'Success',
            message: 'Folder moved successfully.',
        };
    } catch (err) {
        console.error('Error moving the folder:', err);
        return {
            statusCode: 500,
            status: 'Failed',
            message: `Error moving the folder: ${err.message}`,
        };
    }
    
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
    resetPointer,
    imageCompair,
    recentprojectList,
    deletedProjectList,
    shareProject,
    draganddropProject,
    moveProject,
    cleanProject
};