const Imagefilter = require('../model/imagefilter.model');
const Project = require('../model/projects.model');
const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');
const VideoFolderSet = 'video'
const ImageFolderSet = 'image'
const TempFolder = 'temp'

const managePointer = async (id, isApplyToAll, isPreview, frame, req, res) => {
    try {
        let imageFolInPtr = 1
        let imagePossibleUndoCount = 1
        let operatePossibleOnVideoFlag = true
        let handoverPossibleImageToVideoFlag = true;
        let videoFolInPtr = 1;
        let videoPossibleUndoCount = 1
        let videoPossibleRedoCount = 0
        let imagePossibleRedoCount = 0

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

        const defaultImg = (frame) ? frame[0] : project.currentFrameId;

        if (isPreview) {

            const rootPath = `${req.user.id}/${id}`;
            const imagePath = `public/${rootPath}/temp/`;
            // Check if the image file exists before attempting to delete
            fsExtra.remove(imagePath, (err) => {
                if (err) {
                    console.log('Error removing directory:', err);
                } else {
                    console.log('Directory removed successfully.');

                    // Recreate the directory after removing it
                    const dynamicFolderName = `public/${rootPath}/temp/1`; // Create a folder with the project limit
                    fs.mkdir(dynamicFolderName, { recursive: true }, (err) => {
                        console.log(`Folder  created successfully at ${dynamicFolderName}`);
                    });

                }
            });
            await new Promise((resolve) => setTimeout(resolve, 50));
            const curDisplayPreviewFolType = TempFolder
            let curDisplayPreviewFolPtr = 1;
            if (processingGoingOnVideoOrFrameFlag == true)
                curDisplayPreviewFolPtr = 2
            else
                curDisplayPreviewFolPtr = 1

            return ({
                'proDetails': {
                    'statusCode': 200,
                    'curFrameId': defaultImg,
                    imagePossibleUndoCount: project.imagePossibleUndoCount,
                    operatePossibleOnVideoFlag: project.operatePossibleOnVideoFlag,
                    handoverPossibleImageToVideoFlag: project.handoverPossibleImageToVideoFlag,
                    curProcessingSourceFolType: project.curProcessingSourceFolType,
                    curProcessingSourceFolPtr: project.curProcessingSourceFolPtr,
                    curProcessingDestinationFolType: project.curProcessingDestinationFolType,
                    curProcessingDestinationFolPtr: project.curProcessingDestinationFolPtr,
                    videoPossibleUndoCount: project.videoPossibleUndoCount,

                    videoToFrameWarningPopUp: project.videoToFrameWarningPopUp,
                    processingGoingOnVideoOrFrameFlag: project.processingGoingOnVideoOrFrameFlag,
                    processingGoingOnVideoNotFrame: project.processingGoingOnVideoNotFrame,

                    imageFolInPtr: project.imageFolInPtr,
                    imagePossibleRedoCount: project.imagePossibleRedoCount,

                    curDisplayPreviewFolType,
                    curDisplayPreviewFolPtr,

                    curProcessingPreviewSourceFolType: project.curProcessingPreviewSourceFolType,
                    curProcessingPreviewSourceFolPtr: project.curProcessingPreviewSourceFolPtr,
                    curProcessingPreviewDestinationFolType: project.curProcessingPreviewDestinationFolType,
                    curProcessingPreviewDestinationFolPtr: project.curProcessingPreviewDestinationFolPtr,

                }
            }
            )

            //    const TempFolInPtr=1
            //    const srcVideoFolInPtr = project.videoFolInPtr
            //     videoFolInPtr = (project.videoFolInPtr % project.totalVideoFolderSet) + 1
            //     imageFolInPtr = 1
            //     videoPossibleUndoCount = project.videoPossibleUndoCount
            //     imagePossibleUndoCount = project.imagePossibleUndoCount
            //     videoPossibleRedoCount = project.videoPossibleRedoCount
            //     imagePossibleRedoCount = project.imagePossibleRedoCount
            //     handoverPossibleImageToVideoFlag = true

            //     return (  {'proDetails': {
            //         'statusCode': 200,
            //         'curFrameId':defaultImg,
            //         'srcFolType':(project.operatePossibleOnVideoFlag)?VideoFolderSet:ImageFolderSet,
            //         'srcFolPtr':(project.operatePossibleOnVideoFlag)?project.videoFolInPtr:project.imageFolInPtr,
            //         'dstFolType':TempFolder,
            //         'dstFolPtr':TempFolInPtr,
            //         'videoToFrameWarmPopUp':true,
            //         'handoverPossibleImageToVideoFlag':handoverPossibleImageToVideoFlag,
            //         'operatePossibleOnVideoFlag':true
            //             }
            //         }
            //         )

        }

        if (isApplyToAll) {

            if (project.operatePossibleOnVideoFlag) {

                const srcVideoFolInPtr = project.videoFolInPtr
                videoFolInPtr = (project.videoFolInPtr % project.totalVideoFolderSet) + 1
                imageFolInPtr = 1
                videoPossibleUndoCount = Math.min((project.videoPossibleUndoCount + 1), project.undoVideoLimit)
                imagePossibleUndoCount = 0
                videoPossibleRedoCount = 0
                imagePossibleRedoCount = 0

                handoverPossibleImageToVideoFlag = true

                curProcessingSourceFolType = VideoFolderSet
                curProcessingSourceFolPtr = srcVideoFolInPtr
                curProcessingDestinationFolType = VideoFolderSet
                curProcessingDestinationFolPtr = videoFolInPtr

                processingGoingOnVideoOrFrameFlag = true
                processingGoingOnVideoNotFrame = true
                videoToFrameWarningPopUp = false

                curDisplayPreviewFolType = TempFolder
                curDisplayPreviewFolPtr = 1

                curProcessingPreviewSourceFolType = TempFolder
                curProcessingPreviewSourceFolPtr = 1
                curProcessingPreviewDestinationFolType = TempFolder
                curProcessingPreviewDestinationFolPtr = 2

                operatePossibleOnVideoFlag = project.operatePossibleOnVideoFlag

                return ({
                    'proDetails': {
                        'statusCode': 200,
                        'curFrameId': defaultImg,

                        imageFolInPtr,
                        imagePossibleUndoCount,
                        imagePossibleRedoCount,
                        operatePossibleOnVideoFlag,
                        handoverPossibleImageToVideoFlag,
                        curProcessingSourceFolType,
                        curProcessingSourceFolPtr,
                        curProcessingDestinationFolType,
                        curProcessingDestinationFolPtr,
                        videoPossibleUndoCount,

                        videoToFrameWarningPopUp,
                        processingGoingOnVideoOrFrameFlag,
                        processingGoingOnVideoNotFrame,

                        curDisplayPreviewFolType,
                        curDisplayPreviewFolPtr,

                        curProcessingPreviewSourceFolType,
                        curProcessingPreviewSourceFolPtr,
                        curProcessingPreviewDestinationFolType,
                        curProcessingPreviewDestinationFolPtr,
                    }
                }
                )

            } else {
                return ({
                    'proDetails': {
                        statusCode: 400,
                        status: 'Failed',
                        message: "Sorry You can't use apply toall.",
                    }
                })
            }

        } else {
            videoPossibleRedoCount = 0
            imagePossibleRedoCount = 0

            processingGoingOnVideoOrFrameFlag = true
            processingGoingOnVideoNotFrame = false
            refreshThumbnailFlag = false

            curDisplayPreviewFolType = TempFolder
            curDisplayPreviewFolPtr = 1

            curProcessingPreviewSourceFolType = TempFolder
            curProcessingPreviewSourceFolPtr = 1
            curProcessingPreviewDestinationFolType = TempFolder
            curProcessingPreviewDestinationFolPtr = 2



            if (project.operatePossibleOnVideoFlag) {
                imageFolInPtr = 1
                videoPossibleUndoCount = project.videoPossibleUndoCount
                imagePossibleUndoCount = 1
                operatePossibleOnVideoFlag = false
                curProcessingSourceFolType = VideoFolderSet
                curProcessingSourceFolPtr = project.videoFolInPtr
                curProcessingDestinationFolType = ImageFolderSet
                curProcessingDestinationFolPtr = imageFolInPtr

                handoverPossibleImageToVideoFlag = project.handoverPossibleImageToVideoFlag

                videoToFrameWarningPopUp = true




                return ({
                    'proDetails': {
                        'statusCode': 200,
                        'curFrameId': defaultImg,
                        imagePossibleUndoCount,
                        operatePossibleOnVideoFlag,
                        handoverPossibleImageToVideoFlag,
                        curProcessingSourceFolType,
                        curProcessingSourceFolPtr,
                        curProcessingDestinationFolType,
                        curProcessingDestinationFolPtr,
                        videoPossibleUndoCount,

                        videoToFrameWarningPopUp,
                        processingGoingOnVideoOrFrameFlag: project.processingGoingOnVideoOrFrameFlag,
                        processingGoingOnVideoNotFrame: project.processingGoingOnVideoNotFrame,

                        imageFolInPtr: project.imageFolInPtr,
                        imagePossibleRedoCount: project.imagePossibleRedoCount,

                        curDisplayPreviewFolType: project.curDisplayPreviewFolType,
                        curDisplayPreviewFolPtr: project.curDisplayPreviewFolPtr,

                        curProcessingPreviewSourceFolType: project.curProcessingPreviewSourceFolType,
                        curProcessingPreviewSourceFolPtr: project.curProcessingPreviewSourceFolPtr,
                        curProcessingPreviewDestinationFolType: project.curProcessingPreviewDestinationFolType,
                        curProcessingPreviewDestinationFolPtr: project.curProcessingPreviewDestinationFolPtr,

                    }
                }
                )
            } else {

                const srcImageFolInPtr = project.imageFolInPtr
                imageFolInPtr = (project.imageFolInPtr % project.totalImageFolderSet) + 1
                imagePossibleUndoCount = Math.min((project.imagePossibleUndoCount + 1), project.undoImageLimit)
                if (imagePossibleUndoCount == project.undoImageLimit)
                    handoverPossibleImageToVideoFlag = false

                curProcessingSourceFolType = ImageFolderSet
                curProcessingSourceFolPtr = srcImageFolInPtr
                curProcessingDestinationFolType = ImageFolderSet
                curProcessingDestinationFolPtr = imageFolInPtr

                videoToFrameWarningPopUp = false

                videoPossibleUndoCount = project.videoPossibleUndoCount



                return ({
                    'proDetails': {
                        'statusCode': 200,
                        'curFrameId': defaultImg,
                        handoverPossibleImageToVideoFlag,
                        curProcessingSourceFolType,
                        curProcessingSourceFolPtr,
                        curProcessingDestinationFolType,
                        curProcessingDestinationFolPtr,
                        videoPossibleUndoCount,
                        videoToFrameWarningPopUp,
                        processingGoingOnVideoOrFrameFlag: project.processingGoingOnVideoOrFrameFlag,
                        processingGoingOnVideoNotFrame: project.processingGoingOnVideoNotFrame,

                        imageFolInPtr: project.imageFolInPtr,
                        imagePossibleUndoCount: project.imagePossibleUndoCount,
                        imagePossibleRedoCount: project.imagePossibleRedoCount,
                        operatePossibleOnVideoFlag: project.operatePossibleOnVideoFlag,

                        curDisplayPreviewFolType: project.curDisplayPreviewFolType,
                        curDisplayPreviewFolPtr: project.curDisplayPreviewFolPtr,

                        curProcessingPreviewSourceFolType: project.curProcessingPreviewSourceFolType,
                        curProcessingPreviewSourceFolPtr: project.curProcessingPreviewSourceFolPtr,
                        curProcessingPreviewDestinationFolType: project.curProcessingPreviewDestinationFolType,
                        curProcessingPreviewDestinationFolPtr: project.curProcessingPreviewDestinationFolPtr,


                    }
                }
                )

            }

        }
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
        const imgBasePathFrom = path.join(rootDir, `forensic_be/public/${rootPath}/${proDetails.curProcessingSourceFolType}/${proDetails.curProcessingSourceFolPtr}`);
        const imgBasePathTo = path.join(rootDir, `forensic_be/public/${rootPath}/${proDetails.curProcessingDestinationFolType}/${proDetails.curProcessingDestinationFolPtr}`);
        return ({ imgBasePathFrom, imgBasePathTo })

    } catch (error) {
        return ({ 'proDetails': { 'statusCode': 500, error: 'Internal server error', details: error } });
    }

};

