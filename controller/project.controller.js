const Project = require('../model/projects.model');
const Casefolder = require('../model/casefolder.model');
const Imagefilter = require('../model/imagefilter.model');
const { where } = require('../model/user.model');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const fsExtra = require('fs-extra');
const { consoleLogger, errorLogger } = require("../config/log.config");
const VideoFolderSet='video'
const ImageFolderSet ='image'

exports.getProjectByCat = async (req, res, next) => {
    const {catId} = req.query;
    
    try {
        const project = await Project.find({'catId':catId}).sort({ updateAt: -1 });

        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }

    let items=[];

        project.forEach((val, index) => {
            
            // console.log(`Index: ${index}, Value: ${number}`);
            items.push(
                {
                    'folderId':val.catId,
                    'projectId':val.id,
                    'curFrameId':val.currentFrameId,
                    'srcFolType':VideoFolderSet,
                    'srcFolPtr':val.videoFolInPtr,
                    'dstFolType':ImageFolderSet,
                    'dstFolPtr':val.imageFolInPtr,
                    'videoToFrameWarmPopUp':true,
                    'updateAt':project.updateAt,
                    'basePath':`${req.user.id}/${val.id}/${VideoFolderSet}/${val.videoFolInPtr}/${(val.currentFrameId)?val.currentFrameId:'frame_1.png'}`
                }
            )
        });
        // console.log(items);
        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            data: items
        })
    } catch (error) {
        next(error);
    }
    
}

exports.getProjectDetails = async (req, res, next) => {
    try {
        const { projectId: id } = req.query;

        
                const projectDetails = await Project.findById(id);
                if (!projectDetails) {
                    return res.status(404).json({
                        statusCode: 404,
                        status: 'Failed',
                        message: 'Data not found'
                    });
                }
                // const foltype =(projectDetails.operatePossibleOnVideoFlag)?VideoFolderSet:ImageFolderSet;
                const foltype =(projectDetails.operatePossibleOnVideoFlag)?projectDetails.dstFolType:projectDetails.srcFolType;
                // const ptr = (projectDetails.operatePossibleOnVideoFlag)?projectDetails.videoFolInPtr:projectDetails.imageFolInPtr;
                const ptr = (projectDetails.operatePossibleOnVideoFlag)?projectDetails.dstFolPtr:projectDetails.srcFolPtr;
                let isUndoPossible=false;
                if (projectDetails.imagePossibleUndoCount > 0){
                    isUndoPossible=true
                }else if((projectDetails.handoverPossibleImageToVideoFlag) && (projectDetails.videoPossibleUndoCount > 0)){
                    isUndoPossible=true
                }else{
                    isUndoPossible=false
                }
        
                let isRedoPossible=false;
                if((projectDetails.handoverPossibleImageToVideoFlag) && (projectDetails.videoPossibleRedoCount > 0)){
                    isRedoPossible=true
                }else if (projectDetails.imagePossibleRedoCount > 0){
                    isRedoPossible=true
                } else{
                    isRedoPossible=false
                }
               
                res.status(201).json({
                    statusCode: 200,
                    status: 'Success',
                    message: 'Successfully authenticated.',
                    data: {
                            'folderId':projectDetails.catId,
                            'projectId':projectDetails.id,
                            'curFrameId':projectDetails.currentFrameId,
                            // 'srcFolType':foltype,
                            // 'srcFolPtr':ptr,
                            isUndoPossible,
                            isRedoPossible,
                            'imageFolInPtr':projectDetails.imageFolInPtr,
                            'videoFolInPtr':projectDetails.videoFolInPtr,
                            'operatePossibleOnVideoFlag':projectDetails.operatePossibleOnVideoFlag,
                            // 'dstFolType':ImageFolderSet,
                            // 'dstFolPtr':projectDetails.imageFolInPtr,

                            'srcFolType':projectDetails.srcFolType,
                            'srcFolPtr':projectDetails.srcFolPtr,
                            'dstFolType':projectDetails.dstFolType,
                            'dstFolPtr':projectDetails.dstFolPtr,
                            'updateThumbnail' : projectDetails.updateThumbnail ,

                            'curThumbFolPtr':projectDetails.curThumbFolPtr,
                            'curThumbFolType':projectDetails.curThumbFolType,
                            'curFrameFolPtr':projectDetails.curFrameFolPtr,
                            'curFrameFolType':projectDetails.curFrameFolType,

                            'videoToFrameWarmPopUp':true,
                            'handoverPossibleImageToVideoFlag':projectDetails.handoverPossibleImageToVideoFlag,
                            'videoPossibleRedoCount':projectDetails.videoPossibleRedoCount,
                            'videoPossibleUndoCount':projectDetails.videoPossibleUndoCount,
                            'imagePossibleUndoCount':projectDetails.imagePossibleUndoCount,
                            'imagePossibleRedoCount':projectDetails.imagePossibleRedoCount,
                            'framePath':`${req.user.id}/${id}/${projectDetails.curFrameFolType}/${(projectDetails.curFrameFolPtr && projectDetails.curFrameFolPtr>0)?projectDetails.curFrameFolPtr:1}`,
                            // 'framePath':`${req.user.id}/${id}/${foltype}/${(ptr && ptr>0)?ptr:1}`,
                            // 'framePath':`${req.user.id}/${id}/${projectDetails.srcFolType}/${(projectDetails.srcFolPtr)?projectDetails.srcFolPtr:1}`,
                            // 'basePath':`${req.user.id}/${id}/${VideoFolderSet}/${(projectDetails.videoFolInPtr && projectDetails.videoFolInPtr>0)?projectDetails.videoFolInPtr:1}`,
                            'basePath':`${req.user.id}/${id}/${projectDetails.curThumbFolType}/${(projectDetails.curThumbFolPtr && projectDetails.curThumbFolPtr>0)?projectDetails.curThumbFolPtr:1}`,
                            'projectDetails':JSON.parse(projectDetails.projectDetails),
                            'filesName':(projectDetails.filesName)?JSON.parse(projectDetails.filesName):'',
                    }
                });
    } catch (error) {
        next(error);
    }
    
}

