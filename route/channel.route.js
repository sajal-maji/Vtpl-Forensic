const router = require('express').Router();


const { grayscaleConversion,colorswitchConversion,colorConversion,extractSingleChannel } = require('../controller/channel.controller');


router.put('/grayscale-conversion', grayscaleConversion);
router.put('/colorswitch-conversion', colorswitchConversion);
router.put('/color-conversion', colorConversion);
router.put('/extract-single-channel', extractSingleChannel);
router.put('/display-selected-channels', displaySelectedChannels);
// router.put('/preview-filter', previewFilter);ColorConversionFilter
 
module.exports = router;