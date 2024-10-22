const router = require('express').Router();
const { getUserDetails, updateUserDetails } = require('../controller/user.controller');
const{getJobStatus} = require('../controller/job.controller')
router.get('/', getUserDetails);
router.put('/update-user-details',updateUserDetails)
router.get('/job-status',getJobStatus)

module.exports = router;