exports.getCloneImage = async (req, res, next) => {
    try {
        const { projectId: id ,image} = req.body;

        const project = await Project.findById(id);
        const rootPath = `${req.user.id}/${id}`;

        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }


            // console.log(updateproject);

        for (var i = 1; i <= project.totalImageFolderSet; i++) {

            const imagePath = `public/${rootPath}/image/${i}/`;
    
            // Check if the image file exists before attempting to delete
            if (fs.existsSync(imagePath)) {
                // fsExtra.remove(imagePath, (unlinkErr) => {
                //     if (unlinkErr) {
                //         console.log('Error deleting the image file:', unlinkErr);
                //     } else {
                //         console.log('Image file deleted successfully.');
                //     }
                // });
            } else {
                console.log(`Image file not found: ${imagePath}`);
            }


            const sourcePath = `public/${rootPath}/video/${project.videoFolInPtr}/${image}`;
            const destPath = `public/${rootPath}/image/${i}/${image}`;
            
            // Check if the source file exists before attempting to copy
            // if (fs.existsSync(sourcePath)) {
            //     fsExtra.copy(sourcePath, destPath, (err) => {
            //         if (err) {
            //             console.log('Error copying the file:', err);
            //         } else {
            //             console.log('File copied successfully.');
            //         }
            //     });
            // } else {
            //     console.log(`File not found: ${sourcePath}`);
            // }
        }

        const projectUpdate = await Project.findByIdAndUpdate(id, {
            'currentFrameId':image,
            'handoverPossibleImageToVideoFlag':true,
            'operatePossibleOnVideoFlag':true,
            // imageFolInPtr:project.videoFolInPtr,
            imageFolInPtr:1,
            videoFolInPtr:1,
            imagePossibleUndoCount:0,
            videoPossibleRedoCount:0,
            imagePossibleRedoCount:0
        }, { new: true });

       
    
        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            data: {
                'folderId':projectUpdate.catId,
                'projectId':projectUpdate.id,
                'curFrameId':projectUpdate.currentFrameId,
                'srcFolType':ImageFolderSet,
                'srcFolPtr':projectUpdate.imageFolInPtr,
                // 'dstFolType':ImageFolderSet,
                // 'dstFolPtr':projectUpdate.imageFolInPtr,
                'videoToFrameWarmPopUp':true,
        }
        });
    } catch (error) {
        next(error);
    }
    
}

