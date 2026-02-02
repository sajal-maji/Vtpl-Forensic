// const Imagefilter = require('../model/imagefilter.model');
const Project = require('../model/projects.model');
const JobProject = require('../model/jobprojects.model');
const Imageoperation = require('../model/imageoperation.model');
const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');
const VideoFolderSet = 'video'
const ImageFolderSet = 'image'
const TempFolderSet = 'temp'
const logger = require("../helpers/logEvents");
const operationHistoryService = require("../services/operationhistory.service");
const { channelServiceClient } = require('../grpcClient');

const managePointer = async (id, isApplyToAll, isPreview, frame, req, res) => {
    try {
        logger.logCreate(`managePointer: with req ${JSON.stringify(req.body)}`, 'systemlog');
        const project = await Project.findById(id);
        if (!project) {
            return ({
                'proDetails': {
                    statusCode: 400,
                    status: 'Failed',
                    message: 'Project not found.',
                }
            });
        }
        const { currentFrameId } = req.body;
        const defaultImg = (currentFrameId) ? currentFrameId : project.currentFrameId;
        if (isPreview) {
            const preViewData = await preview(project, id, req, defaultImg);
            logger.logCreate(`managePointer: with priview data ${JSON.stringify(preViewData)}`, 'systemlog');
            return preViewData;
        }

        if (isApplyToAll) {
            const applyToAllData = await applyToAll(project, defaultImg);
            logger.logCreate(`managePointer: with apply to all data ${JSON.stringify(applyToAllData)}`, 'systemlog');
            return applyToAllData
        } else {
            const applyToFrameData = await applyToFrame(project, defaultImg);
            logger.logCreate(`managePointer: with apply to frame data ${JSON.stringify(applyToFrameData)}`, 'systemlog');
            return applyToFrameData
        }
    } catch (error) {
        return ({ 'proDetails': { 'statusCode': 500, error: 'Internal server error', details: error } });
    }

};

const verifySameImageSize = async (proDetails,req, res) => {
    try {
        const { projectId: id, frame } = req.body;

        const rootPath = `${req.user.id}/${id}`;
        let filesArr = []
        let checkStabiliz = true;
       
         frame.forEach((val, index) => {
            const file = val;
            
            let folderPath = `public/${rootPath}/${proDetails.curProcessingSourceFolType}/${proDetails.curProcessingSourceFolPtr}/${file}`
            if (fs.existsSync(folderPath)) {
                    const stats = fs.statSync(folderPath);
                if (stats.isFile()) {
                    filesArr.push(stats.size)
                }
            }   
        });
        // Check if all file sizes are the same
        if (filesArr.length > 1) {
            const firstFileSize = filesArr[0];
            if (!filesArr.every(size => size === firstFileSize)) {
                checkStabiliz = false;
            }
        }
        if (!checkStabiliz) {
            return ({
                'verifyFileSize': {
                    statusCode: 404,
                    status: 'Failed',
                    message: 'Sorry! You not able to apply Stabilization Filter.',
                }
            });
        }
        return ({
            'verifyFileSize': {
                statusCode: 200,
                status: 'Success',
                message: 'Stabilization Filter.',
            }
        });
    } catch (error) {
        return ({ 'proDetails': { 'statusCode': 500, error: 'Internal server error', details: error } });
    }

};

