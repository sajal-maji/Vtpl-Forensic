const userService = require("../services/user.service");

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
    const { email, userName, profileImage } = req.body;
    const userId = req.user.id;
    try {
        const response = await userService.updateDetails(userId, email, userName, profileImage);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
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

module.exports = {
    getUserDetails,
    updateUserDetails,
    getUserList
};