const savePointer = async (id, isApplyToAll, isPreview, frame, req, res, proDetails, response) => {
    try {
        const rootPath = `${req.user.id}/${id}`;
        let frameName = (frame && frame.length > 0) ? frame[0] : 'frame_1.png';
        // Determine the filter type based on the `isApplyToAll` flag
        // if(!isPreview){

        // if(isApplyToAll){


        const project = await Project.findByIdAndUpdate(id, {
            'currentFrameId': frameName,
            imageFolInPtr: proDetails.imageFolInPtr,
            imagePossibleUndoCount: proDetails.imagePossibleUndoCount,
            imagePossibleRedoCount: proDetails.imagePossibleRedoCount,
            operatePossibleOnVideoFlag: proDetails.operatePossibleOnVideoFlag,
            handoverPossibleImageToVideoFlag: proDetails.handoverPossibleImageToVideoFlag,
            curProcessingSourceFolType: proDetails.curProcessingSourceFolType,
            curProcessingSourceFolPtr: proDetails.curProcessingSourceFolPtr,
            curProcessingDestinationFolType: proDetails.curProcessingDestinationFolType,
            curProcessingDestinationFolPtr: proDetails.curProcessingDestinationFolPtr,
            videoPossibleUndoCount: proDetails.videoPossibleUndoCount,

            videoToFrameWarningPopUp: proDetails.videoToFrameWarningPopUp,
            processingGoingOnVideoOrFrameFlag: proDetails.processingGoingOnVideoOrFrameFlag,
            processingGoingOnVideoNotFrame: proDetails.processingGoingOnVideoNotFrame,

            curDisplayPreviewFolType: proDetails.curDisplayPreviewFolType,
            curDisplayPreviewFolPtr: proDetails.curDisplayPreviewFolPtr,

            curProcessingPreviewSourceFolType: proDetails.curProcessingPreviewSourceFolType,
            curProcessingPreviewSourceFolPtr: proDetails.curProcessingPreviewSourceFolPtr,
            curProcessingPreviewDestinationFolType: proDetails.curProcessingPreviewDestinationFolType,
            curProcessingPreviewDestinationFolPtr: proDetails.curProcessingPreviewDestinationFolPtr,

        }, { new: true });
        // }else{
        //     const project = await Project.findByIdAndUpdate(id, {
        //         'currentFrameId':frameName,
        //         'imageFolInPtr':proDetails.dstFolPtr,
        //         'videoToFrameWarmPopUp':proDetails.videoToFrameWarmPopUp,
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

            await new Promise((resolve) => setTimeout(resolve, 100));
            const rootPath = `${req.user.id}/${id}`;
            const timestamp = Date.now();
            const oldFilePath = `public/${rootPath}/${proDetails.curProcessingDestinationFolType}/${proDetails.curProcessingDestinationFolPtr}/${frameName}`;
            const newFileName = timestamp + 'new_frame_name.png'; // Replace this with the new file name
            const newFilePath = path.join(`public/${rootPath}/${proDetails.curProcessingDestinationFolType}/${proDetails.curProcessingDestinationFolPtr}`, newFileName);
            frameName = newFileName
            // Rename the file
            fs.rename(oldFilePath, newFilePath, (err) => {
                if (err) {
                    console.log(`Error renaming file from ${oldFilePath} to ${newFilePath}:`, err);
                } else {
                    console.log(`File renamed successfully from ${frameName} to ${newFileName}`);
                }
            });
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
        await new Promise((resolve) => setTimeout(resolve, 100));
        return {
            'colData': {
                job_id: response.job_id,
                percentage: response.percentage,
                'curFrameId': (proDetails.currentFrameId) ? proDetails.currentFrameId : '',
                total_input_images: response.total_input_images,
                processed_image_count: response.processed_image_count,
                status_message: response.status_message,
                basePath: `${rootPath}/${proDetails.curProcessingDestinationFolType}/${proDetails.curProcessingDestinationFolPtr}/${frameName}`,
                // request:request
            }
        }


    } catch (error) {
        return error.message;
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
                    console.error('Error checking file or directory:', err);
                } else if (stats.isFile()) {
                    fsExtra.remove(imagePath, (err) => {
                        if (err) {
                            console.error('Error removing file:', err);
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

const checkFile = async (id, isApplyToAll, proDetails, req, res) => {
    try {

        const rootPath = `${req.user.id}/${id}`;
        if (!fs.existsSync(`public/${rootPath}/${proDetails.curProcessingSourceFolType}/${proDetails.curProcessingSourceFolPtr}/${proDetails.curFrameId}`)) {

            const project = await Project.findByIdAndUpdate(id, {
                'imageFolInPtr': (proDetails.curProcessingSourceFolType == 'image' && (proDetails.curProcessingSourceFolPtr > 1)) ? proDetails.curProcessingSourceFolPtr - 1 : proDetails.curProcessingSourceFolPtr,
                'videoFolInPtr': (proDetails.curProcessingSourceFolType == 'video' && (proDetails.curProcessingSourceFolPtr > 1)) ? proDetails.curProcessingSourceFolPtr - 1 : proDetails.curProcessingSourceFolPtr,

            }, { new: true });

            return {
                errStatus: true,
                message: `Image file not found: public/${rootPath}/${proDetails.curProcessingSourceFolType}/${proDetails.curProcessingSourceFolPtr}/${proDetails.curFrameId}`
            };

        } else {
            return {
                status: false,
                message: `Image file not found: public/${rootPath}/${proDetails.curProcessingSourceFolType}/${proDetails.curProcessingSourceFolPtr}/${proDetails.curFrameId}`
            };
        }

    } catch (error) {
        return error.message;
    }
};

module.exports = {
    managePointer,
    folderPath,
    savePointer,
    cloneImage,
    checkFile
}