const folderPath = async (id, isApplyToAll, isPreview, proDetails, req, res) => {
    try {
        const rootPath = `${req.user.id}/${id}`;


        const imagePath = `public/${rootPath}/temp/`;

        // Check if the image file exists before attempting to delete
        // fsExtra.remove(imagePath, (err) => {
        //     if (err) {
        //         console.log('Error removing directory:', err);
        //     } else {
        //         console.log('Directory removed successfully.');

        //          // Recreate the directory after removing it
        // for (let i = 1; i <= 10; i++) {
        //     const dynamicFolderName = `public/${rootPath}/temp/${i}`; // Create a folder with the project limit
        //     fs.mkdir(dynamicFolderName, { recursive: true }, (err) => {
        //         console.log(`Folder  created successfully at ${dynamicFolderName}`);
        //       });
        //     }

        //     }
        // });



        const rootDir = path.resolve(__dirname, '..', '..');
        let imgBasePathFrom = ''
        let imgBasePathTo = ''
        let folderPath = process.env.PROJECT_FOLDER
        imgBasePathFrom = path.join(rootDir, `${folderPath}/public/${rootPath}/${proDetails.curProcessingSourceFolType}/${proDetails.curProcessingSourceFolPtr}`);
        imgBasePathTo = path.join(rootDir, `${folderPath}/public/${rootPath}/${proDetails.curProcessingDestinationFolType}/${proDetails.curProcessingDestinationFolPtr}`);

        if (isPreview) {
            // imgBasePathFrom = path.join(rootDir, `forensic_be/public/${rootPath}/video/1`);
            imgBasePathFrom = path.join(rootDir, `${folderPath}/public/${rootPath}/${proDetails.curProcessingPreviewSourceFolType}/${proDetails.curProcessingPreviewSourceFolPtr}`);
            imgBasePathTo = path.join(rootDir, `${folderPath}/public/${rootPath}/${proDetails.curProcessingPreviewDestinationFolType}/${proDetails.curProcessingPreviewDestinationFolPtr}`);
        }

        return ({ imgBasePathFrom, imgBasePathTo })

    } catch (error) {
        return ({ 'proDetails': { 'statusCode': 500, error: 'Internal server error', details: error } });
    }

};

const copyFolderExcluding = async (sourceDir, destDir, exclude = []) => {
    try {
        const items = await fs.promises.readdir(sourceDir);

        await Promise.all(
            items.map(async (item) => {
                const srcPath = path.join(sourceDir, item);
                const destPath = path.join(destDir, item);
                if (fs.existsSync(srcPath) && !exclude.includes(item)) {
                    fsExtra.copy(srcPath, destPath, (err) => {
                        if (err) {
                            console.log('Error copying the file:', err);
                        } else {
                            console.log('File copied successfully.');
                        }
                    });
                } else {
                    console.log(`File not found: ${srcPath}`);
                }

            })

        );

    } catch (error) {
        console.log('Error copying folder:', error);
    }
};

