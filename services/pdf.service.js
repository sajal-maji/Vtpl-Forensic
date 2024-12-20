const Imageoperation = require('../model/imageoperation.model');
const fs = require('fs');
const path = require('path');

const getOperationDetails = async (projectId) => {    
    const operationDetails = await Imageoperation.find({ projectId: projectId });
    console.log('kkkkkkkkkkkkkkkkkk'+JSON.stringify(operationDetails));
    
    let processes = [];
    if (operationDetails.length > 0) {
        for (let i = 0; i < operationDetails.length; i++) {
            let data = {
                "process_index": operationDetails[i].processIndex,
                "process_name": operationDetails[i].processName,
                "exe_details_avail_flag": operationDetails[i].exeDetailsAvailFlag,
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