const router = require('express').Router();
const { getUserDetails, updateUserDetails,getUserList } = require('../controller/user.controller');
const{getJobStatus} = require('../controller/job.controller')
router.get('/', getUserDetails);
router.put('/update-user-details',updateUserDetails)
router.get('/job-status',getJobStatus)
router.get('/share-user-list',getUserList)

module.exports = router;