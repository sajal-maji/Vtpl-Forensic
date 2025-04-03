const projectService = require("../services/project.service");
const operationHistoryService = require("../services/operationhistory.service");
const Project = require('../model/projects.model');
const Casefolder = require('../model/casefolder.model');
const Imageoperation = require('../model/imageoperation.model');
const Savemedia = require('../model/savemedia.model');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fsExtra = require('fs-extra');
const { errorLogger } = require("../config/log.config");
const { now } = require("mongoose");
const VideoFolderSet = 'video'
const ImageFolderSet = 'image'
const TempFolderSet = 'temp'
const moment = require('moment');
const logger = require("../helpers/logEvents");

const createProject = async (req, res, next) => {
    const { projectName, catId } = req.body;
    try {
        if (!catId) {
            const casefolderDetails = await Casefolder.findOne({ slag: 'default', userId: req.user.id });
            catId = casefolderDetails.catId
        }
        const response = await projectService.createProject(req, catId, projectName);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

const updateProject = async (req, res, next) => {
    const { id, projectName } = req.body;
    try {
        const response = await projectService.updateProject(id, projectName);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

const deleteProject = async (req, res, next) => {
    const { projectId: id } = req.body;
    try {
        const response = await projectService.deleteProject(req, id);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error.message });
    }
};

const exportProject = async (req, res, next) => {
    const { projectId: id, exeName } = req.query;
    const projectDetails = await Project.findById(id);
    if (!projectDetails) {
        return res.status(404).json({
            statusCode: 404,
            status: 'Failed',
            message: 'Data not found'
        });
    }
    const exe = exeName ? exeName : 'mp4'
    const basePath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${id}`;
    createFolder(`${basePath}/exportvideo`);
    const imageDir = `public/${req.user.id}/${id}/${projectDetails.curDisplayThumbnailFolType}/${(projectDetails.curDisplayThumbnailFolPtr && projectDetails.curDisplayThumbnailFolPtr > 0) ? projectDetails.curDisplayThumbnailFolPtr : 1}`
    const outputDir = `${basePath}/exportvideo`;
    const timestamp = Date.now();
    const outputPath = path.join(outputDir, `video_${timestamp}.${exe}`);
    try {
        const fps = projectDetails.fps ? projectDetails.fps : 10
        const videoCon = await imagesToMp4(imageDir, outputPath, fps) // 1 frame per second
        res.status(200).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            vodeoUrl: `${req.user.id}/${id}/exportvideo/video_${timestamp}.${exe}`
        });
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error.message });
    }
};

const deleteImage = async (req, res, next) => {
    const { url,id } = req.body;
    try {
        // const imagePath = `public/${url}`;
        const mediaData = await Savemedia.findById(id);
        if(mediaData){
            let imagePath = `public/${req.user.id}/${mediaData.projectId}/snap/${mediaData.fileName}`;
            await Savemedia.findByIdAndDelete(id);

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
                // data: items
            });
            
        }else{
            res.status(404).json({
                statusCode: 404,
                status: 'Success',
                message: 'Image data not found.',
                // data: items
            });
        }
   
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error.message });
    }
};

const imageComparison = async (req, res, next) => {
    const { projectId: id } = req.query;
    try {
        const response = await projectService.imageCompair(req, id);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

// Utility function for converting video to desired frame rate
const convertVideoToFrameRate = (inputPath, outputPath, frameRate) => {
    return new Promise((resolve, reject) => {
        ffmpeg(inputPath)
            .outputOptions([`-r ${frameRate}`]) // Set frame rate
            .save(outputPath)
            .on('end', () => resolve(true))
            .on('error', (err) => reject(err));
    });
};

const uploadFiles = async (req, res, next) => {
    createFolder(`public/logs`);
    createFolder(`public/uploads`);
    createFolder(`public/uploads/crop`);
    createFolder(`public/uploads/images`);
    const upload = multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                // cb(null, 'public/uploads');
                const isImage = file.mimetype.startsWith('image/');
                cb(null, isImage ? 'public/uploads/images' : 'public/uploads'); // Separate folders for images and videos

            },
            filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedFileTypes = /jpeg|jpg|png|tiff|bmp|mp4|mkv|avi|mov|wmv/;
            const extName = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());
            const mimeType = allowedFileTypes.test(file.mimetype);
            if (mimeType && extName) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type'));
            }
        },
    }).fields([
        { name: 'video', maxCount: 1 },
        { name: 'images', maxCount: 100 },
    ]);

    upload(req, res, async (err) => {
        if (err) {
            if (err instanceof multer.MulterError && err.code === 'LIMIT_UNEXPECTED_FILE') {
                return res.status(400).json({
                    statusCode: 400,
                    status: 'Failed',
                    message: `Unexpected field: ${err.field}`,
                });
            }

            return res.status(400).json({
                statusCode: 400,
                status: 'Failed',
                message: err.message,
            });
        }

        if (!req.files || (!req.files.video && !req.files.images)) {
            return res.status(400).json({
                statusCode: 400,
                status: 'Failed',
                message: 'Please upload at least a video or images.',
            });
        }


        try {
            // Process uploaded files
            const videoDetails = req.files.video ? req.files.video[0] : null;
            const imageDetails = req.files.images || [];

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

                if (!req.user || !req.user.id) {
                    return res.status(401).json({ 
                        statusCode: 401, 
                        status: 'Failed', 
                        message: 'Unauthorized: User ID missing' 
                    });
                }
            
                var casefolder = await Casefolder.findOne({ slag: 'default', userId: req.user.id });

                // const totalCount = await Casefolder.countDocuments({ userId: req.user.id });
                // var casefolder = new Casefolder({
                //     folderName: `Case Folder ${totalCount + 1}`,
                //     userId: req.user.id,
                // })

                // await casefolder.save();
            }

            const totalCountPro = await Project.countDocuments({ userId: req.user.id });
            const project = new Project({
                projectName: `Project ${totalCountPro + 1}`,
                catId: casefolder.id,
                catName: casefolder.folderName,
                userId: req.user.id,
            })
            await project.save();


            if (req.files.video) {
                const videoPath = req.files.video[0].path;
                ffmpeg.ffprobe(videoPath, async (err, metadata) => {
                    if (err) {
                        // const fixedVideoPath = `public/uploads/crop/${videoDetails ? videoDetails.filename : null}`;
                        // await fixVideoHeaders(req.files.video[0].path, fixedVideoPath);
                        return res.status(400).json({
                            statusCode: 400,
                            status: 'Failed',
                            message: 'Error analyzing video metadata.',
                            error: err.message,
                        });
                    }


                    const videoStream = metadata.streams.find((stream) => stream.codec_type === 'video');
                    const frameRate = videoStream?.r_frame_rate || 'Unknown';
                    const duration = metadata.format.duration || 'Unknown';
                    const resolution = `${videoStream?.width || 'Unknown'}x${videoStream?.height || 'Unknown'}`;

                    console.log('Video Metadata:', {
                        frameRate,
                        duration,
                        resolution,
                    });
                    const videoDetail = req.files.video[0]
                    // Check and enforce frame rate
                    if (!frameRate || frameRate === 'Unknown') {
                        // const fixedVideoPath = `public/uploads/crop/${videoDetails ? videoDetails.filename : null}`;
                        // await fixVideoHeaders(req.files.video[0].path, fixedVideoPath);
                        if (project) {
                            await Project.findByIdAndDelete(project.id);
                        }

                        return res.status(400).json({
                            statusCode: 400,
                            status: 'Failed',
                            message: 'Error analyzing video metadata. Please upload proper video',
                        });
                        // Process or set default frame rate using ffmpeg
                        // const processedPath = `public/uploads/${videoDetail.filename}`;
                        // await convertVideoToFrameRate(videoPath, processedPath, 30); // Convert to 30 fps
                        // videoDetail.path = processedPath;
                    }

                });
            }

            const basePath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${project.id}`;
            const rootPath = `${req.user.id}/${project.id}`;
            const baseUrl = `${process.env.BASE_URL}:${process.env.PORT}/`;

            // createFolder(`${basePath}/uploads`);
            createFolder(`${basePath}/main`);
            createFolder(`${basePath}/snap`);
            createFolder(`${basePath}/temp/1`);
            createFolder(`${basePath}/temp/2`);
            createFolder(`${basePath}/report_image`);


            for (let i = 1; i <= project.totalVideoFolderSet; i++) {
                const dynamicFolderName = `${basePath}/video/${i}`; // Create a folder with the project limit
                createFolder(dynamicFolderName);
            }


            for (let i = 1; i <= project.totalImageFolderSet; i++) {
                const dynamicFolderNameImg = `${basePath}/image/${i}`; // Create a folder with the project limit
                createFolder(dynamicFolderNameImg);
            }
            let fps = 10;
            const rootDir = path.resolve(__dirname, '..', '..');
            let projectDetails = {}
            if (videoDetails) {
                let inputPath = videoDetails ? videoDetails.path : null; //path.join(rootDir, req.file.path);
                let outputPath = `public/uploads/crop/${videoDetails ? videoDetails.filename : null}`;//path.join(rootDir, `public/uploads/videos/crop/${req.file.filename}`);
                const images = req.files?.images || [];

                const fileMetadata = await getVideoDuration(inputPath);  // Await inside async function
                // console.log('-----------tapan-----------',fileMetadata);
                if (!fileMetadata) {
                    // await Project.findByIdAndDelete(project.id);
                    await projectService.deleteProject(req, project.id);
                    return res.status(400).json({
                        statusCode: 400,
                        status: 'Failed',
                        message: 'Error analyzing video metadata. Please upload proper video',
                    });
                }
                const videoDuration = fileMetadata.format.duration;
                console.log(`Video duration: ${videoDuration} seconds`);


                // const videoStream = fileMetadata.streams.find((stream) => stream.codec_type === 'video');
                // if (videoStream || videoStream.r_frame_rate) {
                //  fps = eval(videoStream.r_frame_rate);
                // }
                

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


                fsExtra.copy(`${inputPath}`, `${outputPath}`, (err) => {
                    if (err) { console.log('Error copying the file:', err); }
                    console.log('File copied successfully.');
                });

                const frameNumber = 0; // Example frame number
                // const formattedFileName = `frame_${formatFrameNumber(frameNumber)}`;
                console.log('Project Details....', req.file)
                const frameOutputDir = `${basePath}/main/frame_%06d.jpg`; // %d will be replaced by frame number
                const videoCon = await convertVideo(outputPath, frameOutputDir, fps);  // Await async function
                fsExtra.unlink(inputPath, (unlinkErr) => {
                    console.log('Video file deleted successfully.');
                });

                projectDetails = {
                    "fileName": videoDetails ? videoDetails.filename : '',
                    "fileSize": videoDetails ? fileMetadata.format.size : '',
                    "fileResolution": videoDetails ? fileMetadata.format.bit_rate : '',
                    "fileDuration": videoDetails ? fileMetadata.format.duration : '',
                    "fileFrameRate": '',
                    "fileAspectRatio": '',
                    "createOn": ''
                }

            } else {
                let inputPath = `public/uploads/images`
                const imgCopyedBase = `${basePath}/main`;
                await copyImages(imageDetails, imgCopyedBase);

                projectDetails = {
                    "fileName": 'imagefile.mp4',
                    "fileSize": 10,
                    "fileResolution": 10,
                    "fileDuration": imageDetails.length,
                    "fileFrameRate": '',
                    "fileAspectRatio": '',
                    "createOn": ''
                }


                fsExtra.remove(inputPath, (err) => {
                    if (err) {
                        console.log(`Error deleting folder: ${err.message}`);
                    } else {
                        console.log('Folder deleted successfully');
                    }
                });



            }
            const dataFiles = await getTotalFiles(`${basePath}/main`);

            fsExtra.copy(`${basePath}/main`, `${basePath}/video/1`, (err) => {
                if (err) { console.log('Error copying the file:', err); }
                // console.log('File copied successfully.');
            });
            console.log('File copied successfully.');



            const updateproject = await Project.findByIdAndUpdate(project.id,
                {
                    'filesName': JSON.stringify(dataFiles.filesName),
                    'currentFrameId': 'frame_000001.jpg',
                    'projectDetails': projectDetails ? JSON.stringify(projectDetails) : null,
                    'uploadType': videoDetails ? 'video' : 'image',
                    'fps': fps ? fps : 0
                }, { new: true });

            res.status(200).json({
                statusCode: 200,
                status: 'Success',
                message: 'Video uploaded and processed successfully.',
                data: {
                    'totalFiles': dataFiles.totalFiles,
                    'folderId': updateproject.catId,
                    'projectId': updateproject.id,
                    'currentFrameId': updateproject.currentFrameId,
                    'srcFolType': VideoFolderSet,
                    'srcFolPtr': updateproject.videoFolInPtr,
                    'videoToFrameWarningPopUpFlag': true,
                    'filesName': dataFiles.filesName,
                    'projectDetails': projectDetails
                }

            });

            // res.status(200).json({
            //     statusCode: 200,
            //     status: 'Success',
            //     message: 'Files uploaded successfully.',
            //     data: {
            //         video: videoDetails,
            //         images: imageDetails.map(image => ({
            //             fileName: image.filename,
            //             filePath: image.path,
            //         })),
            //         basePath
            //     },
            // });
        } catch (error) {
             logger.logCreate(`deleteimage: response ${error}`, 'systemlog');
            res.status(500).json({ statusCode: 500, message: 'Server error', error:error.message });
        }
    });
};

