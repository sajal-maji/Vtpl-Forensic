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

const uploadFiles = async (req, id, totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    if (id) {
        var casefolder = await Casefolder.findById(id).select('folderName');
        if (!casefolder) {
            return {
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            };
        }
    } else {
        var casefolder = new Casefolder({
            folderName: 'anonymous',
            userId: req.user.id,
        })

        await casefolder.save();
    }

    const project = new Project({
        projectName: 'anonymous',
        catId: casefolder.id,
        catName: casefolder.folderName,
        userId: req.user.id,
    })
    await project.save();
    const basePath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${project.id}`;
    const rootPath = `${req.user.id}/${project.id}`;
    const baseUrl = `${process.env.BASE_URL}:${process.env.PORT}/`;

    createFolder(`${basePath}/main`);
    createFolder(`${basePath}/snap`);
    createFolder(`${basePath}/temp/1`);

    for (let i = 1; i <= project.totalVideoFolderSet; i++) {
        const dynamicFolderName = `${basePath}/video/${i}`; // Create a folder with the project limit
        createFolder(dynamicFolderName);
    }

    for (let i = 1; i <= project.totalImageFolderSet; i++) {
        const dynamicFolderNameImg = `${basePath}/image/${i}`;
        createFolder(dynamicFolderNameImg);
    }
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads');
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });

    const fileFilter = (req, file, cb) => {
        const allowedFileTypes = /mp4|mkv|avi|mov|wmv/;
        const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimeType = allowedFileTypes.test(file.mimetype);
        if (mimeType && extName) {
            cb(null, true);
        } else {
            cb(new Error('Only videos are allowed'), false);
        }
    };

    const upload = multer({
        storage: storage,
        limits: { fileSize: 1000000000 },
        fileFilter: fileFilter
    });

    const upFiles= upload.single('video')(req, async (err) => {
        console.log(12333)
        if (err) {
            const errorMessage = err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Max limit is 1GB' : err.message;
            return {
                statusCode: 400,
                status: 'Failed',
                message: errorMessage,
            };
        }

        if (!req.file) {
            return {
                statusCode: 400,
                status: 'Failed',
                message: 'Please upload a video.',
            };
        }

        const rootDir = path.resolve(__dirname, '..', '..');
        const inputPath = req.file.path;
        let outputPath = `public/uploads/crop/${req.file.filename}`;

        try {
            // Get the video duration
            const fileMetadata = await getVideoDuration(inputPath);  // Await inside async function
            const videoDuration = fileMetadata.format.duration;
            console.log(`Video duration: ${videoDuration} seconds`);

            const maxDuration = 120; // 2 minutes in seconds
            const startTime = formattedTime; // Start 3 seconds into the video
            const cutDuration = 120; // Cut 10 seconds of the video

            // Cut the video if it's longer than 2 minutes
            if (videoDuration > maxDuration) {
                console.log(`Video is longer than 2 minutes, cutting it to ${maxDuration} seconds.`);
                await cutVideo(inputPath, outputPath, startTime, cutDuration);  // Await async function
            } else {
                console.log('Video is 2 minutes or less, no cutting needed.');
            }

            // Convert the video to frames
            if (videoDuration < maxDuration) {
                fsExtra.copy(`${inputPath}`, `${outputPath}`, (err) => {
                    if (err) return console.error('Error copying the file:', err);
                    console.log('File copied successfully.');
                });
                outputPath = inputPath;
            }

            const frameNumber = 0; // Example frame number
            const formattedFileName = `frame_${formatFrameNumber(frameNumber)}`;

            const frameOutputDir = `${basePath}/main/frame_%d.png`; // %d will be replaced by frame number
            const videoCon = await convertVideo(outputPath, frameOutputDir);  // Await async function

            const dataFiles = await getTotalFiles(`${basePath}/main`);



            fsExtra.unlink(inputPath, (unlinkErr) => {
                console.log('Video file deleted successfully.');
            });

            fsExtra.copy(`${basePath}/main`, `${basePath}/video/1`, (err) => {
                if (err) return console.error('Error copying the file:', err);
                console.log('File copied successfully.');
            });
            const projectDetails = {
                "fileName": req.file.filename,
                "fileSize": fileMetadata.format.size,
                "fileResolution": fileMetadata.format.bit_rate,
                "fileDuration": fileMetadata.format.duration,
                "fileFrameRate": '',
                "fileAspectRatio": '',
                "createOn": ''
            }

            dataFiles.filesName.sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)[0]);
                const numB = parseInt(b.match(/\d+/)[0]);
                return numA - numB;
            });

            const updateproject = await Project.findByIdAndUpdate(project.id,
                {
                    'filesName': JSON.stringify(dataFiles.filesName),
                    'currentFrameId': 'frame_1.png',
                    'projectDetails': JSON.stringify(projectDetails)
                }, { new: true });

            return {
                statusCode: 200,
                status: 'Success',
                message: 'Video uploaded and processed successfully.',
                data: {
                    totalFiles: dataFiles.totalFiles,
                    'folderId': updateproject.catId,
                    'projectId': updateproject.id,
                    'curFrameId': updateproject.currentFrameId,
                    'srcFolType': VideoFolderSet,
                    'srcFolPtr': updateproject.videoFolInPtr,
                    'videoToFrameWarmPopUp': true,
                    'filesName': dataFiles.filesName,
                    projectDetails: projectDetails
                }
            };
        } catch (error) {
            return { message: 'Server error', error: error.message };
        }
    });
    return {error:upFiles};
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

function formatFrameNumber(number) {
    return number.toString().padStart(5, '0');
};

async function cutVideo(inputPath, outputPath, startTime, duration) {
    return new Promise((resolve, reject) => {
        if (process.env.NODE_ENV === 'development') {
            ffmpeg.setFfmpegPath('C:\\Users\\barik\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe');
        }

        ffmpeg(inputPath)
            .setStartTime(startTime) // Start time in the format 'HH:MM:SS' or seconds
            .setDuration(duration)   // Duration in seconds
            .on('end', () => {
                console.log('Video cutting finished!');
                resolve(); // Resolve the promise when the operation completes
            })
            .on('error', (err) => {
                reject(err); // Reject the promise in case of an error
            })
            .save(outputPath); // Save the output video to the specified path
    });
};

async function convertVideo(inputPath, outputDir) {
    return new Promise((resolve, reject) => {
        if (`${process.env.NODE_ENV}` == 'development')
            ffmpeg.setFfmpegPath('C:\\Users\\barik\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe');
        ffmpeg(inputPath)
            .on('end', () => {
                console.log('Frames extracted successfully.');
                resolve(1);
            })
            .on('error', (err) => {
                reject(`Error extracting frames: ${err.message}`);
            })
            .outputOptions('-vf', 'fps=10')
            .outputOptions('-q:v', '5')
            .output(outputDir)
            .run();
    });

};

async function getVideoDuration(inputPath) {
    return new Promise((resolve, reject) => {
        if (`${process.env.NODE_ENV}` == 'development')
            ffmpeg.setFfmpegPath('C:\\Users\\barik\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe');
        ffmpeg.ffprobe(inputPath, (err, metadata) => {
            if (err) {
                reject(err);
            } else {
                console.log(metadata);
                resolve(metadata); // returns duration in seconds
            }
        });
    });
};

async function getTotalFiles(folderPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                return reject(err);
            }
            const filteredFiles = files.filter(file => {
                return fs.statSync(path.join(folderPath, file)).isFile();
            });
            const totalFiles = filteredFiles.length;
            resolve({ totalFiles, filesName: filteredFiles });
        });
    });
};

module.exports = {
    createProject,
    updateProject,
    deleteProject,
    uploadFiles,
    projectList,
    projectDetails,
    selectThumbnailFrame,
    applyUndoAction,
    applyRedoAction,
    discardImage,
    saveImage
};