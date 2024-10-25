const { channelServiceClient } = require('../grpcClient'); // Import gRPC client
const projectService = require("../services/project.service");
const Imagefilter = require('../model/imagefilter.model');
const Project = require('../model/projects.model');
const path = require('path');
const fsExtra = require('fs-extra');
const fs = require('fs');

const { managePointer, folderPath, savePointer, cloneImage, checkFile } = require('../utils/servicePointer');

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
        // console.error("Unexpected error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const grayscaleConversion = async (req, res, next) => {
    try {

        const { projectId: id, isApplyToAll, frame, isPreview } = req.body;
        const { proDetails } = await managePointer(id, isApplyToAll, isPreview, frame, req, res);



        if (proDetails.statusCode != 200) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: proDetails.message
            });
        }

        const { errStatus, message } = await checkFile(id, isApplyToAll, proDetails, req, res);

        if (errStatus) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message
            });
        }




        const { imgBasePathFrom, imgBasePathTo } = await folderPath(id, isApplyToAll, isPreview, proDetails, req, res);
        const request = {
            in_img_path: imgBasePathFrom,  // Input image path
            process_all_flag: isApplyToAll,   // Process all flag
            in_img_list: frame,                // Input image list
            out_img_path: imgBasePathTo         // Output image path
        };

        // Make the gRPC request to the grayscale method (modify according to your method name)
        channelServiceClient.GrayscaleFilter(request, async (error, response) => {
            try {
                if (error) {
                    return res.status(404).json({
                        statusCode: 404,
                        status: 'Failed',
                        message: error
                    });
                }

                const { colData } = await savePointer(id, isApplyToAll, isPreview, frame, req, res, proDetails, response);

                return res.status(200).json({
                    message: 'Processing successfully Done',
                    data: colData,
                    response
                });


            } catch (saveError) {
                // Handle any errors that occurred during the saving process
                return res.status(500).json({ error: 'Failed to save image filter', details: saveError });
            }
        });

    } catch (error) {
        // console.error("Unexpected error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


const colorswitchConversion = async (req, res, next) => {
    try {
        const { projectId: id, isApplyToAll, frame, isPreview, subProcessNum } = req.body;
        const { proDetails } = await managePointer(id, isApplyToAll, isPreview, frame, req, res);

        if (proDetails.statusCode != 200) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: proDetails.message
            });
        }



        const { errStatus, message } = await checkFile(id, isApplyToAll, proDetails, req, res);

        if (errStatus) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message
            });
        }

        const { imgBasePathFrom, imgBasePathTo } = await folderPath(id, isApplyToAll, isPreview, proDetails, req, res);
        const request = {
            in_img_path: imgBasePathFrom,  // Input image path
            process_all_flag: isApplyToAll,   // Process all flag
            in_img_list: frame,                // Input image list
            out_img_path: imgBasePathTo,
            sub_process_num: subProcessNum         // Output image path
        };

        // Make the gRPC request to the grayscale method (modify according to your method name)
        channelServiceClient.ColorSwitchFilter(request, async (error, response) => {
            try {
                if (error) {
                    return res.status(404).json({
                        statusCode: 404,
                        status: 'Failed',
                        message: error
                    });
                }

                const { colData } = await savePointer(id, isApplyToAll, isPreview, frame, req, res, proDetails, response);
                return res.status(200).json({
                    message: 'Processing successfully Done',
                    data: colData,
                    response
                });
            } catch (saveError) {
                // Handle any errors that occurred during the saving process
                return res.status(500).json({ error: 'Failed to save image filter', details: saveError });
            }
        });

    } catch (error) {
        // console.error("Unexpected error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const colorConversion = async (req, res, next) => {
    try {
        console.log('call--1')
        const { projectId: id, isApplyToAll, frame, isPreview, subProcessBlack, subProcessWhite, subProcessMid } = req.body;
        const { proDetails } = await managePointer(id, isApplyToAll, isPreview, frame, req, res);

        if (proDetails.statusCode != 200) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: proDetails.message
            });
        }


        console.log('call-0', proDetails)

        const selectThumbnailFrame = await projectService.selectThumbnailFrame(req, id, frame[0]);

        console.log('call-1', selectThumbnailFrame)

        const { errStatus, message } = await checkFile(id, isApplyToAll, isPreview, proDetails, req, res);

        if (errStatus) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message
            });
        }


        const { imgBasePathFrom, imgBasePathTo } = await folderPath(id, isApplyToAll, isPreview, proDetails, req, res);


        // return res.status(404).json({
        //     statusCode: 404,
        //     status: 'Failed',
        //     imgBasePathFrom,
        //     imgBasePathTo
        // });

        const request = {
            in_img_path: imgBasePathFrom,  // Input image path
            process_all_flag: isApplyToAll,   // Process all flag
            in_img_list: frame,                // Input image list
            out_img_path: imgBasePathTo,
            sub_process_black: subProcessBlack,
            sub_process_white: subProcessWhite,
            sub_process_mid: subProcessMid       // Output image path
        };

        console.log('call-2', request)

        // Make the gRPC request to the grayscale method (modify according to your method name)
        channelServiceClient.ColorConversionFilter(request, async (error, response) => {
            try {
                if (error) {
                    return res.status(404).json({
                        statusCode: 404,
                        status: 'Failed',
                        message: error
                    });
                }

                const { colData } = await savePointer(id, isApplyToAll, isPreview, frame, req, res, proDetails, response);
                console.log('colData', colData)
                return res.status(200).json({
                    message: 'Processing successfully Done',
                    data: colData,
                    response
                });
            } catch (saveError) {
                // Handle any errors that occurred during the saving process
                return res.status(500).json({ error: 'Failed to save image filter', details: saveError });
            }
        });

    } catch (error) {
        // console.error("Unexpected error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const extractSingleChannel = async (req, res, next) => {
    try {
        const { projectId: id, isApplyToAll, frame, isPreview, subProcessNum } = req.body;
        const { proDetails } = await managePointer(id, isApplyToAll, isPreview, frame, req, res);

        if (proDetails.statusCode != 200) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message: proDetails.message
            });
        }

        const { errStatus, message } = await checkFile(id, isApplyToAll, proDetails, req, res);

        if (errStatus) {
            return res.status(404).json({
                statusCode: 404,
                status: 'Failed',
                message
            });
        }


        const { imgBasePathFrom, imgBasePathTo } = await folderPath(id, isApplyToAll, isPreview, proDetails, req, res);
        const request = {
            in_img_path: imgBasePathFrom,  // Input image path
            process_all_flag: isApplyToAll,   // Process all flag
            in_img_list: frame,                // Input image list
            out_img_path: imgBasePathTo,
            sub_process_num: subProcessNum         // Output image path
        };

        // Make the gRPC request to the grayscale method (modify according to your method name)
        channelServiceClient.ExtractSingleChannelFilter(request, async (error, response) => {
            try {
                if (error) {
                    return res.status(404).json({
                        statusCode: 404,
                        status: 'Failed',
                        message: error
                    });
                }

                const { colData } = await savePointer(id, isApplyToAll, isPreview, frame, req, res, proDetails, response);
                return res.status(200).json({
                    message: 'Processing successfully Done',
                    data: colData,
                    response
                });
            } catch (saveError) {
                // Handle any errors that occurred during the saving process
                return res.status(500).json({ error: 'Failed to save image filter', details: saveError });
            }
        });

    } catch (error) {
        // console.error("Unexpected error:", error);
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

module.exports ={
    grayscaleRoute,
    grayscaleConversion,
    colorswitchConversion,
    colorConversion,
    extractSingleChannel
}

