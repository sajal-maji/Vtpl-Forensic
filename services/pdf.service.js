const Imageoperation = require('../model/imageoperation.model');
const fs = require('fs');
const path = require('path');

const getOperationDetails = async (projectId) => {
    const operationDetails = await Imageoperation.find({ projectId: projectId });
    let processes = [];
    if (operationDetails.length > 0) {
        for (let i = 1; i <= operationDetails.operationDetails; i++) {
            let data = {
                "process_index": operationDetails[i].processIndex,
                "process_name": operationDetails[i].processName,
                "exe_details_avail_flag": operationDetails[i].exeDetailsAvailFlag,
                "exe_details": {
                    "details": operationDetails[i].exeDetails
                }
            }
            processes.push(data);
        }
    }
    return processes
};

module.exports = {
    getOperationDetails
};