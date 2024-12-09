const projectService = require("../services/project.service");
const operationHistoryService = require("../services/operationhistory.service");
const Project = require('../model/projects.model');
const Casefolder = require('../model/casefolder.model');
const Imageoperation = require('../model/imageoperation.model');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fsExtra = require('fs-extra');
const { errorLogger } = require("../config/log.config");
const VideoFolderSet = 'video'
const ImageFolderSet = 'image'
const TempFolder = 'temp'

const createProject = async (req, res, next) => {
    const { projectName, catId } = req.body;
    try {
        const response = await projectService.createProject(req, catId, projectName);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const updateProject = async (req, res, next) => {
    const { id, projectName } = req.body;
    try {
        const response = await projectService.updateProject(id, projectName);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const deleteProject = async (req, res, next) => {
    const { projectId: id } = req.body;
    try {
        const response = await projectService.deleteProject(req,id);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const exportProject = async (req, res, next) => {
    const { projectId:id,exeName } = req.query;
    const projectDetails = await Project.findById(id);
    if (!projectDetails) {
        return res.status(404).json({
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        });
    }
    const exe = exeName?exeName:'mp4'
    const basePath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${id}`;
    createFolder(`${basePath}/exportvideo`);
    const imageDir = `public/${req.user.id}/${id}/${projectDetails.curDisplayThumbnailFolType}/${(projectDetails.curDisplayThumbnailFolPtr && projectDetails.curDisplayThumbnailFolPtr > 0) ? projectDetails.curDisplayThumbnailFolPtr : 1}`
   const outputDir= `${basePath}/exportvideo`;
   const timestamp = Date.now();
   const outputPath = path.join(outputDir, `video_${timestamp}.${exe}`);
    try {
        const fps = projectDetails.fps?projectDetails.fps:10
        const videoCon = await imagesToMp4(imageDir, outputPath, fps) // 1 frame per second
        res.status(200).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            vodeoUrl:`${req.user.id}/${id}/exportvideo/video_${timestamp}.${exe}`
        });
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error.message });
    }
};

const deleteImage = async (req, res, next) => {
    const { url } = req.body;
    try {
        const imagePath = `public/${url}`;

        // Check if the image file exists before attempting to delete
        fs.stat(imagePath, (err, stats) => {
            if (err) {
                // console.error('Error checking file or directory:', err);
                // res.status(200).json({
                //     statusCode: 404,
                //     status: 'Failed',
                //     message: 'Image not found : '+err
                // });
            } else if (stats.isFile()) {
                fsExtra.remove(imagePath, (err) => {
                    if (err) {
                        //console.error('Error removing file:', err);
                        // res.status(200).json({
                        //     statusCode: 404,
                        //     status: 'Failed',
                        //     message: 'Image not found '+err
                        // });
                    } else {
                        console.log('File removed successfully.');
                    }
                });
            } else {
                console.log('Path is a directory; not removing.');
            }
        });
        res.status(200).json({
            statusCode: 200,
            status: 'Success',
            message: 'Image deleted successfully.',
            data: items
        });
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const imageComparison = async (req, res, next) => {
    const { projectId: id } = req.query;
    try {
        const response = await projectService.imageCompair(req, id);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const uploadFiles = async (req, res, next) => {
    const formKeys = Object.keys(req.body);
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads');  // Folder where the videos will be stored
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + path.extname(file.originalname));  // Append timestamp to the file name
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
        limits: { fileSize: 2000000000 },  // 1GB
        fileFilter: fileFilter
    });
    
    // Handle the file upload
    upload.single('video')(req, res, async (err) => {  // Mark this callback as async
        if (err) {
            const errorMessage = err.code === 'LIMIT_FILE_SIZE' ? 'File too large. Max limit is 1GB' : err.message;
            return res.status(400).json({
                statusCode: 400,
                status: 'Failed',
                message: errorMessage,
            });
        }

        if (!req.file) {
            return res.status(400).json({
                statusCode: 400,
                status: 'Failed',
                message: 'Please upload a video.',
            });
        }

        const { catId: id } = req.body;
        const totalSeconds = (req.body.startTime) ? req.body.startTime : 0;

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        // Format the result as 'hh:mm:ss'
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        if (id) {
            var casefolder = await Casefolder.findById(id).select('folderName');
            if (!casefolder) {
                return res.status(404).json({
                    statusCode: 404,
                    status: 'Failed',
                    message: 'Data not found'
                });
            }
        } else {
            const totalCount = await Casefolder.countDocuments({ userId: req.user.id });
            var casefolder = new Casefolder({
                folderName: `Case Folder ${totalCount + 1}`,
                userId: req.user.id,
            })

            await casefolder.save();
        }

        const totalCountPro = await Project.countDocuments({ userId: req.user.id });
        const project = new Project({
            projectName: `Project ${totalCountPro + 1}`,
            catId: casefolder.id,
            catName: casefolder.folderName,
            userId: req.user.id,
        })
        await project.save();


        const basePath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${project.id}`;
        const rootPath = `${req.user.id}/${project.id}`;
        const baseUrl = `${process.env.BASE_URL}:${process.env.PORT}/`;

        // createFolder(`${basePath}/uploads`);
        createFolder(`${basePath}/main`);
        createFolder(`${basePath}/snap`);
        createFolder(`${basePath}/temp/1`);
        createFolder(`${basePath}/temp/2`);


        for (let i = 1; i <= project.totalVideoFolderSet; i++) {
            const dynamicFolderName = `${basePath}/video/${i}`; // Create a folder with the project limit
            createFolder(dynamicFolderName);
        }


        for (let i = 1; i <= project.totalImageFolderSet; i++) {
            const dynamicFolderNameImg = `${basePath}/image/${i}`; // Create a folder with the project limit
            createFolder(dynamicFolderNameImg);
        }
        const rootDir = path.resolve(__dirname, '..', '..');
        const inputPath = req.file.path; //path.join(rootDir, req.file.path);
        let outputPath = `public/uploads/crop/${req.file.filename}`;//path.join(rootDir, `public/uploads/videos/crop/${req.file.filename}`);

        try {
            const fileMetadata = await getVideoDuration(inputPath);  // Await inside async function
            const videoDuration = fileMetadata.format.duration;
            console.log(`Video duration: ${videoDuration} seconds`);

            let fps =10;
            const videoStream = fileMetadata.streams.find((stream) => stream.codec_type === 'video');
            if (videoStream || videoStream.r_frame_rate) {
                //  fps = eval(videoStream.r_frame_rate);
            }
           
            console.log(`Video fps: ${fps} seconds`);

            const maxDuration = 120; // 2 minutes in seconds
            const startTime = formattedTime; // Start 3 seconds into the video
            const cutDuration = 120; // Cut 10 seconds of the video

            // Cut the video if it's longer than 2 minutes
            // if (videoDuration > maxDuration) {
            //     console.log(`Video is longer than 2 minutes, cutting it to ${maxDuration} seconds.`);
            //     await cutVideo(inputPath, outputPath, startTime, cutDuration);  // Await async function
            // } else {
            //     console.log('Video is 2 minutes or less, no cutting needed.');
            // }

            // Convert the video to frames
            // if (videoDuration < maxDuration) {
                fsExtra.copy(`${inputPath}`, `${outputPath}`, (err) => {
                    if (err) {console.log('Error copying the file:', err);} 
                    console.log('File copied successfully.');
                });
                // outputPath = inputPath;
            // }

            const frameNumber = 0; // Example frame number
            // const formattedFileName = `frame_${formatFrameNumber(frameNumber)}`;

            const frameOutputDir = `${basePath}/main/frame_%06d.jpg`; // %d will be replaced by frame number
            const videoCon = await convertVideo(outputPath, frameOutputDir,fps);  // Await async function

            const dataFiles = await getTotalFiles(`${basePath}/main`);



            fsExtra.unlink(inputPath, (unlinkErr) => {
                console.log('Video file deleted successfully.');
            });
            // Success response

            fsExtra.copy(`${basePath}/main`, `${basePath}/video/1`, (err) => {
                if (err) {console.log('Error copying the file:', err);} 
                // console.log('File copied successfully.');
            });
            console.log('File copied successfully.');
            const projectDetails = {
                "fileName": req.file.filename,
                "fileSize": fileMetadata.format.size,
                "fileResolution": fileMetadata.format.bit_rate,
                "fileDuration": fileMetadata.format.duration,
                "fileFrameRate": '',
                "fileAspectRatio": '',
                "createOn": ''
            }

            // dataFiles.filesName.sort((a, b) => {
            //     // Extract the numbers from the file names
            //     const numA = parseInt(a.match(/\d+/)[0]);
            //     const numB = parseInt(b.match(/\d+/)[0]);

            //     // Sort numerically
            //     return numA - numB;
            // });

            const updateproject = await Project.findByIdAndUpdate(project.id,
                {
                    'filesName': JSON.stringify(dataFiles.filesName),
                    'currentFrameId': 'frame_000001.jpg',
                    'projectDetails': JSON.stringify(projectDetails),
                    fps
                }, { new: true });
                console.log('Project Details....',{
                    'totalFiles': dataFiles.totalFiles,
                    'folderId': updateproject.catId,
                    'projectId': updateproject.id,
                    'curFrameId': updateproject.currentFrameId,
                    'srcFolType': VideoFolderSet,
                    'srcFolPtr': updateproject.videoFolInPtr,
                    'videoToFrameWarmPopUp': true,
                    // 'filesName': dataFiles.filesName,
                    'projectDetails': projectDetails
                });
            res.status(200).json({
                statusCode: 200,
                status: 'Success',
                message: 'Video uploaded and processed successfully.',
                data: {
                    'totalFiles': dataFiles.totalFiles,
                    'folderId': updateproject.catId,
                    'projectId': updateproject.id,
                    'curFrameId': updateproject.currentFrameId,
                    'srcFolType': VideoFolderSet,
                    'srcFolPtr': updateproject.videoFolInPtr,
                    'videoToFrameWarmPopUp': true,
                    // 'filesName': dataFiles.filesName,
                    'projectDetails': projectDetails
                }

            });
        } catch (error) {
            res.status(500).json({statusCode: 500, message: 'Server error', error: error.message });
        }

    });
};

const getProjectByCat = async (req, res, next) => {
    const { catId,keyword,sort } = req.query;
    try {
        const projectList = await projectService.projectList(req, catId,keyword,sort);
        res.status(200).json(projectList)
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};


const getRecentProject = async (req, res, next) => {
    try {
        const { keyword,sort } = req.query;
        const projectList = await projectService.recentprojectList(req, req.user.id,keyword,sort);
        res.status(200).json(projectList)
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const getProjectDetails = async (req, res, next) => {
    const { projectId: id } = req.query;
    try {
        const projectDetails = await projectService.projectDetails(req, id);
        res.status(200).json(projectDetails)
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const getAction = async (req, res, next) => {
    const { projectId: id, actionType } = req.body;
    try {
        let applyChanges = '';
        if (actionType === 'undo') {
            applyChanges = await projectService.applyUndoAction(id, req.user.id);
        } else if (actionType === 'redo') {
            applyChanges = await projectService.applyRedoAction(id, req.user.id);
        }
        res.status(200).json(applyChanges)
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const selectFream = async (req, res, next) => {
    const { projectId: id, frameId } = req.body;
    try {
        const selectThumbnailFrame = await projectService.selectThumbnailFrame(req, id, frameId);
        res.status(200).json(selectThumbnailFrame)
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const discardFream = async (req, res, next) => {
    const { projectId: id } = req.body;
    try {
        const discardImage = await projectService.discardImage(id);
        res.status(200).json(discardImage)
    } catch (error) {
        return res.status(500).json({ statusCode: 500,error: 'Internal server error', details: error });
    }
};

const saveSnapImage = async (req, res, next) => {
    const { projectId: id, image,exeName } = req.body;
    try {
        const saveImage = await projectService.saveImage(req, id, image,exeName);
        res.status(200).json(saveImage)
    } catch (error) {
        return res.status(500).json({ statusCode: 500,error: 'Internal server error', details: error });
    }
};

const resetPointer = async (req, res, next) => {
    const { projectId: id, updateData } = req.body;
    try {
        const updatePointer = await projectService.resetPointer(req.user.id, id, updateData);
        res.status(200).json(updatePointer)
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

const revertOperation = async (req, res, next) => {
    const { jobId,projectId } = req.body;
    try {
        const response = await operationHistoryService.revertOperation(jobId,projectId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        return res.status(500).json({statusCode: 500, error: 'Internal server error', details: error });
    }
};

function createFolder(folderPath) {
    fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
             console.log(`Error creating folder: ${err.message}`);
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

async function convertVideo(inputPath, outputDir,fps) {
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
            .outputOptions('-vf', `fps=${fps}`)
            .outputOptions('-q:v', '1')
            .output(outputDir)
            .run();
    });

};

function imagesToMp4(imageDir, outputPath, frameRate = 1) {
    return new Promise((resolve, reject) => {
        if (`${process.env.NODE_ENV}` == 'development')
            ffmpeg.setFfmpegPath('C:\\Users\\barik\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe');

        ffmpeg()
            .input(`${imageDir}/frame_%06d.jpg`) // Input sequentially numbered images
            .inputOptions('-framerate', frameRate) // Set the frame rate
            .outputOptions([
                '-c:v libx264', // Video codec
                '-crf 25', // Quality factor
                '-pix_fmt yuv420p', // Pixel format for compatibility
            ])
            .output(outputPath)
            .on('end', () => {
                console.log('MP4 video created successfully!');
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.log('Error:', err.message);
                reject(err);
            })
            .run();
    });
}

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

const operationHistory = async (req, res, next) => {
    try {
        const { projectId } = req.query;
        if (!projectId) {
            return res.status(400).json({ error: 'Project ID is required' });
        }

        const operationDetails = await Imageoperation.find({ projectId: projectId, processType: { $ne: 'preview' } }).sort({ createdAt: -1 });
        //
        if (operationDetails && operationDetails.length > 0) {
            return res.status(200).json({
                message: 'Successfully Done',
                data: operationDetails
            });
        } else {
            return res.status(200).json({ message: 'No operation details found for the provided project ID', data: operationDetails });
        }

    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            error: 'Internal server error',
            details: error
        });
    }
};

const filesList = async (req, res, next) => {
    try {
        const { projectId } = req.query;
        const rootPath = `${req.user.id}/${projectId}`;
        const fs = require('fs');
        const path = require('path');
        const directoryPath = path.join(__dirname, `../public/${rootPath}/snap/`); // Replace with your folder path
        // console.log(directoryPath);

        let filesArr = []
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                return res.status(404).json({ message: 'Unable to scan directory ' + directoryPath });
            }
            // Listing all files in the directory
            files.forEach(file => {
                let fPath = `${rootPath}/snap/${file}`
                filesArr.push({ 'basePath': fPath, 'imageName': file })
                console.log(file);
            });
            if (filesArr && filesArr.length > 0) {
                return res.status(200).json({
                    message: 'Successfully Done',
                    data: filesArr
                });
            } else {
                return res.status(200).json({ message: 'No Files are found', data: filesArr });
            }
        });



    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            error: 'Internal server error',
            details: error
        });
    }
};


module.exports = {
    createProject,
    updateProject,
    deleteProject,
    uploadFiles,
    getProjectByCat,
    imageComparison,
    getProjectDetails,
    getAction,
    selectFream,
    discardFream,
    saveSnapImage,
    resetPointer,
    operationHistory,
    filesList,
    deleteImage,
    revertOperation,
    getRecentProject,
    exportProject
};