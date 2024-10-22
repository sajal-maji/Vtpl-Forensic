const router = require('express').Router();
const { grayscaleRoute } = require('../controller/channel.controller'); // Make sure you are correctly importing the function

router.put('/apply-grayscale', grayscaleRoute);

module.exports = router;
