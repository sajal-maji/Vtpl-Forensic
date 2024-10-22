const router = require('express').Router();
const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const projectRoutes = require('./project.route');
const channelRoutes = require('./channel.route');
const altertableRoutes = require('./altertable.route');
const verifyUser = require('../middleware/verifyUser');
const filtersRoutes = require('./filters.route');

router.use('/auth', authRoutes);
router.use('/user', verifyUser, userRoutes);
router.use('/project', verifyUser, projectRoutes);
router.use('/filters',verifyUser,channelRoutes);
router.use('/altertable',verifyUser,altertableRoutes);
// router.use('/filters',verifyUser,filtersRoutes);

module.exports = router;