const savePointer = async (id, isApplyToAll, isPreview, frame, req, res, proDetails, response,operationName,requestObj) => {
    const rootPath = `${req.user.id}/${id}`;
    const { currentFrameId } = req.body;
    let frameName = (currentFrameId) ? currentFrameId : 'frame_000001.jpg';
    // let frameName = (frame && frame.length > 0) ? frame[0] : 'frame_000001.jpg';
    // Determine the filter type based on the `isApplyToAll` flag
    // if(!isPreview){

    // if(isApplyToAll){
    const proArr = {
        'currentFrameId': frameName,
        imageFolInPtr: proDetails.imageFolInPtr,
        videoFolInPtr: proDetails.videoFolInPtr,
        imagePossibleUndoCount: proDetails.imagePossibleUndoCount,
        imagePossibleRedoCount: proDetails.imagePossibleRedoCount,
        operatePossibleOnVideoFlag: proDetails.operatePossibleOnVideoFlag,
        handoverPossibleImageToVideoFlag: proDetails.handoverPossibleImageToVideoFlag,
        curProcessingSourceFolType: proDetails.curProcessingSourceFolType,
        curProcessingSourceFolPtr: proDetails.curProcessingSourceFolPtr,
        curProcessingDestinationFolType: proDetails.curProcessingDestinationFolType,
        curProcessingDestinationFolPtr: proDetails.curProcessingDestinationFolPtr,
        videoPossibleUndoCount: proDetails.videoPossibleUndoCount,

        videoToFrameWarningPopUpFlag: proDetails.videoToFrameWarningPopUpFlag,
        processingGoingOnVideoOrFrameFlag: proDetails.processingGoingOnVideoOrFrameFlag,
        processingGoingOnVideoNotFrameFlag: proDetails.processingGoingOnVideoNotFrameFlag,

        curDisplayPreviewFolType: proDetails.curDisplayPreviewFolType,
        curDisplayPreviewFolPtr: proDetails.curDisplayPreviewFolPtr,

        curProcessingPreviewSourceFolType: proDetails.curProcessingPreviewSourceFolType,
        curProcessingPreviewSourceFolPtr: proDetails.curProcessingPreviewSourceFolPtr,
        curProcessingPreviewDestinationFolType: proDetails.curProcessingPreviewDestinationFolType,
        curProcessingPreviewDestinationFolPtr: proDetails.curProcessingPreviewDestinationFolPtr,
        refreshThumbnailFlag:proDetails.refreshThumbnailFlag,

    }
    logger.logCreate(`savepointer: response ${JSON.stringify(proArr)}`, 'systemlog');


    let project = ''
    if (isPreview) {
        project = await Project.findByIdAndUpdate(id, proArr, { new: true });
        logger.changePointer(req.user.id, id, 'PW', 'pointerDetails');
    } else {
        await operationHistoryService.addOrUpdateOperation(id);
        const jobArr = { jobId: response.job_id, projectId: id,JobStatus:'incomplete' };
        // const mergedArr = Object.assign({}, proArr, jobArr);
        await Project.findByIdAndUpdate(id, proArr, { new: true });
        if (isApplyToAll) {
            logger.changePointer(req.user.id, id, 'AA', 'pointerDetails');
        } else {
            logger.changePointer(req.user.id, id, 'AF', 'pointerDetails');
        }
        project = new JobProject(jobArr);
        await project.save();
    }




    // }else{
    //     const project = await Project.findByIdAndUpdate(id, {
    //         'currentFrameId':frameName,
    //         'imageFolInPtr':proDetails.dstFolPtr,
    //         'videoToFrameWarningPopUpFlag':proDetails.videoToFrameWarningPopUpFlag,
    //         'handoverPossibleImageToVideoFlag':proDetails.handoverPossibleImageToVideoFlag,
    //         'operatePossibleOnVideoFlag':proDetails.operatePossibleOnVideoFlag,
    //         'videoPossibleUndoCount':proDetails.videoPossibleUndoCount,
    //         'imagePossibleUndoCount':proDetails.imagePossibleUndoCount,
    //         'videoPossibleRedoCount':proDetails.videoPossibleRedoCount,
    //         'imagePossibleRedoCount':proDetails.imagePossibleRedoCount,
    //         'srcFolType':proDetails.srcFolType,
    //         'srcFolPtr':proDetails.srcFolPtr,
    //         'dstFolType':proDetails.dstFolType,
    //         'dstFolPtr':proDetails.dstFolPtr,
    //         'updateThumbnail' : proDetails.updateThumbnail,
    //         'curThumbFolPtr':proDetails.curThumbFolPtr,
    //         'curThumbFolType':proDetails.curThumbFolType,
    //         'curFrameFolPtr':proDetails.curFrameFolPtr,
    //         'curFrameFolType':proDetails.curFrameFolType

    //     }, { new: true });
    // }

    // }else{

    if (isPreview) {
        
        const rootPath = `${req.user.id}/${id}`;
        const timestamp = Date.now();
        // if (proDetails.curProcessingPreviewSourceFolType == 'temp') {
        //     frameName = proDetails.currentPreviewFrameId;
        // }
        const oldFilePath = `public/${rootPath}/${proDetails.curProcessingPreviewDestinationFolType}/${proDetails.curProcessingPreviewDestinationFolPtr}/${frameName}`;
        const newFileName = timestamp + 'new_frame_name.jpg'; // Replace this with the new file name
        // const newFilePath = path.join(`public/${rootPath}/${proDetails.curDisplayPreviewFolType}/${proDetails.curDisplayPreviewFolPtr}`, newFileName);
        const newFilePath = path.join(`public/${rootPath}/${proDetails.curProcessingPreviewDestinationFolType}/${proDetails.curProcessingPreviewDestinationFolPtr}`, newFileName);
        frameName = newFileName
        project = await Project.findByIdAndUpdate(id, { 'currentPreviewFrameId': frameName }, { new: true });
        // Rename the file

        // fs.rename(oldFilePath, newFilePath, (err) => {
        //     if (err) {
        //         console.log(`Error renaming file from ${oldFilePath} to ${newFilePath}:`, err);
        //     } else {
        //         console.log(`File renamed successfully from ${frameName} to ${newFileName}`);
        //     }
        // });
        // await new Promise((resolve) => setTimeout(resolve, 300));
        // fsExtra.copy(oldFilePath, newFilePath, (err) => {
        //     if (err) {
        //         logger.logCreate(`copyimage: response ${err}`, 'systemlog');
        //         console.log('Error copying the file:', err);
        //     } else {
        //         logger.logCreate(`copyimage: response success`, 'systemlog');
        //         const deletedImagePath = `public/${rootPath}/${proDetails.curProcessingPreviewDestinationFolType}/${proDetails.curProcessingPreviewDestinationFolPtr}/${proDetails.currentPreviewFrameId}`;
        //         fsExtra.remove(deletedImagePath, (removeErr) => {
        //             if (removeErr) {
        //                 logger.logCreate(`deleteimage: response ${removeErr}`, 'systemlog');
        //                 console.log('Error deleting the old file:', removeErr);
        //             } else {
        //                 logger.logCreate(`deleteimage: response success`, 'systemlog');
        //                 console.log('Old file deleted successfully.');
        //             }
        //         });
        //     }
        // });
        // await new Promise((resolve) => setTimeout(resolve, 100));
        //  fsExtra.remove(oldFilePath);
        let ptime =''
        if(operationName != 'measure_1d' && operationName != 'measure_2d' && operationName != 'measure_3d'){
            const result = await checkJobStatus(response.job_id);
            ptime = result.takeTime
        }
        
        // console.log('Job completed successfully:', result);
        await copyAndDeleteWithRetry(oldFilePath, newFilePath, proDetails, rootPath);

        return {
            'colData': {
                job_id: response.job_id,
                percentage: response.percentage,
                'currentFrameId': (proDetails.currentFrameId) ? proDetails.currentFrameId : '',
                total_input_images: response.total_input_images,
                processed_image_count: response.processed_image_count,
                status_message: response.status_message,
                objectLength:(response.object_length)?response.object_length:'',
                takeTime:ptime,
                // basePath: `${rootPath}/${proDetails.curDisplayPreviewFolType}/${proDetails.curDisplayPreviewFolPtr}/${frameName}`,
                basePath: `${rootPath}/${proDetails.curProcessingPreviewDestinationFolType}/${proDetails.curProcessingPreviewDestinationFolPtr}/${frameName}`,
            }
        }
    } else {

        

        const totalCountPro = await Imageoperation.countDocuments({ projectId: id });
        const formattedValue = String(totalCountPro+1).padStart(6, "0");
    
        const saveInFileName = `pro_${formattedValue}_in.jpg`;
        const toInFilePath = path.join(`public/${rootPath}/report_image/`, saveInFileName);

        const firstFrame = parseInt(frame[0].match(/\d+/)[0], 10);
        const endFrame = parseInt(frame[frame.length - 1].match(/\d+/)[0], 10);
        const middleFrame = `frame_${String(Math.floor((firstFrame + endFrame) / 2)).padStart(6, "0")}.jpg`;
        // const middleFrame = `frame_${String(Math.floor((firstFrame + firstFrame) / 2)).padStart(6, "0")}.jpg`;

        const fromInFilePath = `public/${rootPath}/${proDetails.curProcessingSourceFolType}/${proDetails.curProcessingSourceFolPtr}/${middleFrame}`;
        fsExtra.copy(fromInFilePath, toInFilePath, (err) => { });
    
        const saveOutFileName =  `pro_${formattedValue}_out.jpg`;
        const toOutFilePath = path.join(`public/${rootPath}/report_image/`, saveOutFileName);
        const fromOutFilePath = `public/${rootPath}/${proDetails.curProcessingDestinationFolType}/${proDetails.curProcessingDestinationFolPtr}/${middleFrame}`;
        fsExtra.copy(fromOutFilePath, toOutFilePath, (err) => { });

        if (operationName && !isPreview) {
            // const totalCountPro = await Imageoperation.countOperation(id);
            const oppData = {
                projectId: id,
                jobId:response.job_id,
                sequenceNum: totalCountPro ? (totalCountPro + 1):1,
                processType: (isPreview) ? 'preview' : (isApplyToAll) ? 'apply_to_all' : 'apply_to_frame',
                processName: operationName,
                inputImgPath: toInFilePath,
                outImgPath: toOutFilePath,
                exeDetailsAvailFlag: (requestObj) ? true : false,
                startFrameNumber : parseInt(frame[0].match(/\d+/)[0], 10),
                endFrameNumber : parseInt(frame[frame.length - 1].match(/\d+/)[0], 10),
                exeDetails: JSON.stringify(requestObj)
            }
            const imageope = new Imageoperation(oppData);
            await imageope.save();
            // await Imageoperation.createOperation(oppData)
        }

        return {
            'colData': {
                job_id: response.job_id,
                percentage: response.percentage,
                'currentFrameId': (proDetails.currentFrameId) ? proDetails.currentFrameId : '',
                total_input_images: response.total_input_images,
                processed_image_count: response.processed_image_count,
                status_message: response.status_message,
                objectLength:(response.object_length)?response.object_length:'',
                // basePath: `${rootPath}/${proDetails.curDisplayPreviewFolType}/${proDetails.curDisplayPreviewFolPtr}/${frameName}`,
                basePath: `${rootPath}/${proDetails.curProcessingPreviewDestinationFolType}/${proDetails.curProcessingPreviewDestinationFolPtr}/${frameName}`,
            }
        }
    }

    

    // for (var i = 1; i <= project.totalImageFolderSet; i++) {
    //     const sourcePath = `public/${rootPath}/${proDetails.srcFolType}/${i}/${frame[0]}`;
    //     const destPath = `public/${rootPath}/${proDetails.dstFolType}/${i}/${frame[0]}`;

    //     // Check if the source file exists before attempting to copy
    //     if (fs.existsSync(sourcePath)) {
    //         fsExtra.copy(sourcePath, destPath, (err) => {
    //             if (err) {
    //                 console.error('Error copying the file:', err);
    //             } else {
    //                 console.log('File copied successfully.');
    //             }
    //         });
    //     } else {
    //         console.log(`File not found: ${sourcePath}`);
    //     }
    // }
    // console.log('File copied successfully.'+project.totalImageFolderSet);

    // Proceed with logic to manage pointer if the filter exists
    // Your pointer management logic goes here...
    
};

