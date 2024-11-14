const { filterOperation } = require('../utils/filterOperation');
const { adjustServiceClient } = require('../grpcClient');

const levelControl = async (req, res, next) => {
    try {
        const { inLevelSt, inLevelMid, inLevelEn, outLevelSt, outLevelEn } = req.body;
        const requestObj = {
            in_level_st: inLevelSt,
            in_level_mid: inLevelMid,
            in_level_en: inLevelEn,
            out_level_st: outLevelSt,
            out_level_en: outLevelEn,
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'LevelControlFilter','levels');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const brightnessContrast = async (req, res, next) => {
    try {
        const { brightnessAmountChange, contrastChangeFactor } = req.body;
        const requestObj = {
            brightness_amount_change: brightnessAmountChange,
            contrast_change_factor: contrastChangeFactor,
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'BrightnessContrastChangeFilter','contrast_and_brightness');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const contrastStretch = async (req, res, next) => {
    try {
        const { inConStretchAmt } = req.body;
        const requestObj = {
            in_con_stretch_amt: inConStretchAmt,
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'ContrastStretchFilter','contrast_stretch');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const clahe = async (req, res, next) => {
    try {
        const { inClipLimit, gridRow, gridCol } = req.body;
        const requestObj = {
            in_clip_limit: inClipLimit,
            grid_row: gridRow,
            grid_col: gridCol,
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'ClaheFilter','clahe');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const intensityChange = async (req, res, next) => {
    try {
        const { intensityValueAmountChange } = req.body;
        const requestObj = {
            intensity_value_amount_change: intensityValueAmountChange,
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'IntensityChangeFilter','intensity');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const hueSatValChange = async (req, res, next) => {
    try {
        const { hueDegreeChange, saturationTimesChange, intensityValueAmountChange } = req.body;
        const requestObj = {
            hue_degree_change: hueDegreeChange,
            saturation_times_change: saturationTimesChange,
            intensity_value_amount_change: intensityValueAmountChange,
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'HueSatValChangeFilter','hsv');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};
const saturationChange = async (req, res, next) => {
    try {
        const { saturationTimesChange } = req.body;
        const requestObj = {
            saturation_times_change: saturationTimesChange,
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'SaturationChangeFilter','hsv');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};
const hueChange = async (req, res, next) => {
    try {
        const { hueDegreeChange } = req.body;
        const requestObj = {
            hue_degree_change: hueDegreeChange,
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'HueChangeFilter','hsv');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};
const exposureControl = async (req, res, next) => {
    try {
        const { exposureTimes } = req.body;
        const requestObj = {
            exposure_times: exposureTimes
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'ExposureControlFilter','exposure');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};
const curve = async (req, res, next) => {
    try {
        const { curveXList, curveYList, curveColorChRed, curveColorChGreen, curveColorChBlue } = req.body;
        const requestObj = {
            curve_x_list: curveXList,
            curve_y_list: curveYList,
            curve_color_ch_red: curveColorChRed,
            curve_color_ch_green: curveColorChGreen,
            curve_color_ch_blue: curveColorChBlue
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'CurveFilter','curves');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};
const histogramEqualization = async (req, res, next) => {
    try {
        const { histogramCalcOnFullImgFlag, inStRow, inEnRow, inStCol, inEnCol } = req.body;
        const requestObj = {
            histogram_calc_on_full_img_flag: histogramCalcOnFullImgFlag,
            in_st_row: inStRow,
            in_en_row: inEnRow,
            in_st_col: inStCol,
            in_en_col: inEnCol,
        };
        const response = await filterOperation(req, res, next, requestObj, adjustServiceClient, 'HistogramEqualizationFilter','histogram_equalization');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

module.exports = {
    levelControl,
    brightnessContrast,
    contrastStretch,
    clahe,
    intensityChange,
    hueSatValChange,
    saturationChange,
    hueChange,
    exposureControl,
    curve,
    histogramEqualization
}

