const { DeblurServiceClient } = require('../grpcClient'); // Import gRPC client
const { filterOperation } = require('../utils/filterOperation');

const motionDeblur = async (req, res, next) => {
    try {
        
        const { inAngle,inDefocus,inDimention,inSnr } = req.body;
        const requestObj = {
            in_angle: inAngle,
            in_dimention: inDimention,
            in_snr: inSnr
        };
        const response = await filterOperation(req, res, next, requestObj, DeblurServiceClient, 'MotionFilter','motion_deblurring');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const OpticalDeblur = async (req, res, next) => {
    try {
        const { inAngle,inDefocus,inDimention,inSnr } = req.body;
        const requestObj = {
            in_dimention: inDimention,
            in_snr: inSnr
        };
        const response = await filterOperation(req, res, next, requestObj, DeblurServiceClient, 'OpticalFilter','optical_deblurring');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};


module.exports = {
    motionDeblur,
    OpticalDeblur
}

