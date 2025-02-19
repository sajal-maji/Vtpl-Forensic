const Imageoperation = require('../model/imageoperation.model');
const fs = require('fs');
const path = require('path');

const getOperationDetails = async (projectId,req) => {    
    const operationDetails = await Imageoperation.find({ projectId: projectId });
    // console.log('kkkkkkkkkkkkkkkkkk'+JSON.stringify(operationDetails));
    
    let processes = [];
    if (operationDetails.length > 0) {
        const rootPath = `${req.user.id}/${projectId}`;
        let pdfDir = `public/${rootPath}/report_image`;
        const rootDir = path.resolve(__dirname, '..', '..');
        const uploadPdfPath = path.join(rootDir, `forensic_be/${pdfDir}`);
        for (let i = 0; i < operationDetails.length; i++) {
            const formattedValue = String(operationDetails[i].sequenceNum).padStart(6, "0");
                const saveInFileName = `pro_${formattedValue}_in.jpg`;
                const saveOutFileName =  `pro_${formattedValue}_out.jpg`;
                
            let data = {
                "process_index": operationDetails[i].processIndex,
                "process_name": operationDetails[i].processName,
                "exe_details_avail_flag": operationDetails[i].exeDetailsAvailFlag,
                "input_img_path" : `${uploadPdfPath}/${saveInFileName}`,
                "output_img_path" : `${uploadPdfPath}/${saveOutFileName}`,
                "exe_details": {
                    "details": operationDetails[i].exeDetails ? JSON.parse(operationDetails[i].exeDetails) : ''
                }
                
            }
            processes.push(data);
        }
    }    
    return processes;
};

module.exports = {
    getOperationDetails
};