const fixVideoHeaders = async (inputPath, outputPath) => {
    return new Promise((resolve, reject) => {
        if (`${process.env.NODE_ENV}` === 'development') {
            ffmpeg.setFfmpegPath('C:\\Users\\barik\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe');
        }

        // Use FFmpeg to remux or re-encode the video
        ffmpeg(inputPath)
            .output(outputPath)
            .on('start', (command) => {
                console.log('FFmpeg process started:', command);
            })
            .on('error', (err) => {
                console.error('Error fixing video headers:', err.message);
                reject(new Error('Failed to fix video headers. Please upload a valid video file.'));
            })
            .on('end', () => {
                console.log('Video headers fixed successfully.');
                resolve(outputPath);
            })
            .outputOptions(['-c copy']) // Copy codec streams (remux) without re-encoding
            .outputOptions(['-movflags', 'faststart']) // Ensures headers are at the start of the file
            .run();
    });
};

async function copyImages(imageDetails, imgCopiedBase) {
    try {
        await Promise.all(
            imageDetails.map((image, index) => {
                const destinationPath = `${imgCopiedBase}/frame_${String(index + 1).padStart(6, '0')}.jpg`;
                return fsExtra.copy(image.path, destinationPath)
                    .then(() => console.log(`File copied successfully: ${image.path} to ${destinationPath}`));
            })
        );
        console.log('All images copied successfully.');
    } catch (err) {
        console.log('Error copying files:', err);
    }
}


