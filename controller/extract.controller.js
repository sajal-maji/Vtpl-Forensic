const {filterOperation } = require('../utils/filterOperation');
const { adjustServiceClient } = require('../grpcClient'); 

const negativeFilter = async (req, res, next) => {
    try {
        const requestObj = {};
        const response = await filterOperation(req,res,next, requestObj,adjustServiceClient,'NegativeFilter');
        res.status(201).json(response);

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
        const response = await filterOperation(req,res,next, requestObj,adjustServiceClient,'ThresholdFilter');
        res.status(201).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


module.exports = {
    negativeFilter,
    thresholdFilter
}