exports.getUpdoRedo = async (req, res, next) => {
    try {
        
        const { projectId: id } = req.body;
        const project = await Project.findById(id);
        
        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }
        

        let isUndoPossible=false;
        if (project.imagePossibleUndoCount > 0){
            isUndoPossible=true
        }else if((project.handoverPossibleImageToVideoFlag) && (project.videoPossibleUndoCount > 0)){
            isUndoPossible=true
        }else{
            isUndoPossible=false
        }

        let isRedoPossible=false;
        if (project.imagePossibleRedoCount > 0){
            isRedoPossible=true
        }else if((project.handoverPossibleImageToVideoFlag) && (project.videoPossibleRedoCount > 0)){
            isRedoPossible=true
        }else{
            isRedoPossible=false
        }
            

        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            data: {
                'folderId':project.catId,
                'projectId':project.id,
                isUndoPossible,
                isRedoPossible
            }
        });

    } catch (error) {
        next(error);
    }
}
exports.getUndo = async (req, res, next) => {
    try {
        const { projectId: id } = req.body;
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }
       

        if (project.imagePossibleUndoCount > 1){

            const imagePossibleUndoCount = project.imagePossibleUndoCount - 1
            const imagePossibleRedoCount = project.imagePossibleRedoCount + 1
            const imageFolInPtr = ((project.imageFolInPtr - 2 + project.totalImageFolderSet) % project.totalImageFolderSet) + 1

            const projectUpdate = await Project.findByIdAndUpdate(id, {
                imagePossibleUndoCount,
                imagePossibleRedoCount,
                imageFolInPtr,
                'srcFolType':ImageFolderSet,
                'srcFolPtr':imageFolInPtr,
                'refreshThumbnail':false,
                'curThumbFolPtr':project.curThumbFolPtr,
                'curThumbFolType':project.curThumbFolType,
                'curFrameFolPtr':imageFolInPtr,
                'curFrameFolType':ImageFolderSet
            }, { new: true });

            res.status(201).json({
                statusCode: 200,
                status: 'Success',
                message: 'Successfully authenticated.',
                data: {
                    'folderId':projectUpdate.catId,
                    'projectId':projectUpdate.id,
                    'curFrameId':projectUpdate.currentFrameId,
                    'srcFolType':ImageFolderSet,
                    'srcFolPtr':projectUpdate.imageFolInPtr,
                    'refreshThumbnail':false,
                    'curThumbFolPtr':project.curThumbFolPtr,
                    'curThumbFolType':project.curThumbFolType,
                    'curFrameFolPtr':imageFolInPtr,
                    'curFrameFolType':ImageFolderSet
                }
            });


        }else if(project.imagePossibleUndoCount == 1){
            if(project.handoverPossibleImageToVideoFlag){
                var imagePossibleUndoCount = 0
                var imagePossibleRedoCount = project.imagePossibleRedoCount + 1
                var videoPossibleRedoCount = 0 
                var imageFolInPtr =project.imageFolInPtr;
                var srcFolPtr=project.videoFolInPtr;
                var srcFolType = VideoFolderSet
            }else{
                var imagePossibleUndoCount = project.imagePossibleUndoCount - 1
                var imagePossibleRedoCount = project.imagePossibleRedoCount + 1
                var videoPossibleRedoCount = project.videoPossibleRedoCount 
                var imageFolInPtr = ((project.imageFolInPtr - 2 + project.totalImageFolderSet) % project.totalImageFolderSet) + 1
                var srcFolPtr=imageFolInPtr;
                var srcFolType = ImageFolderSet
            }
                

            const projectUpdate = await Project.findByIdAndUpdate(id, {
                imagePossibleUndoCount,
                imagePossibleRedoCount,
                videoPossibleRedoCount,
                imageFolInPtr,
                'srcFolType':srcFolType,
                'srcFolPtr':srcFolPtr,
                'refreshThumbnail':false,
                'curThumbFolPtr':project.curThumbFolPtr,
                'curThumbFolType':project.curThumbFolType,
                'curFrameFolPtr':srcFolPtr,
                'curFrameFolType':srcFolType
            }, { new: true });

            res.status(201).json({
                statusCode: 200,
                status: 'Success',
                message: 'Successfully authenticated.',
                data: {
                    'folderId':projectUpdate.catId,
                    'projectId':projectUpdate.id,
                    'curFrameId':projectUpdate.currentFrameId,
                    'srcFolType':srcFolType,
                    'srcFolPtr':srcFolPtr,
                    'refreshThumbnail':false,
                    'curThumbFolPtr':project.curThumbFolPtr,
                    'curThumbFolType':project.curThumbFolType,
                    'curFrameFolPtr':srcFolType,
                    'curFrameFolType':srcFolPtr
                }
            });

        }else{
            if((project.handoverPossibleImageToVideoFlag) && (project.videoPossibleUndoCount > 0)){
                const videoPossibleUndoCount = project.videoPossibleUndoCount - 1
                const videoPossibleRedoCount = project.videoPossibleRedoCount + 1
                const videoFolInPtr = ((project.videoFolInPtr - 2 + project.totalVideoFolderSet) % project.totalVideoFolderSet) + 1

                const projectUpdate = await Project.findByIdAndUpdate(id, {
                    videoPossibleUndoCount,
                    videoPossibleRedoCount,
                    videoFolInPtr,
                    'srcFolType':VideoFolderSet,
                    'srcFolPtr':videoFolInPtr,
                    'refreshThumbnail':true,
                    'curThumbFolPtr':videoFolInPtr,
                    'curThumbFolType':VideoFolderSet,
                    'curFrameFolPtr':videoFolInPtr,
                    'curFrameFolType':VideoFolderSet
                }, { new: true });

                res.status(201).json({
                    statusCode: 200,
                    status: 'Success',
                    message: 'Successfully authenticated.',
                    data: {
                        'folderId':projectUpdate.catId,
                        'projectId':projectUpdate.id,
                        'curFrameId':projectUpdate.currentFrameId,
                        'srcFolType':VideoFolderSet,
                        'srcFolPtr':projectUpdate.videoFolInPtr,
                        'refreshThumbnail':true,
                        'curThumbFolPtr':videoFolInPtr,
                        'curThumbFolType':VideoFolderSet,
                        'curFrameFolPtr':videoFolInPtr,
                        'curFrameFolType':VideoFolderSet
                    }
                });
            }
            
        }


    } catch (error) {
        next(error);
    }
}

