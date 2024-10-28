const {filterOperation } = require('../utils/filterOperation');

const levelControl = async (req, res, next) => {
    try {
        const {inLevelSt,inLevelMid,inLevelEn,outLevelSt,outLevelEn } = req.body;
        const requestObj = {
            in_level_st: inLevelSt,
            in_level_mid: inLevelMid,
            in_level_en: inLevelEn,
            out_level_st: outLevelSt,
            out_level_en: outLevelEn,   
        };
        const response = await filterOperation(req,res,next, requestObj,'LevelControlFilter');
        res.status(201).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const brightnessContrast = async (req, res, next) => {
    try {
        const {brightnessAmountChange,contrastChangeFactor } = req.body;
        const requestObj = {
           brightness_amount_change: brightnessAmountChange,
           contrast_change_factor: contrastChangeFactor,
        };
        const response = await filterOperation(req,res,next, requestObj,'BrightnessContrastChangeFilter');
        res.status(201).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const contrastStretch = async (req, res, next) => {
    try {
        const {inConStretchAmt } = req.body;
        const requestObj = {
            in_con_stretch_amt : inConStretchAmt,
        };
        const response = await filterOperation(req,res,next, requestObj,'ContrastStretchFilter');
        res.status(201).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const clahe = async (req, res, next) => {
    try {
        const {inClipLimit,gridRow,gridCol} = req.body;
        const requestObj = {
            in_clip_limit : inClipLimit,
            grid_row : gridRow,
            grid_col : gridCol,
        };
        const response = await filterOperation(req,res,next, requestObj,'ClaheFilter');
        res.status(201).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const intensityChange = async (req, res, next) => {
    try {
        const {intensityValueAmountChange} = req.body;
        const requestObj = {
          intensity_value_amount_change : intensityValueAmountChange,
        };
        const response = await filterOperation(req,res,next, requestObj,'IntensityChangeFilter');
        res.status(201).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


module.exports = {
    levelControl,
    brightnessContrast,
    contrastStretch,
    clahe,
    intensityChange
}

