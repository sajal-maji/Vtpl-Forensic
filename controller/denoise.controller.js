const { SharpenServiceClient } = require('../grpcClient'); // Import gRPC client
const { filterOperation } = require('../utils/filterOperation');

const averagingFilter = async (req, res, next) => {
    try {
        const { inFilterSize } = req.body;
        const requestObj = {
            in_filter_size: inFilterSize
        };
        const response = await filterOperation(req, res, next, requestObj, SharpenServiceClient, 'AveragingFilter','averaging_filter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const gaussianFilter = async (req, res, next) => {
    try {
        const { inFilterSize } = req.body;
        const requestObj = {
            in_filter_size: inFilterSize,
        };
        const response = await filterOperation(req, res, next, requestObj, SharpenServiceClient, 'GaussianSmoothingFilter','gaussian_filter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const bilateral = async (req, res, next) => {
    try {
        const { inFilterSize,inVariationRange } = req.body;
        const requestObj = {
            in_filter_size: inFilterSize,
            in_variation_range: inVariationRange
        };
        const response = await filterOperation(req, res, next, requestObj, SharpenServiceClient, 'BilateralFilter','bilateral_filter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const medianFilter = async (req, res, next) => {
    try {
        const { inFilterSize } = req.body;
        const requestObj = {
            in_filter_size: inFilterSize,
        };
        const response = await filterOperation(req, res, next, requestObj, SharpenServiceClient, 'MedianFilter','median_filter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const wiener = async (req, res, next) => {
    try {
        const { inFilterSize,wienerPowerVal } = req.body;
        const requestObj = {
            in_filter_size: inFilterSize,
            wiener_power_val: wienerPowerVal
        };
        const response = await filterOperation(req, res, next, requestObj, SharpenServiceClient, 'WienerFilter','wiener_filter');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


module.exports = {
    averagingFilter,
    gaussianFilter,
    bilateral,
    medianFilter,
    wiener
}

