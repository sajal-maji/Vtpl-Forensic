const router = require('express').Router();
const { getUserDetails,geSpeedMonitor, updateUserDetails,getUserList } = require('../controller/user.controller');
const{getJobStatus} = require('../controller/job.controller')
router.get('/', getUserDetails);
router.put('/update-user-details',updateUserDetails)
router.get('/job-status',getJobStatus)
router.get('/share-user-list',getUserList)
router.get('/speed-monitor',geSpeedMonitor)

module.exports = router;