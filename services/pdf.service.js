const Imageoperation = require('../model/imageoperation.model');
const fs = require('fs');
const path = require('path');

const getOperationDetails = async (projectId,frameName,req) => {
    if(!frameName)
        frameName='frame_000001.jpg'    
    const operationDetails = await Imageoperation.find({ projectId: projectId }).sort({ createdAt: -1 });
    const frameNumber = parseInt(frameName.match(/\d+/)[0], 10);
    // console.log('kkkkkkkkkkkkkkkkkk'+JSON.stringify(operationDetails));
    let processes = [];
    let applyToframeFlag = true
    let folderPath = process.env.PROJECT_FOLDER
    const rootDir = path.resolve(__dirname, '..', '..');
    const uploadPdfPath = path.join(rootDir, `${folderPath}`);
    if (operationDetails.length > 0) {
        for (let i = 0; i < operationDetails.length; i++) {
            if(frameNumber >= operationDetails[i].startFrameNumber &&  frameNumber <= operationDetails[i].endFrameNumber){
                let data = {
                    "process" : "ok",
                    "process_index": operationDetails[i].processIndex,
                    "process_name": operationDetails[i].processName,
                    "exe_details_avail_flag": operationDetails[i].exeDetailsAvailFlag,
                    "input_img_path" : `${uploadPdfPath}/${operationDetails[i].inputImgPath}`,
                    "output_img_path" : `${uploadPdfPath}/${operationDetails[i].outImgPath}`,
                    "exe_details": {
                        "details": operationDetails[i].exeDetails ? JSON.parse(operationDetails[i].exeDetails) : ''
                    }
                    
                }
                if(operationDetails[i].processType=='apply_to_all'){
                    applyToframeFlag = false
                    processes.push(data);
                }else if(operationDetails[i].processType!='apply_to_all' && applyToframeFlag){
                    processes.push(data);
                }
                    
            } else if(operationDetails[i].processType=='apply_to_all'){

                let data = {
                    "process" : "copy",
                    "process_index": operationDetails[i].processIndex,
                    "process_name": operationDetails[i].processName,
                    "exe_details_avail_flag": operationDetails[i].exeDetailsAvailFlag,
                    "input_img_path" : `${uploadPdfPath}/${operationDetails[i].inputImgPath}`,
                    "output_img_path" : `${uploadPdfPath}/${operationDetails[i].outImgPath}`,
                    "exe_details": {
                        "details": operationDetails[i].exeDetails ? JSON.parse(operationDetails[i].exeDetails) : ''
                    }
                    
                }

                processes.push(data);
            }
            
        }
    }
    return processes;
    
    // if (operationDetails.length > 0) {
    //     const rootPath = `${req.user.id}/${projectId}`;
    //     let pdfDir = `public/${rootPath}/report_image`;
    //     const rootDir = path.resolve(__dirname, '..', '..');
    //     const uploadPdfPath = path.join(rootDir, `forensic_be/${pdfDir}`);
    //     for (let i = 0; i < operationDetails.length; i++) {
    //         const formattedValue = String(operationDetails[i].sequenceNum).padStart(6, "0");
    //             const saveInFileName = `pro_${formattedValue}_in.jpg`;
    //             const saveOutFileName =  `pro_${formattedValue}_out.jpg`;
                
    //         let data = {
    //             "process_index": operationDetails[i].processIndex,
    //             "process_name": operationDetails[i].processName,
    //             "exe_details_avail_flag": operationDetails[i].exeDetailsAvailFlag,
    //             "input_img_path" : `${uploadPdfPath}/${saveInFileName}`,
    //             "output_img_path" : `${uploadPdfPath}/${saveOutFileName}`,
    //             "exe_details": {
    //                 "details": operationDetails[i].exeDetails ? JSON.parse(operationDetails[i].exeDetails) : ''
    //             }
                
    //         }
    //         processes.push(data);
    //     }
    // }    
    // return processes;
};

module.exports = {
    getOperationDetails
};