exports.getRedo = async (req, res, next) => {
    try {
        const { projectId: id } = req.body;
        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }

        let imagePossibleUndoCount=project.imagePossibleUndoCount;
        let imagePossibleRedoCount=project.imagePossibleUndoCount;
        let videoPossibleRedoCount=project.imagePossibleUndoCount;
        let videoPossibleUndoCount=project.imagePossibleUndoCount;
        let imageFolInPtr=project.imageFolInPtr
        let videoFolInPtr = project.videoFolInPtr
        let srcFolType=VideoFolderSet;
        let srcFolPtr=(project.videoFolInPtr)?project.videoFolInPtr:1

        if(project.imagePossibleRedoCount > 0){
            if (project.handoverPossibleImageToVideoFlag && (project.imagePossibleUndoCount == 0)){
            imagePossibleUndoCount = 1
            imagePossibleRedoCount = imagePossibleRedoCount - 1
            videoPossibleRedoCount = 0
            srcFolType=ImageFolderSet;
            srcFolPtr=project.imageFolInPtr
            // imageFolInPtr =project.imageFolInPtr
            // videoPossibleUndoCount =  project.videoPossibleUndoCount
            // videoFolInPtr = project.videoFolInPtr
            // return (CUR_FRAME_ID --> currentFrameId, SRC_FOL_TYPE --> ImageFolderSet, SRC_FOL_PTR --> imageFolInPtr, REFRESH_THUMBNAIL = False)
            }else{
            imagePossibleRedoCount = project.imagePossibleRedoCount - 1
            imagePossibleUndoCount =  project.imagePossibleUndoCount + 1
            imageFolInPtr = (project.imageFolInPtr % project.totalImageFolderSet ) + 1
            srcFolType=ImageFolderSet;
            srcFolPtr=imageFolInPtr
            // videoPossibleRedoCount = project.videoPossibleRedoCount
            // videoPossibleUndoCount =  project.videoPossibleUndoCount
            // videoFolInPtr = project.videoFolInPtr
            // return (CUR_FRAME_ID --> currentFrameId, SRC_FOL_TYPE --> ImageFolderSet, SRC_FOL_PTR --> imageFolInPtr, REFRESH_THUMBNAIL = False)
            }
        }else if(project.handoverPossibleImageToVideoFlag && (project.videoPossibleRedoCount > 0)){
            videoPossibleRedoCount = project.videoPossibleRedoCount - 1
            videoPossibleUndoCount =  project.videoPossibleUndoCount + 1
            videoFolInPtr = (project.videoFolInPtr % project.totalVideoFolderSet ) + 1
            srcFolType=VideoFolderSet;
            srcFolPtr=videoFolInPtr
            // imageFolInPtr = project.imageFolInPtr
            // imagePossibleUndoCount = project.imagePossibleUndoCount
            // imagePossibleRedoCount = project.imagePossibleRedoCount
            // return (CUR_FRAME_ID --> currentFrameId, SRC_FOL_TYPE --> VideoFolderSet, SRC_FOL_PTR --> videoFolInPtr, REFRESH_THUMBNAIL = True)
        }
        const projectUpdate = await Project.findByIdAndUpdate(id, {
            videoPossibleRedoCount,
            videoPossibleUndoCount,
            videoFolInPtr,
            imageFolInPtr,
            imagePossibleUndoCount,
            imagePossibleRedoCount,
            'srcFolType':srcFolType,
            'srcFolPtr':srcFolPtr,
            'dstFolType':srcFolType,
            'dstFolPtr':videoFolInPtr,
            'refreshThumbnail':true,
            'curThumbFolPtr':videoFolInPtr,
            'curThumbFolType':VideoFolderSet,
            'curFrameFolPtr':srcFolPtr,
            'curFrameFolType':srcFolType
        }, { new: true });

        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            data: {
                'folderId':projectUpdate.catId,
                'projectId':projectUpdate.id,
                'curFrameId':projectUpdate.currentFrameId,
                'srcFolType':srcFolType,
                'srcFolPtr':srcFolPtr,
                'dstFolType':srcFolType,
                'dstFolPtr':projectUpdate.videoFolInPtr,
                'refreshThumbnail':true,
                'curThumbFolPtr':videoFolInPtr,
                'curThumbFolType':VideoFolderSet,
                'curFrameFolPtr':srcFolPtr,
                'curFrameFolType':srcFolType
            }
        });


    } catch (error) {
        next(error);
    }
}
//////////Discard////////////////////
exports.SaveSnapImage = async (req, res, next) => {
    try {
        const { projectId: id } = req.body;
        const imagePossibleUndoCount = 0
        const videoPossibleRedoCount = 0
        const imagePossibleRedoCount = 0

        const operatePossibleOnVideoFlag = true
        const handoverPossibleImageToVideoFlag = true
       

        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }

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
            
            // Check if the source file exists before attempting to copy
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
                'srcFolType':VideoFolderSet,
                'srcFolPtr':projectUpdate.videoFolInPtr,
                'refreshThumbnail':false,
        }, { new: true });

        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            data: {
                'folderId':projectUpdate.catId,
                'projectId':projectUpdate.id,
                'curFrameId':projectUpdate.currentFrameId,
                'srcFolType':VideoFolderSet,
                'srcFolPtr':projectUpdate.videoFolInPtr,
                'refreshThumbnail':false,
            }
        });
        
    
    } catch (error) {
        next(error);
    }

}