const checkJobStatus = async (job_id, maxRetries = 10, delayMs = 200, attempt = 1) => {
    const request = { job_id };

    return new Promise((resolve, reject) => {
        channelServiceClient.GetJobStatus(request, async (error, response) => {
            if (error) {
                console.log(`Attempt ${attempt} - Error fetching job status:`, error);
                return reject({ error: 'Error fetching job status', details: error });
            }

            console.log(`Attempt ${attempt} - Job status:`, response);

            if (response.completed) {
                return resolve({
                    response,
                    jobDetails: response,
                    takeTime: attempt * 200, // total wait time in ms
                });
            }

            if (attempt >= maxRetries) {
                return reject({ error: 'Max retries reached', lastResponse: response });
            }

            // Retry after delay
            setTimeout(() => {
                checkJobStatus(job_id, maxRetries, delayMs, attempt + 1)
                    .then(resolve)
                    .catch(reject);
            }, delayMs);
        });
    });
};


const MAX_RETRIES = 10;
const RETRY_DELAY = 50; // ms

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const copyAndDeleteWithRetry = async (oldFilePath, newFilePath, proDetails, rootPath, attempt = 1) => {
    try {
        await fsExtra.copy(oldFilePath, newFilePath);
        logger.logCreate(`copyimage: attempt ${attempt} success`, 'systemlog');

        const deletedImagePath = `public/${rootPath}/${proDetails.curProcessingPreviewDestinationFolType}/${proDetails.curProcessingPreviewDestinationFolPtr}/${proDetails.currentPreviewFrameId}`;
        
        await fsExtra.remove(deletedImagePath);
        logger.logCreate(`deleteimage: attempt ${attempt} success`, 'systemlog');
        console.log(`File copied and old file deleted successfully. attempt ${attempt}`);

    } catch (err) {
        const action = err.path && err.path.includes('copy') ? 'copyimage' : 'deleteimage';
        logger.logCreate(`${action}: attempt ${attempt} failed - ${err}`, 'systemlog');
        console.error(`${action} error on attempt ${attempt}:`, err);

        if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY);
            return copyAndDeleteWithRetry(oldFilePath, newFilePath, proDetails, rootPath, attempt + 1);
        } else {
            logger.logCreate(`${action}: failed after ${MAX_RETRIES} attempts`, 'systemlog');
            console.log(`${action} permanently failed after ${MAX_RETRIES} attempts.`);
        }
    }
};