const getProjectByCat = async (req, res, next) => {
    const { catId, keyword, sort } = req.query;
    try {
        const projectList = await projectService.projectList(req, catId, keyword, sort);
        res.status(200).json(projectList)
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error.message });
    }
};

const getDeletedProjectByCat = async (req, res, next) => {
    const { catId, keyword, sort } = req.query;
    try {
        const projectList = await projectService.deletedProjectList(req, catId, keyword, sort);
        res.status(200).json(projectList)
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};


const getRecentProject = async (req, res, next) => {
    try {
        // const folderPath = 'public/676553436b6e9bcd9eadd489';
        // const folderSize = getFolderSize(folderPath);
        // console.log(`Total size of folder and subfolders: ${formatSize(folderSize)}`);
        const { keyword, sort } = req.query;
        const projectList = await projectService.recentprojectList(req, req.user.id, keyword, sort);
        res.status(200).json(projectList)
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

const getProjectDetails = async (req, res, next) => {
    const { projectId: id } = req.query;
    try {
        const projectDetails = await projectService.projectDetails(req, id);
        res.status(200).json(projectDetails)
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

const getAction = async (req, res, next) => {
    const { projectId: id, actionType,currentFrameId } = req.body;
    try {
        let applyChanges = '';
        if (actionType === 'undo') {
            applyChanges = await projectService.applyUndoAction(id, req.user.id,currentFrameId);
        } else if (actionType === 'redo') {
            applyChanges = await projectService.applyRedoAction(id, req.user.id,currentFrameId);
        }
        res.status(200).json(applyChanges)
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

const selectFream = async (req, res, next) => {
    const { projectId: id, frameId } = req.body;
    try {
        const selectThumbnailFrame = await projectService.selectThumbnailFrame(req, id, frameId);
        res.status(200).json(selectThumbnailFrame)
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

const discardFream = async (req, res, next) => {
    const { projectId: id } = req.body;
    try {
        const discardImage = await projectService.discardImage(id);
        res.status(200).json(discardImage)
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

const saveSnapImage = async (req, res, next) => {
    const { projectId: id, image, exeName } = req.body;
    try {
        const saveImage = await projectService.saveImage(req, id, image, exeName);
        res.status(200).json(saveImage)
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

const resetPointer = async (req, res, next) => {
    const { projectId: id, updateData } = req.body;
    try {
        const updatePointer = await projectService.resetPointer(req.user.id, id, updateData);
        res.status(200).json(updatePointer)
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
    }
};

const revertOperation = async (req, res, next) => {
    const { jobId, projectId } = req.body;
    try {
        const response = await operationHistoryService.revertOperation(jobId, projectId);
        res.status(response.statusCode).json(response);
    } catch (error) {
        return res.status(500).json({ statusCode: 500, error: 'Internal server error', details: error });
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

async function convertVideo(inputPath, outputDir, fps) {
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

function imagesToMp4(imageDir, outputPath, frameRate = 10) {
    return new Promise((resolve, reject) => {
        if (`${process.env.NODE_ENV}` == 'development')
            ffmpeg.setFfmpegPath('C:\\Users\\barik\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe');

        ffmpeg()
            .input(`${imageDir}/frame_%06d.jpg`) // Input sequentially numbered images
            .inputOptions('-framerate', frameRate) // Set the frame rate
            // .input(`${imageDir}/%d.jpg`)
            // .inputOptions('-start_number', 586)
            // .outputOptions([
            //     '-c:v libx264', // Video codec
            //     '-crf 25', // Quality factor
            //     '-pix_fmt yuv420p', // Pixel format for compatibility
            // ])
            .outputOptions([
                '-c:v libx264',    // H.264 codec
                '-crf 20',         // Higher quality
                '-pix_fmt yuv420p', // Pixel format
                '-preset veryfast', // Encoding speed/efficiency trade-off
                '-r 30',           // Fixed frame rate

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
                resolve(false);
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
        // logger.createGlobalLogs('DEBUG','Testing logs');
        const { projectId } = req.query;
        const rootPath = `${req.user.id}/${projectId}`;
        const fs = require('fs');
        const path = require('path');
        const directoryPath = path.join(__dirname, `../public/${rootPath}/snap/`); // Replace with your folder path
        // console.log(directoryPath);

        let filesArr = []
        const mideaList =  await Savemedia.find({ projectId: projectId}).sort({ createdAt: -1 });
        if(!mideaList && mideaList.length==0){
            return res.status(200).json({ message: 'No Files are found', data: filesArr });
        }
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                return res.status(404).json({ message: 'Unable to scan directory ' + directoryPath });
            }
            // Listing all files in the directory
            let folderAllPath = `public/${req.user.id}/${projectId}/snap`;

            mideaList.forEach((val, index) => {
                const file = val.fileName;
                
                let fPath = `${rootPath}/snap/${file}`
                let folderPath = `public/${req.user.id}/${projectId}/snap/${file}`;
                if (fs.existsSync(folderPath)) {
                        console.log(file);
                        const stats = fs.statSync(folderPath);
                    if (stats.isFile()) {
                        const stats = fs.statSync(folderPath);
                        const formattedcreatedAt = moment(val.updatedAt).format('YYYY-MM-DD HH:mm:ss');
                        filesArr.push({ 'id':val.id, 'basePath': fPath, 'imageName': file,'size':formatSize(stats.size),'createdAt':formattedcreatedAt })
                    }
                }   
            });

            // files.forEach(file => {
            //     let fPath = `${rootPath}/snap/${file}`
                
            //     let folderPath = `public/${req.user.id}/${projectId}/snap/${file}`;
            //     const stats = fs.statSync(folderPath);
            //     const formattedcreatedAt = moment().format('YYYY-MM-DD HH:mm:ss');
            //     filesArr.push({ 'basePath': fPath, 'imageName': file,'size':formatSize(stats.size),'createdAt':formattedcreatedAt })
                
            // });
            if (filesArr && filesArr.length > 0) {
                return res.status(200).json({
                    message: 'Successfully Done',
                    data: {
                        'savedMediaSize': formatSize(getFolderSize(folderAllPath)),
                        'projectList' : filesArr
                    }
                });
            } else {
                return res.status(200).json({ message: 'No Files are found', data: filesArr });
            }
        });



    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            error: 'Internal server error',
            details: error.message
        });
    }
};

const shareProjectToUser = async (req, res, next) => {
    try {
        const { shareUserId, projectId } = req.body;
        const casefolderInbox = await Casefolder.findOne({ 'userId': shareUserId, 'status': 'active', slag: 'inbox' });
        const catId = casefolderInbox.id
        const response = await projectService.shareProject(req, shareUserId, projectId, catId);
        res.status(200).json({
            statusCode: 200,
            status: 'Success',
            message: 'Shared Successfully.'
        });


    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            error: 'Internal server error',
            details: error.message
        });
    }
};
const draganddropProject = async (req, res, next) => {
    try {
        const { projectId, catId } = req.body;
        const shareUserId = req.user.id
        if (!catId) {
            const casefolderInbox = await Casefolder.findOne({ 'userId': shareUserId, 'status': 'active', slag: 'inbox' });
            catId = casefolderInbox.id
        }

        const response = await projectService.draganddropProject(req, shareUserId, projectId, catId);
        res.status(200).json({
            statusCode: 200,
            status: 'Success',
            message: 'Shared Successfully.'
        });


    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            error: 'Internal server error',
            details: error.message
        });
    }
};

const moveProject = async (req, res, next) => {
    try {
        const { projectId, catId } = req.body;


        const response = await projectService.moveProject(req, projectId, catId);
        res.status(200).json({
            statusCode: 200,
            status: 'Success',
            message: 'Moved Successfully.'
        });


    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            error: 'Internal server error',
            details: error.message
        });
    }
};

const cleanProject = async (req, res, next) => {
    try {
        const { projectId } = req.body;


        const response = await projectService.cleanProject(req, projectId);
        res.status(response.statusCode).json({
            statusCode: response.statusCode,
            status: response.status,
            message: response.message
        });


    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            error: 'Internal server error',
            details: error.message
        });
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
    const bytesData = (bytes / Math.pow(1024, power)).toFixed(1);
    if(bytesData > 1 && bytesData < 10 && units[power]=='GB'){
        return bytesData + ' ' + units[power];
    }
    return Math.round((bytes / Math.pow(1024, power)).toFixed(1)) + ' ' + units[power];
}


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
    exportProject,
    getDeletedProjectByCat,
    shareProjectToUser,
    draganddropProject,
    moveProject,
    cleanProject
};