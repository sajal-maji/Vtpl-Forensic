const {filterOperation } = require('../utils/filterOperation');
const { StablizationServiceClient } = require('../grpcClient'); 

const localStablization = async (req, res, next) => {
    try {
        const {inEnCol,inEnRow,inStCol,inStRow,inStabilizationPower,inVideoFps } = req.body;
        const requestObj = {
            in_en_col : inEnCol,
            in_en_row : inEnRow,
            in_st_col : inStCol,
            in_st_row : inStRow,
            in_stabilization_power : inStabilizationPower,
            in_video_fps : inVideoFps
        };
        const response = await filterOperation(req,res,next, requestObj,StablizationServiceClient,'LocalStablizationFilter','local_stabilization');
        res.status(response.statusCode).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const globalStabization = async (req, res, next) => {
    try {
        const {inStabilizationPower,inVideoFps } = req.body;
        const requestObj = {
            in_stabilization_power : inStabilizationPower,
            in_video_fps : inVideoFps
        };
        const response = await filterOperation(req,res,next, requestObj,StablizationServiceClient,'GlobalStablizationFilter','global_stabilization');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


module.exports = {
    localStablization,
    globalStabization
}