const cloneImage = async (id, isApplyToAll, frame, req, res) => {
    try {

        const image = frame;
        const project = await Project.findById(id);
        const rootPath = `${req.user.id}/${id}`;

        const lastFilter = await Imagefilter.findOne({ 'projectId': id, 'filterType': 'apply_frame' })
            .sort({ createdAt: -1 });


        if (!lastFilter) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found',
            });
        }


        // const updateproject = await Imagefilter.findByIdAndUpdate(lastFilter.id, 
        //     {
        //     'defaultImg':image
        //     }, { new: true,runValidators: true });




        // return res.status(404).json({
        //     statusCode: 404,
        //     status: 'Failed',
        //     message: 'Data not found'+lastFilter.id,
        //     lastFilter
        // });



        for (var i = 1; i <= project.undolimit + 2; i++) {

            const imagePath = `public/${rootPath}/image/${i}/`;

            // Check if the image file exists before attempting to delete
            fs.stat(imagePath, (err, stats) => {
                if (err) {
                    console.log('Error checking file or directory:', err);
                } else if (stats.isFile()) {
                    fsExtra.remove(imagePath, (err) => {
                        if (err) {
                            console.log('Error removing file:', err);
                        } else {
                            console.log('File removed successfully.');
                        }
                    });
                } else {
                    console.log('Path is a directory; not removing.');
                }
            });


            const sourcePath = `public/${rootPath}/video/${i}/${image}`;
            const destPath = `public/${rootPath}/image/${i}/${image}`;

            // Check if the source file exists before attempting to copy
            if (fs.existsSync(sourcePath)) {
                fsExtra.copy(sourcePath, destPath, (err) => {
                    if (err) {
                        console.log('Error copying the file:', err);
                    } else {
                        console.log('File copied successfully.');
                    }
                });
            } else {
                console.log(`File not found: ${sourcePath}`);
            }
        }

        return {
            filePath: lastFilter.pointerFrom
        };



    } catch (error) {
        return error.message;
    }
};

