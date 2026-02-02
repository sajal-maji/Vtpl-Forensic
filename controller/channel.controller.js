const { channelServiceClient,PDFGenerateServiceClient } = require('../grpcClient'); // Import gRPC client
const projectService = require("../services/project.service");
// const Imagefilter = require('../model/imagefilter.model');
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
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'ColorSwitchFilter','color_switch');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const grayscaleConversion = async (req, res, next) => {
    try {
        const requestObj = {
        };
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'GrayscaleFilter','grayscale_conversion');
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
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'ColorConversionFilter','color_conversion');
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
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'ExtractSingleChannelFilter','extract_channel');
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
        const response = await filterOperation(req, res, next, requestObj, channelServiceClient, 'DisplaySelectedChannelFilter','display_selected_channels');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const generatePdf = async (req, res, next) => {
    try {
        const { projectId, frameName } = req.body;

        if (!projectId) {
            return res.status(400).json({
                statusCode: 400,
                message: 'Project ID is required'
            });
        }

        // Fetch raw operation history
        const operationDetails = await pdfService.getOperationDetails(
            projectId,
            frameName,
            req
        );

        if (!operationDetails || operationDetails.length === 0) {
            return res.status(404).json({
                statusCode: 404,
                message: 'No operation details found for the provided project ID'
            });
        }

        // ✅ Resolve Undo / Redo → legal operations only
        const legalOperations = resolveLegalOperations(operationDetails);
        console.log('--------Operation-----------',legalOperations)
        if (legalOperations.length === 0) {
            return res.status(400).json({
                statusCode: 400,
                message: 'No valid operations available after Undo/Redo resolution'
            });
        }

        const rootPath = `${req.user.id}/${projectId}`;
        const pdfDir = `public/${rootPath}/pdf`;

        if (!fs.existsSync(pdfDir)) {
            fs.mkdirSync(pdfDir, { recursive: true });
        }

        const rootDir = path.resolve(__dirname, '..', '..');
        const folderPath = process.env.PROJECT_FOLDER;
        const uploadPdfPath = path.join(rootDir, `${folderPath}/${pdfDir}`);

        // ✅ Send ONLY legal operations to PDF service
        const requestObj = {
            processes: legalOperations,
            processes_meta: {
                input_output_image_show_report: true
            },
            out_docs_path: uploadPdfPath
        };

        PDFGenerateServiceClient.PDFGeneretion(requestObj, (error, response) => {
            if (error) {
                return res.status(500).json({
                    statusCode: 500,
                    message: 'PDF generation failed',
                    details: error
                });
            }

            return res.status(200).json({
                message: 'PDF generated successfully',
                data: {
                    pdfUrl: `${rootPath}/pdf/report.pdf`,
                    docUrl: `${rootPath}/pdf/report.docx`
                }
            });
        });

    } catch (error) {
        return res.status(500).json({
            statusCode: 500,
            message: 'Internal server error',
            details: error.message
        });
    }
};


const resolveLegalOperations = (operations = []) => {
    const appliedStack = [];
    const redoStack = [];

    for (const op of operations) {
        const action = op?.process_name || op; // support object or string
console.log(action)
        if (action === 'undo') {
            if (appliedStack.length > 0) {
                redoStack.push(appliedStack.pop());
            }
        } 
        else if (action === 'redo') {
            if (redoStack.length > 0) {
                appliedStack.push(redoStack.pop());
            }
        } 
        else {
            appliedStack.push(op);
            redoStack.length = 0; // clear redo on new action
        }
    }

    return appliedStack;
};


// const generatePdf = async (req, res, next) => {
//     try {
//         const { projectId,frameName } = req.body;
        
//         if (!projectId) {
//             return res.status(400).json({ statusCode: 404,message: 'Project ID is required' });
//         }

//         const operationDetails = await pdfService.getOperationDetails(projectId,frameName,req);
//         // return res.status(200).json({operationDetails
//         // });
//         console.log('ppppppppppppp'+JSON.stringify(operationDetails));
//         if (operationDetails && operationDetails.length > 0) {
//             const rootPath = `${req.user.id}/${projectId}`;
           
//             let pdfDir = `public/${rootPath}/pdf`;
//             if (!fs.existsSync(pdfDir)) {
//                 fs.mkdirSync(pdfDir, { recursive: true });
//             }
//             let folderPath = process.env.PROJECT_FOLDER
//             const rootDir = path.resolve(__dirname, '..', '..');
//             const uploadPdfPath = path.join(rootDir, `${folderPath}/${pdfDir}`);


//             const requestObj = {
//                 processes: operationDetails,
//                 processes_meta: {
//                     input_output_image_show_report: true
//                 },
//                 out_docs_path: uploadPdfPath
//             };


//             PDFGenerateServiceClient.PDFGeneretion(requestObj, (error, response) => {
//                 if (error) {
//                     // console.error("gRPC error:", error);
//                     return res.status(404).json({ statusCode: 404,message: 'gRPC call failed', details: error });
//                 }
    
//                 // Respond with the gRPC response
//                 return res.status(200).json({
//                     message: 'Processing successfully Done',
//                     data:{
//                             pdfUrl:`${rootPath}/pdf/report.pdf`,
//                             docUrl:`${rootPath}/pdf/report.docx`
//                         },
//                         requestObj
//                     // response
//                 });
//             });
           
//         } else {
//             return res.status(404).json({ statusCode: 404,message: 'No operation details found for the provided project ID' });
//         }

//     } catch (error) {
//         return res.status(500).json({
//             error: 'Internal server error',
//             details: error.message
//         });
//     }
// };


module.exports = {
    grayscaleRoute,
    grayscaleConversion,
    colorswitchConversion,
    colorConversion,
    extractSingleChannel,
    displaySelectedChannels,
    generatePdf
}

