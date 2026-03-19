const userService = require("../services/user.service");
const { performance } = require('perf_hooks');
const os = require('os');
const { exec } = require("child_process");
// const speedTest = require('speedtest-net');

const getUserDetails = async (req, res, next) => {
    const { id } = req.user;
    try {
        const response = await userService.getDetails(id);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const updateUserDetails = async (req, res, next) => {
    const { email, userName, profileImage,name,phoneNumber,password} = req.body;
    const userId = req.user.id;
    try {
        const response = await userService.updateDetails(userId, email, userName, profileImage,name,phoneNumber,password);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const getSetting = async (req, res, next) => {
    try {
        const response = await userService.getSetting();
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const updateSetting = async (req, res, next) => {
    const {undoVideoLimit,undoImageLimit,siteName,siteLogo,siteUrl,version } = req.body;
    try {
        const response = await userService.updateSetting(undoVideoLimit,undoImageLimit,siteName,siteLogo,siteUrl,version);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const getUserList = async (req, res, next) => {
    try {
        const response = await userService.getUserList(req);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

const geSpeedMonitor = async (req, res, next) => {
    try {

        const result = '';//await speedTest({ acceptLicense: true, acceptGdpr: true });
        // console.log(`⬇️ Download: ${(result.download.bandwidth / 125000).toFixed(2)} Mbps`);
        // console.log(`⬆️ Upload: ${(result.upload.bandwidth / 125000).toFixed(2)} Mbps`);
        // console.log(`🏓 Ping: ${result.ping.latency} ms`);

        

        // console.log("CPU Load (1 min):", os.loadavg()[0]);
        // console.log("Free Memory (MB):", (os.freemem() / 1024 / 1024).toFixed(2));
        // console.log("Total Memory (MB):", (os.totalmem() / 1024 / 1024).toFixed(2));
        // console.log("Uptime (minutes):", (os.uptime() / 60).toFixed(2));

        
        res.status(200).json({download: `${(result.download.bandwidth / 125000).toFixed(2)} Mbps`,
                             upload: `${(result.upload.bandwidth / 125000).toFixed(2)} Mbps`,
                             ping: `${result.ping.latency} ms`
                             });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
};

module.exports = {
    getUserDetails,
    updateUserDetails,
    updateSetting,
    getUserList,
    getSetting,
    geSpeedMonitor
};