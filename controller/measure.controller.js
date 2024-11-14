const {filterOperation } = require('../utils/filterOperation');
const { MeasureServiceClient } = require('../grpcClient'); 

const measureOneD = async (req, res, next) => {
    try {
        const {inCalcDualPtRcList,inRefDualPtRcList,inRefVal } = req.body;
        const requestObj = {
            in_calc_dual_pt_rc_list : inCalcDualPtRcList,
            in_ref_dual_pt_rc_list : inRefDualPtRcList,
            in_ref_val:inRefVal
        };
        const response = await filterOperation(req,res,next, requestObj,MeasureServiceClient,'MeasureOneD','measure_1d');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const measureTwoD = async (req, res, next) => {
    try {
        const {inCalcDualPtRcList,inRefDualPtRcList,inRefValList } = req.body;
        const requestObj = {
            in_calc_dual_pt_rc_list : inCalcDualPtRcList,
            in_ref_dual_pt_rc_list : inRefDualPtRcList,
            in_ref_val_list:inRefValList
        };
        const response = await filterOperation(req,res,next, requestObj,MeasureServiceClient,'MeasureTwoD','measure_2d');
        res.status(200).json(response);

    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const measureThreeD = async (req, res, next) => {
    try {
        const {inCalcLineRc,inRefBaseHtMesrList,inRefLineRcList } = req.body;
        const requestObj = {
            in_calc_line_rc : inCalcLineRc,
            in_ref_base_ht_mesr_list : inRefBaseHtMesrList,
            in_ref_line_rc_list:inRefLineRcList
        };
        const response = await filterOperation(req,res,next, requestObj,MeasureServiceClient,'MeasureThreeD','measure_3d');
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

