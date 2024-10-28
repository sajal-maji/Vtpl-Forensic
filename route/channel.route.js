const router = require('express').Router();


const { grayscaleConversion,colorswitchConversion,colorConversion,extractSingleChannel,displaySelectedChannels} = require('../controller/channel.controller');


router.put('/grayscale-conversion', grayscaleConversion);
router.put('/colorswitch-conversion', colorswitchConversion);
router.put('/color-conversion', colorConversion);
router.put('/extract-single-channel', extractSingleChannel);
router.put('/display-selected-channels', displaySelectedChannels);
// router.put('/preview-filter', previewFilter);ColorConversionFilter



const { levelControl,brightnessContrast,contrastStretch,clahe,intensityChange} = require('../controller/adjust.controller');
router.put('/level-control', levelControl);
router.put('/brightness-contrast', brightnessContrast);
router.put('/contrast-stretch', contrastStretch);
router.put('/clahe', clahe);
router.put('/intensity-change', intensityChange);
// router.put('/brightness-contrast', contrastStretch);
// router.put('/brightness-contrast', contrastStretch);

 
module.exports = router;