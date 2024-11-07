const { channelServiceClient } = require('../grpcClient'); // Import gRPC client
const projectService = require("../services/project.service");
const Imagefilter = require('../model/imagefilter.model');
const Project = require('../model/projects.model');
const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');
const logger = require("../helpers/logEvents");
const pdfService = require("../services/pdf.service");

const { managePointer, folderPath, savePointer, cloneImage, checkFile } = require('../utils/servicePointer');
const { filterOperation } = require('../utils/filterOperation');

const grayscaleRoute = (req, res, next) => {
    try {
        const { process_all_flag, process_type } = req.body;
        const request = {
            in_img_path: "/home/vadmin/Documents/vtpl_grpc_server/output_frames",  // Input image path
            process_all_flag: process_all_flag,                             // Process all flag
            in_img_list: ["frame_0000.jpg"],                                // Input image list
            out_img_path: "/home/vadmin/Documents/vtpl_grpc_server/output_frames"          // Output image path
        };

        // Make the gRPC request to the grayscale method (modify according to your method name)
        channelServiceClient.GrayscaleFilter(request, (error, response) => {
            if (error) {
                // console.error("gRPC error:", error);
                return res.status(500).json({ error: 'gRPC call failed', details: error });
            }

            // Respond with the gRPC response
            return res.status(200).json({
                message: 'Processing successfully Done',
                data: colData,
                response
            });
        });

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const colorswitchConversion = async (req, res, next) => {
    try {
        const { subProcessNum } = req.body;
        const requestObj = {
            sub_process_num: subProcessNum
        };
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'ColorSwitchFilter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const grayscaleConversion = async (req, res, next) => {
    try {
        const requestObj = {
        };
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'GrayscaleFilter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const colorConversion = async (req, res, next) => {
    try {
        const { subProcessBlack, subProcessWhite, subProcessMid } = req.body;
        const requestObj = {
            sub_process_black: subProcessBlack,
            sub_process_white: subProcessWhite,
            sub_process_mid: subProcessMid
        };
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'ColorConversionFilter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const extractSingleChannel = async (req, res, next) => {
    try {
        const { subProcessNum } = req.body;
        const requestObj = {
            sub_process_num: subProcessNum
        };
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'ExtractSingleChannelFilter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const displaySelectedChannels = async (req, res, next) => {
    try {
        const { subProcessNum } = req.body;
        const requestObj = {
            sub_process_num: subProcessNum
        };
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'DisplaySelectedChannelFilter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const genetarePdf = async (req, res, next) => {
    try {
        const { projectId } = req.body;
        const operationDetails = await pdfService.getOperationDetails(projectId);
        if (operationDetails.length > 0) {
            let finalData = {
                operationDetails,
                "processes_meta": {
                    "input_output_image_show_report": false
                },
                "out_pdf_path": "path/to/output.pdf"
            }
            // const requestObj = {
            //     sub_process_num: operationDetails
            // };
            // const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'DisplaySelectedChannelFilter');
            res.status(200).json(finalData);
        }
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

module.exports = {
    grayscaleRoute,
    grayscaleConversion,
    colorswitchConversion,
    colorConversion,
    extractSingleChannel,
    displaySelectedChannels,
    genetarePdf
}

