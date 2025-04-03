const authService = require("../services/auth.service");

const createUser = async (req, res, next) => {
    const { name, email, password, userName } = req.body;
    try {
        const response = await authService.createUser(name, email, password, userName);
        res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

const verifyUser = async (req, res, next) => {
    const { userName, password } = req.body;
    try {
        const response = await authService.verifyUser(userName, password);
        res.status(response.statusCode).json(response);
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: error });
    }
};

module.exports = {
    createUser,
    verifyUser
};