const {filterOperation } = require('../utils/filterOperation');
const { ExtractServiceClient } = require('../grpcClient'); 

const negativeFilter = async (req, res, next) => {
    try {
        const requestObj = {};
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'NegativeFilter','negative');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const thresholdFilter = async (req, res, next) => {
    try {
        const {thresholdOption,thresholdLevel } = req.body;
        const requestObj = {
            threshold_option: thresholdOption,
            threshold_level: thresholdLevel      
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'ThresholdFilter','threshold');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const adaptiveThreshold = async (req, res, next) => {
    try {
        const {adThEdgeReducer,adaptiveThresholdOption,adThBoxLen } = req.body;
        const requestObj = {
            ad_th_box_len:adThBoxLen,
            ad_th_edge_reducer: adThEdgeReducer,
            adaptive_threshold_option: adaptiveThresholdOption      
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'AdaptiveThresholdFilter','adaptive_threshold');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const laplace = async (req, res, next) => {
    try {
        const {inKernalSize} = req.body;
        const requestObj = {
            in_kernal_size: inKernalSize,
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'LaplaceFilter','laplace');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const prewitt = async (req, res, next) => {
    try {
        const requestObj = {
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'PrewittFilter','prewitt');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const sobel = async (req, res, next) => {
    try {
        const {inKernalSize } = req.body;
        const requestObj = {
            in_kernal_size: inKernalSize,    
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'SobelFilter','sobel');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const scharr = async (req, res, next) => {
    try {
        const requestObj = {
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'ScharrFilter','scharr');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const canny = async (req, res, next) => {
    try {
        const {inInclusionLowerLevel,inRejectionUpperLevel } = req.body;
        const requestObj = {
            in_inclusion_lower_level: inInclusionLowerLevel,
            in_rejection_upper_level: inRejectionUpperLevel      
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'CannyFilter','canny');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const linearFilter = async (req, res, next) => {
    try {
        const {inKernalOne,inKernalTwo,inFilterDisplayMode,kernalRequestFormat } = req.body;
        const requestObj = {
            in_kernal_1: inKernalOne,
            in_kernal_2: inKernalTwo,
            in_filter_display_mode:inFilterDisplayMode,
            kernal_request_format:kernalRequestFormat   
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'LinearFilter','linear_filter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const biLinear = async (req, res, next) => {
    try {
        const {inKernalOne,inKernalTwo } = req.body;
        const requestObj = {
            in_kernal_1: inKernalOne,
            in_kernal_2: inKernalTwo,
        }
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'BiLinearFilter','bilinear_filter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const channelSelector = async (req, res, next) => {
    try {
        const {inColorIntensitySelection,inManualColorLevel,inMidColorVal,inSpreadColor } = req.body;
        const requestObj = {
            in_color_intensity_selection: inColorIntensitySelection,
            in_manual_color_level: inManualColorLevel,
            in_mid_color_val: inMidColorVal,
            in_spread_color: inSpreadColor
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'ChannelSelectorFilter','channel_mixer');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const channelDemux = async (req, res, next) => {
    try {
        const {inSelectDualPtRcList,inBgRcPt,inFilterPassTrueBlockFalseFlag,inFilterPower } = req.body;
        const requestObj = {
            in_select_dual_pt_rc_list: inSelectDualPtRcList,
            in_bg_rc_pt: inBgRcPt,
            in_filter_pass_true_block_false_flag:inFilterPassTrueBlockFalseFlag,
            in_filter_power:inFilterPower      
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'ChannelDemuxFilter','color_deconvolution');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const fourier = async (req, res, next) => {
    try {
        const {inPeriodCloseness,inClarityStrength } = req.body;
        const requestObj = {
            in_period_closeness : inPeriodCloseness,
            in_clarity_strength : inClarityStrength
        };
        const response = await filterOperation(req,res,next, requestObj,ExtractServiceClient,'FourierFilter','fourier');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


module.exports = {
    negativeFilter,
    thresholdFilter,
    adaptiveThreshold,
    laplace,
    prewitt,
    sobel,
    scharr,
    canny,
    linearFilter,
    biLinear,
    channelSelector,
    channelDemux,
    fourier
}