exports.getSaveImagePossible = async (req, res, next) => {
    try {
        const { projectId: id } = req.body;
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }
        

    res.status(201).json({
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        data: {
            'folderId':project.catId,
            'projectId':project.id,
            'isPossible':(project.imagePossibleUndoCount)>0 ? true : false,
        }
    });

    } catch (error) {
        next(error);
    }

}

exports.getDiscardImage = async (req, res, next) => {
    try {
        const { projectId: id } = req.body;
        const project = await Project.findById(id);

        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }

        const imagePossibleUndoCount = 0
        const videoPossibleRedoCount = 0
        const imagePossibleRedoCount = 0

        const operatePossibleOnVideoFlag = true
        const handoverPossibleImageToVideoFlag = true
        

        const projectUpdate = await Project.findByIdAndUpdate(id, {
            imagePossibleUndoCount,
            videoPossibleRedoCount,
            imagePossibleRedoCount,
            operatePossibleOnVideoFlag,
            handoverPossibleImageToVideoFlag,
            'srcFolType':VideoFolderSet,
            'srcFolPtr':project.videoFolInPtr,
            'refreshThumbnail':false,
            'curThumbFolPtr':project.curThumbFolPtr,
            'curThumbFolType':project.curThumbFolType,
            'curFrameFolPtr':project.curThumbFolPtr,
            'curFrameFolType':project.curThumbFolType
    }, { new: true });

    res.status(201).json({
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        data: {
            'folderId':projectUpdate.catId,
            'projectId':projectUpdate.id,
            'curFrameId':projectUpdate.currentFrameId,
            'srcFolType':VideoFolderSet,
            'srcFolPtr':projectUpdate.videoFolInPtr,
            'refreshThumbnail':false,
        }
    });

    } catch (error) {
        next(error);
    }

}

