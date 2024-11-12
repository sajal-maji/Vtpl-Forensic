const {filterOperation } = require('../utils/filterOperation');
const { MeasureServiceClient } = require('../grpcClient'); 

const measureOneD = async (req, res, next) => {
    try {
        const requestObj = {};
        const response = await filterOperation(req,res,next, requestObj,MeasureServiceClient,'MeasureOneD');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const measureTwoD = async (req, res, next) => {
    try {
        const requestObj = {};
        const response = await filterOperation(req,res,next, requestObj,MeasureServiceClient,'MeasureTwoD');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const measureThreeD = async (req, res, next) => {
    try {
        const requestObj = {};
        const response = await filterOperation(req,res,next, requestObj,MeasureServiceClient,'MeasureThreeD');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


module.exports = {
    measureOneD,
    measureTwoD,
    measureThreeD
}

