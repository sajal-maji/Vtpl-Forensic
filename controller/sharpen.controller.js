const { SharpenServiceClient } = require('../grpcClient'); // Import gRPC client
const { filterOperation } = require('../utils/filterOperation');

const laplacianFilter = async (req, res, next) => {
    try {
        const { inLapMethod } = req.body;
        const requestObj = {
            in_lap_method: inLapMethod
        };
        const response = await filterOperation(req, res, next, requestObj, SharpenServiceClient, 'LaplacianFilter','laplacian_sharpening');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const unsharp = async (req, res, next) => {
    try {
        const { inSharpenPower,inSharpenSpread } = req.body;
        const requestObj = {
            in_sharpen_power: inSharpenPower,
            in_sharpen_spread: inSharpenSpread
        };
        const response = await filterOperation(req, res, next, requestObj, SharpenServiceClient, 'UnsharpMaskFilter','unsharp_masking');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


module.exports = {
    laplacianFilter,
    unsharp
}