const checkFile = async (id, isApplyToAll, isPreview, proDetails, req, res) => {
    try {

        // let imgBasePathFrom = path.join(rootDir, `forensic_be/public/${rootPath}/${proDetails.curProcessingPreviewSourceFolType}/${proDetails.curProcessingPreviewSourceFolPtr}`);
        // let imgBasePathTo = path.join(rootDir, `forensic_be/public/${rootPath}/${proDetails.curProcessingPreviewDestinationFolType}/${proDetails.curProcessingPreviewDestinationFolPtr}`);

        const srcType = (isPreview) ? proDetails.curProcessingPreviewSourceFolType : proDetails.curProcessingSourceFolType
        const srcPtr = (isPreview) ? proDetails.curProcessingPreviewSourceFolPtr : proDetails.curProcessingSourceFolPtr
        const rootPath = `${req.user.id}/${id}`;
        const frameId = proDetails.currentFrameId
        if (!fs.existsSync(`public/${rootPath}/${srcType}/${srcPtr}/${frameId}`)) {

            // const project = await Project.findByIdAndUpdate(id, {
            //     'imageFolInPtr': (proDetails.curProcessingSourceFolType == 'image' && (proDetails.curProcessingSourceFolPtr > 1)) ? proDetails.curProcessingSourceFolPtr - 1 : proDetails.curProcessingSourceFolPtr,
            //     'videoFolInPtr': (proDetails.curProcessingSourceFolType == 'video' && (proDetails.curProcessingSourceFolPtr > 1)) ? proDetails.curProcessingSourceFolPtr - 1 : proDetails.curProcessingSourceFolPtr,

            // }, { new: true });

            return {
                errStatus: true,
                message: `Image file not found: public/${rootPath}/${srcType}/${srcPtr}/${frameId}`
            };

        } else {
            return {
                status: false,
                message: `Image file not found: public/${rootPath}/${proDetails.curProcessingSourceFolType}/${proDetails.curProcessingSourceFolPtr}/${frameId}`
            };
        }

    } catch (error) {
        return error.message;
    }
};

