const userService = require("../services/user.service");

const getUserDetails = async (req, res, next) => {
    const { id } = req.user;
    try {
        const response = await userService.getDetails(id);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

const updateUserDetails = async (req, res, next) => {
    const { email, userName, profileImage } = req.body;
    const userId = req.user.id;
    try {
        const response = await userService.updateDetails(userId, email, userName, profileImage);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserDetails,
    updateUserDetails
};