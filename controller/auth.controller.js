const authService = require("../services/auth.service");

const createUser = async (req, res, next) => {
    const { name, email, password, userName } = req.body;
    try {
        const response = await authService.createUser(name, email, password, userName);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

const verifyUser = async (req, res, next) => {
    const { userName, password } = req.body;
    try {
        const response = await authService.verifyUser(userName, password);
        res.status(201).json(response);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createUser,
    verifyUser
};