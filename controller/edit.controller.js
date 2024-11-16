const { filterOperation } = require('../utils/filterOperation');
const { EditServiceClient } = require('../grpcClient');

const cropFilter = async (req, res, next) => {
    try {
        const { inEnCol, inEnRow, inStCol, inStRow } = req.body;
        const requestObj = {
            in_en_col: inEnCol,
            in_en_row: inEnRow,
            in_st_col: inStCol,
            in_st_row: inStRow
        };
        const response = await filterOperation(req, res, next, requestObj, EditServiceClient, 'CropFilter','crop');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const flipFilter = async (req, res, next) => {
    try {
        // const { } = req.body;
        const requestObj = { };
        const response = await filterOperation(req, res, next, requestObj, EditServiceClient, 'FlipFilter','flip');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const rotateFilter = async (req, res, next) => {
    try {
        const { inRotateDeg } = req.body;
        const requestObj = {
            in_rotate_deg: inRotateDeg,
        };
        const response = await filterOperation(req, res, next, requestObj, EditServiceClient, 'RotateFilter','rotate');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const resizeFilter = async (req, res, next) => {
    try {
        const { inRotateDeg, inEnCol, inEnRow, inStCol, inStRow,inKeepSameSelectionSize } = req.body;
        const requestObj = {
            in_rotate_deg: inRotateDeg,
            in_en_col: inEnCol,
            in_en_row: inEnRow,
            in_st_col: inStCol,
            in_st_row: inStRow,
            in_keep_same_selection_size: inKeepSameSelectionSize,
        };
        const response = await filterOperation(req, res, next, requestObj, EditServiceClient, 'ResizeFilter','resize');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const perspectiveFilter = async (req, res, next) => {
    try {
        const { inSelectRcArr } = req.body;
        const requestObj = {
            in_select_rc_arr:inSelectRcArr
        };
        const response = await filterOperation(req, res, next, requestObj, EditServiceClient, 'PerspectiveFilter','correct_perspective');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const undistortFilter = async (req, res, next) => {
    try {
        const { inDistortionPower } = req.body;
        const requestObj = {
            in_distortion_power:inDistortionPower
        };
        const response = await filterOperation(req, res, next, requestObj, EditServiceClient, 'UndistortFilter','undistort');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const aspectRatioFilter = async (req, res, next) => {
    try {
        const { inAspectRatioTimes } = req.body;
        const requestObj = {
            in_aspect_ratio_times:inAspectRatioTimes
        };
        const response = await filterOperation(req, res, next, requestObj, EditServiceClient, 'AspectRatioFilter','correct_aspect_ratio');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const fisheyeFilter = async (req, res, next) => {
    try {
        // const {} = req.body;
        const requestObj = {};
        const response = await filterOperation(req, res, next, requestObj, EditServiceClient, 'FisheyeFilter','correct_fisheye');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const smartResizeFilter = async (req, res, next) => {
    try {
        const { inLevelSt, inLevelMid, inLevelEn, outLevelSt, outLevelEn } = req.body;
        const requestObj = {
            in_en_col: inEnCol,
            in_en_row: inEnRow,
            in_st_col: inStCol,
            in_st_row: inStRow,
            in_scale_fact: inScaleFact
        };
        const response = await filterOperation(req, res, next, requestObj, EditServiceClient, 'SmartResizeFilter','smart_resize');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

module.exports = {
    cropFilter,
    flipFilter,
    rotateFilter,
    resizeFilter,
    perspectiveFilter,
    undistortFilter,
    aspectRatioFilter,
    fisheyeFilter,
    smartResizeFilter
   
}