exports.createProject = async (req, res, next) => {
    try { 
        const {projectName,catId : id} = req.body;
        let casefolder = await Casefolder.findById(id);
        if(!casefolder){
             casefolder = new Casefolder({
                folderName:'anonymous',
                userId:req.user.id
            })
    
            await casefolder.save();
        }
        const project = new Project({
            projectName,
            catId:id,
            catName:casefolder.folderName,
            userId:req.user.id,
        })
        await project.save();

        
        // const folderPath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${project.id}`;
        // const rootDir = path.resolve(__dirname, '..', '..');
        // const basePath = path.join(rootDir, folderPath);
        const basePath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${project.id}`;
        

        createFolder(`${basePath}/main`);
        createFolder(`${basePath}/snap`);
        createFolder(`${basePath}/temp/1`);


        for (let i = 1; i <= project.totalVideoFolderSet; i++) {
        const dynamicFolderName = `${basePath}/video/${i}`; // Create a folder with the project limit
        createFolder(dynamicFolderName);
        }

        
        for (let i = 1; i <= project.totalImageFolderSet; i++) {
        const dynamicFolderNameImg = `${basePath}/image/${i}`; // Create a folder with the project limit
        createFolder(dynamicFolderNameImg);
        }

        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully created.',
            data:{
            'folderId':project.catId,
            'projectId':project.id,
            'curFrameId':project.currentFrameId,
            'srcFolType':VideoFolderSet,
            'srcFolPtr':project.videoFolInPtr,
            'dstFolType':ImageFolderSet,
            'dstFolPtr':project.imageFolInPtr,
            'videoToFrameWarmPopUp':true,
            }
        })
    } catch (error) {
        // consoleLogger.info(error);
        next(error);
    }
}

function createFolder(folderPath) {
  
    fs.mkdir(folderPath, { recursive: true }, (err) => {
      if (err) {
        return console.error(`Error creating folder: ${err.message}`);
      }
    //   console.log(`Folder  created successfully at ${folderPath}`);
    });
  }

exports.updateProject = async (req, res, next) => {
    try {
        const {projectName,id} = req.body;
        const project = await Project.findByIdAndUpdate(id, {'projectName':projectName}, { new: true });
        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Data not found'
            });
        }

        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Update Successfully.',
            data:{'projectName':project.projectName}
        })
    } catch (error) {
        next(error);
    }
    
}

exports.deleteProject = async (req, res, next) => {
    try {
        const { projectId: id } = req.body;
        const project = await Project.findByIdAndDelete(id);

        // If the project is not found, return a 404 response
        if (!project) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: 'Project not found',
            });
        }

        // Successfully deleted the project
        res.status(200).json({
            statusCode: 200,
            status: 'Success',
            message: 'Project deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
    
}


exports.uploadFiles = async (req, res, next) => {  // Mark the function as async
    
    try {

        const {catId : id} = req.query;

        const totalSeconds = (req.query.startTime)?req.query.startTime:0;

        // Calculate hours, minutes, and seconds
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        // Format the result as 'hh:mm:ss'
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;


       
        
        if(id){
            var casefolder = await Casefolder.findById(id).select('folderName');
            if (!casefolder) {
                return res.status(404).json({
                    statusCode: 404,
                    status: 'Failed',
                    message: 'Data not found'
                });
            }
        } else{
            var casefolder = new Casefolder({
                folderName:'anonymous',
                userId:req.user.id,
            })
    
            await casefolder.save();
        }

        
        const project = new Project({
            projectName:'anonymous',
            catId:casefolder.id,
            catName:casefolder.folderName,
            userId:req.user.id,
        })
        await project.save();

        
        // const folderPath = `${process.env.MEDIA_BASE_PATH}/${req.user.id}/${project.id}`;
        // const rootDir = path.resolve(__dirname, '..', '..');
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
        const dynamicFolderNameImg = `${basePath}/image/${i}`; // Create a folder with the project limit
        createFolder(dynamicFolderNameImg);
        }

        // Configure storage settings for multer
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'public/uploads');  // Folder where the videos will be stored
            },
            filename: function (req, file, cb) {
                cb(null, Date.now() + path.extname(file.originalname));  // Append timestamp to the file name
            }
        });

        // Filter the file types to accept only video formats
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

        // Initialize multer
        const upload = multer({
            storage: storage,
            limits: { fileSize: 1000000000 },  // 1GB
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

            const rootDir = path.resolve(__dirname, '..', '..');
            const inputPath = req.file.path; //path.join(rootDir, req.file.path);
            let outputPath = `public/uploads/crop/${req.file.filename}`;//path.join(rootDir, `public/uploads/videos/crop/${req.file.filename}`);

            try {
                // Get the video duration
                const fileMetadata = await getVideoDuration(inputPath);  // Await inside async function
                const videoDuration =fileMetadata.format.duration;
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
                if (videoDuration < maxDuration){
                    fsExtra.copy(`${inputPath}`, `${outputPath}`, (err) => {
                        if (err) return console.error('Error copying the file:', err);
                        console.log('File copied successfully.');
                    });
                    outputPath=inputPath;
                } 

                const frameNumber = 0; // Example frame number
                const formattedFileName = `frame_${formatFrameNumber(frameNumber)}`;
                
                const frameOutputDir = `${basePath}/main/frame_%d.png`; // %d will be replaced by frame number
                const videoCon = await convertVideo(outputPath, frameOutputDir);  // Await async function
                
                const dataFiles = await getTotalFiles(`${basePath}/main`);
                
                
                
                fsExtra.unlink(inputPath, (unlinkErr) => {
                    console.log('Video file deleted successfully.');
                });
                // Success response
                
                fsExtra.copy(`${basePath}/main`, `${basePath}/video/1`, (err) => {
                    if (err) return console.error('Error copying the file:', err);
                    console.log('File copied successfully.');
                });
                $projectDetails={
                    "fileName":req.file.filename,
                    "fileSize":fileMetadata.format.size,
                    "fileResolution":fileMetadata.format.bit_rate,
                    "fileDuration":fileMetadata.format.duration,
                    "fileFrameRate":'',
                    "fileAspectRatio":'',
                    "createOn":''
                }

                dataFiles.filesName.sort((a, b) => {
                    // Extract the numbers from the file names
                    const numA = parseInt(a.match(/\d+/)[0]);
                    const numB = parseInt(b.match(/\d+/)[0]);
                
                    // Sort numerically
                    return numA - numB;
                });

                const updateproject = await Project.findByIdAndUpdate(project.id, 
                        {
                        'filesName':JSON.stringify(dataFiles.filesName),
                        'currentFrameId':'frame_1.png',
                        'projectDetails':JSON.stringify($projectDetails)
                    }, { new: true });

                res.status(201).json({
                    statusCode: 200,
                    status: 'Success',
                    message: 'Video uploaded and processed successfully.',
                    data:{
                        totalFiles:dataFiles.totalFiles,
                        'folderId':updateproject.catId,
                        'projectId':updateproject.id,
                        'curFrameId':updateproject.currentFrameId,
                        'srcFolType':VideoFolderSet,
                        'srcFolPtr':updateproject.videoFolInPtr,
                        // 'dstFolType':ImageFolderSet,
                        // 'dstFolPtr':updateproject.imageFolInPtr,
                        'videoToFrameWarmPopUp':true,
                        'filesName':dataFiles.filesName,
                        projectDetails:$projectDetails
                    }
                    
                });
            } catch (error) {
                // console.error('Error processing the video:', error);
                res.status(500).json({ message: 'Server error', error: error.message });
            }
            
        });
    } catch (error) {
        // console.error('Error uploading files:', error);
        errorLogger.info(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

function formatFrameNumber(number) {
    // Convert the number to a string and pad it with leading zeros up to 6 digits
    return number.toString().padStart(5, '0');
}

// Function to cut the video
async function cutVideo(inputPath, outputPath, startTime, duration) {
    // Return a promise to handle the asynchronous nature of ffmpeg
    return new Promise((resolve, reject) => {
        // Set the path to ffmpeg binary if in development mode
        if (process.env.NODE_ENV === 'development') {
            ffmpeg.setFfmpegPath('C:\\Users\\barik\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe');
        }

        // Execute the ffmpeg command to cut the video
        ffmpeg(inputPath)
            .setStartTime(startTime) // Start time in the format 'HH:MM:SS' or seconds
            .setDuration(duration)   // Duration in seconds
            .on('end', () => {
                console.log('Video cutting finished!');
                resolve(); // Resolve the promise when the operation completes
            })
            .on('error', (err) => {
                // console.error('Error cutting video:', err.message);
                reject(err); // Reject the promise in case of an error
            })
            .save(outputPath); // Save the output video to the specified path
    });
}

// function cutVideoOld(inputPath, outputPath, startTime, duration) {
//     const ffmpeg = require('fluent-ffmpeg');
//     if(`${process.env.NODE_ENV}`=='development')
//     ffmpeg.setFfmpegPath('C:\\Users\\barik\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe'); // Optional: specify the path if not in PATH
//     ffmpeg(inputPath)
//       .setStartTime(startTime) // Start time in the format 'HH:MM:SS' or seconds
//       .setDuration(duration)   // Duration in seconds
//       .on('end', () => {
//         console.log('Video cutting finished!');
//       })
//       .on('error', (err) => {
//         console.log('Error:', err.message);
//       })
//       .save(outputPath); // Save the output video
//   }

  async function convertVideo(inputPath, outputDir) {
    
    return new Promise((resolve, reject) => {
        if(`${process.env.NODE_ENV}`=='development')
        ffmpeg.setFfmpegPath('C:\\Users\\barik\\Downloads\\ffmpeg-master-latest-win64-gpl\\ffmpeg-master-latest-win64-gpl\\bin\\ffmpeg.exe');
        ffmpeg(inputPath)
            .on('end', () => {
                console.log('Frames extracted successfully.');
                resolve(1);
            })
            .on('error', (err) => {
                // console.error('Error extracting frames:', err);
                reject(`Error extracting frames: ${err.message}`);
            })
            // Save one frame every second, you can adjust the frame rate here
            .outputOptions('-vf', 'fps=10')
            .outputOptions('-q:v', '5')
            .output(outputDir)
            .run();
    });
       
  }

  async function getVideoDuration(inputPath) {
    return new Promise((resolve, reject) => {
        if(`${process.env.NODE_ENV}`=='development')
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
}

async function getTotalFiles(folderPath) {
    return new Promise((resolve, reject) => {
        fs.readdir(folderPath, (err, files) => {
            if (err) {
                return reject(err);
            }

            // Filter out directories (only files are needed)
            const filteredFiles = files.filter(file => {
                return fs.statSync(path.join(folderPath, file)).isFile();
            });

            // Get the total count of files
            const totalFiles = filteredFiles.length;

            // Resolve with both file names and the total number
            resolve({ totalFiles, filesName: filteredFiles });
        });
    });
}