const preview = async (project, id, req, defaultImg) => {
    const rootPath = `${req.user.id}/${id}`;
    const imagePath = `public/${rootPath}/temp/`;
    // await new Promise((resolve) => setTimeout(resolve, 50));
    const curDisplayPreviewFolType = TempFolderSet
    let curDisplayPreviewFolPtr = 1;
    if (project.processingGoingOnVideoOrFrameFlag == true) {
        curDisplayPreviewFolPtr = 2
    } else {
        curDisplayPreviewFolPtr = 1
    }

    return ({
        'proDetails': {
            'statusCode': 200,
            'currentFrameId': defaultImg,
            operatePossibleOnVideoFlag: project.operatePossibleOnVideoFlag,
            handoverPossibleImageToVideoFlag: project.handoverPossibleImageToVideoFlag,

            curProcessingSourceFolType: project.curProcessingSourceFolType,
            curProcessingSourceFolPtr: project.curProcessingSourceFolPtr,
            curProcessingDestinationFolType: project.curProcessingDestinationFolType,
            curProcessingDestinationFolPtr: project.curProcessingDestinationFolPtr,

            imagePossibleUndoCount: project.imagePossibleUndoCount,
            videoPossibleUndoCount: project.videoPossibleUndoCount,
            videoPossibleRedoCount: project.videoPossibleRedoCount,
            imagePossibleRedoCount: project.imagePossibleRedoCount,

            videoToFrameWarningPopUpFlag: project.videoToFrameWarningPopUpFlag,
            processingGoingOnVideoOrFrameFlag: project.processingGoingOnVideoOrFrameFlag,
            processingGoingOnVideoNotFrameFlag: project.processingGoingOnVideoNotFrameFlag,

            imageFolInPtr: project.imageFolInPtr,
            videoFolInPtr: project.videoFolInPtr,


            curDisplayPreviewFolType,
            curDisplayPreviewFolPtr,

            curProcessingPreviewSourceFolType: project.curProcessingPreviewSourceFolType,
            curProcessingPreviewSourceFolPtr: project.curProcessingPreviewSourceFolPtr,
            curProcessingPreviewDestinationFolType: project.curProcessingPreviewDestinationFolType,
            curProcessingPreviewDestinationFolPtr: project.curProcessingPreviewDestinationFolPtr,

            currentPreviewFrameId : project.currentPreviewFrameId
        }
    });
};

const applyToAll = async (project, defaultImg) => {
    if (project.operatePossibleOnVideoFlag) {

        const srcVideoFolInPtr = project.videoFolInPtr
        videoFolInPtr = (project.videoFolInPtr % project.totalVideoFolderSet) + 1
        imageFolInPtr = 1

        videoPossibleUndoCount = Math.min((project.videoPossibleUndoCount + 1), project.undoVideoLimit)
        imagePossibleUndoCount = 0
        videoPossibleRedoCount = 0
        imagePossibleRedoCount = 0

        handoverPossibleImageToVideoFlag = true
        operatePossibleOnVideoFlag = project.operatePossibleOnVideoFlag

        curProcessingSourceFolType = VideoFolderSet
        curProcessingSourceFolPtr = srcVideoFolInPtr
        curProcessingDestinationFolType = VideoFolderSet
        curProcessingDestinationFolPtr = videoFolInPtr

        processingGoingOnVideoOrFrameFlag = true
        processingGoingOnVideoNotFrameFlag = true
        videoToFrameWarningPopUpFlag = false

        curDisplayPreviewFolType = TempFolderSet
        curDisplayPreviewFolPtr = 1

        curProcessingPreviewSourceFolType = TempFolderSet
        curProcessingPreviewSourceFolPtr = 1
        curProcessingPreviewDestinationFolType = TempFolderSet
        curProcessingPreviewDestinationFolPtr = 2


        return ({
            'proDetails': {
                'statusCode': 200,
                'currentFrameId': defaultImg,

                imageFolInPtr,
                videoFolInPtr,

                imagePossibleUndoCount,
                imagePossibleRedoCount,
                videoPossibleUndoCount,
                videoPossibleRedoCount,

                operatePossibleOnVideoFlag,
                handoverPossibleImageToVideoFlag,

                curProcessingSourceFolType,
                curProcessingSourceFolPtr,
                curProcessingDestinationFolType,
                curProcessingDestinationFolPtr,


                videoToFrameWarningPopUpFlag,
                processingGoingOnVideoOrFrameFlag,
                processingGoingOnVideoNotFrameFlag,

                curDisplayPreviewFolType,
                curDisplayPreviewFolPtr,

                curProcessingPreviewSourceFolType,
                curProcessingPreviewSourceFolPtr,
                curProcessingPreviewDestinationFolType,
                curProcessingPreviewDestinationFolPtr,
                currentPreviewFrameId : project.currentPreviewFrameId
            }
        });
    } else {
        return ({
            'proDetails': {
                statusCode: 400,
                status: 'Failed',
                message: "Sorry You can't use apply toall.",
            }
        });
    }
};

