const router = require('express').Router();


const { grayscaleConversion, colorswitchConversion, colorConversion, extractSingleChannel, displaySelectedChannels, generatePdf } = require('../controller/channel.controller');


router.put('/grayscale-conversion', grayscaleConversion);
router.put('/colorswitch-conversion', colorswitchConversion);
router.put('/color-conversion', colorConversion);
router.put('/extract-single-channel', extractSingleChannel);
router.put('/display-selected-channels', displaySelectedChannels);
// router.put('/preview-filter', previewFilter);ColorConversionFilter
router.put('/generate-pdf', generatePdf);



const { levelControl, brightnessContrast, contrastStretch, clahe, intensityChange, hueSatValChange, saturationChange, hueChange, exposureControl, curve, histogramEqualization } = require('../controller/adjust.controller');
router.put('/level-control', levelControl);
router.put('/brightness-contrast', brightnessContrast);
router.put('/contrast-stretch', contrastStretch);
router.put('/clahe', clahe);
router.put('/intensity-change', intensityChange);
router.put('/hue-sat-val-change', hueSatValChange);
router.put('/saturation-change', saturationChange);
router.put('/hue-change', hueChange);
router.put('/exposure-control', exposureControl);
router.put('/curve', curve);
router.put('/histogram-equalization', histogramEqualization);

const { negativeFilter, thresholdFilter, adaptiveThreshold, laplace, prewitt, sobel, scharr, canny, linearFilter, biLinear, channelSelector, channelDemux, fourier } = require('../controller/extract.controller');
router.put('/negative-filter', negativeFilter);
router.put('/threshold-filter', thresholdFilter);

router.put('/adaptive-threshold', adaptiveThreshold);

router.put('/laplace', laplace);
router.put('/prewitt', prewitt);
router.put('/sobel', sobel);
router.put('/scharr', scharr);
router.put('/canny', canny);

router.put('/linear-filter', linearFilter);
router.put('/biLinear', biLinear);
router.put('/channel-selector', channelSelector);
router.put('/channel-demux', channelDemux);
router.put('/fourier', fourier);


const { measureOneD, measureTwoD, measureThreeD} = require('../controller/measure.controller');
router.put('/measure-one-d', measureOneD);
router.put('/measure-two-d', measureTwoD);
router.put('/measure-three-d', measureThreeD);

const { cropFilter, flipFilter, rotateFilter, resizeFilter, perspectiveFilter, undistortFilter, aspectRatioFilter, fisheyeFilter,  smartResizeFilter} = require('../controller/edit.controller');
router.put('/crop', cropFilter);
router.put('/flip', flipFilter);
router.put('/rotate', rotateFilter);
router.put('/resize', resizeFilter);
router.put('/perspective', perspectiveFilter);
router.put('/undistort', undistortFilter);
router.put('/aspect-ratio', aspectRatioFilter);
router.put('/fisheye', fisheyeFilter);
router.put('/smart-resize', smartResizeFilter);

const { laplacianFilter, unsharp} = require('../controller/sharpen.controller');
router.put('/laplacian', laplacianFilter);
router.put('/unsharp', unsharp);

const { averagingFilter, gaussianFilter, bilateral, medianFilter, wiener} = require('../controller/denoise.controller');
router.put('/averaging', averagingFilter);
router.put('/gaussian', gaussianFilter);
router.put('/bilateral', bilateral);
router.put('/median', medianFilter);
router.put('/wiener', wiener);

const { localStablization, globalStabization} = require('../controller/stablization.controller');
router.put('/local-stablization', localStablization);
router.put('/global-stablization', globalStabization);

const { motionDeblur, OpticalDeblur} = require('../controller/deblur.controller');
router.put('/motion', motionDeblur);
router.put('/optical', OpticalDeblur);

module.exports = router;