const applyToFrame = async (project, defaultImg) => {
    videoPossibleRedoCount = 0
    imagePossibleRedoCount = 0

    processingGoingOnVideoOrFrameFlag = true
    processingGoingOnVideoNotFrameFlag = false
    refreshThumbnailFlag = false

    curDisplayPreviewFolType = TempFolderSet
    curDisplayPreviewFolPtr = 1

    curProcessingPreviewSourceFolType = TempFolderSet
    curProcessingPreviewSourceFolPtr = 1
    curProcessingPreviewDestinationFolType = TempFolderSet
    curProcessingPreviewDestinationFolPtr = 2

    if (project.operatePossibleOnVideoFlag) {
        imageFolInPtr = 1
        imagePossibleUndoCount = 1
        operatePossibleOnVideoFlag = false

        curProcessingSourceFolType = VideoFolderSet
        curProcessingSourceFolPtr = project.videoFolInPtr
        curProcessingDestinationFolType = ImageFolderSet
        curProcessingDestinationFolPtr = imageFolInPtr

        videoToFrameWarningPopUpFlag = true

        handoverPossibleImageToVideoFlag = project.handoverPossibleImageToVideoFlag
        videoPossibleUndoCount = project.videoPossibleUndoCount
        return ({
            'proDetails': {
                'statusCode': 200,
                'currentFrameId': defaultImg,

                operatePossibleOnVideoFlag,
                handoverPossibleImageToVideoFlag,

                curProcessingSourceFolType,
                curProcessingSourceFolPtr,
                curProcessingDestinationFolType,
                curProcessingDestinationFolPtr,

                videoPossibleUndoCount,
                videoPossibleRedoCount,
                imagePossibleUndoCount,
                imagePossibleRedoCount,

                videoToFrameWarningPopUpFlag,

                processingGoingOnVideoOrFrameFlag,
                processingGoingOnVideoNotFrameFlag,

                imageFolInPtr,
                videoFolInPtr: project.videoFolInPtr,

                curDisplayPreviewFolType,
                curDisplayPreviewFolPtr,

                curProcessingPreviewSourceFolType,
                curProcessingPreviewSourceFolPtr,
                curProcessingPreviewDestinationFolType,
                curProcessingPreviewDestinationFolPtr,

                currentPreviewFrameId : project.currentPreviewFrameId,

                refreshThumbnailFlag
            }
        })
    } else {
        const srcImageFolInPtr = project.imageFolInPtr
        imageFolInPtr = (project.imageFolInPtr % project.totalImageFolderSet) + 1
        tempImagePossibleUndoCount = project.imagePossibleUndoCount + 1
        if (tempImagePossibleUndoCount > project.undoImageLimit) {
            handoverPossibleImageToVideoFlag = false
        }
        imagePossibleUndoCount = Math.min(tempImagePossibleUndoCount, project.undoImageLimit)

        curProcessingSourceFolType = ImageFolderSet
        curProcessingSourceFolPtr = srcImageFolInPtr
        curProcessingDestinationFolType = ImageFolderSet
        curProcessingDestinationFolPtr = imageFolInPtr

        videoToFrameWarningPopUpFlag = false
        videoPossibleUndoCount = project.videoPossibleUndoCount

        return ({
            'proDetails': {
                'statusCode': 200,
                'currentFrameId': defaultImg,

                handoverPossibleImageToVideoFlag,
                operatePossibleOnVideoFlag: project.operatePossibleOnVideoFlag,

                curProcessingSourceFolType,
                curProcessingSourceFolPtr,
                curProcessingDestinationFolType,
                curProcessingDestinationFolPtr,

                videoPossibleUndoCount,
                videoPossibleRedoCount,
                imagePossibleUndoCount,
                imagePossibleRedoCount,

                videoToFrameWarningPopUpFlag,
                processingGoingOnVideoOrFrameFlag,
                processingGoingOnVideoNotFrameFlag,

                imageFolInPtr,
                videoFolInPtr: project.videoFolInPtr,



                curDisplayPreviewFolType,
                curDisplayPreviewFolPtr,

                curProcessingPreviewSourceFolType,
                curProcessingPreviewSourceFolPtr,
                curProcessingPreviewDestinationFolType,
                curProcessingPreviewDestinationFolPtr,

                currentPreviewFrameId : project.currentPreviewFrameId,

                refreshThumbnailFlag
            }
        })

    }
};



module.exports = {
    managePointer,
    verifySameImageSize,
    folderPath,
    savePointer,
    cloneImage,
    checkFile,
    copyFolderExcluding
}
