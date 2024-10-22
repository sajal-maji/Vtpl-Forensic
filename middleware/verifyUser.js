const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

const verifyUser = async (req, res, next) => {
    try {
        const {authorization} = req.headers;

        if (!authorization){
            return res.status(401).json({
                statusCode: 401,
                status: 'Unauthorized',
                message: 'Failed to authenticate user.'
            })
        }

        const token = authorization.replace('Bearer ', '');

        const payload = await jwt.verify(token, jwtSecret);

        req.user = payload;
        next();
    } catch (error) {
        if (error.message === 'invalid signature'){
            return res.status(401).json({
                statusCode: 401,
                status: 'Unauthorized',
                message: 'Failed to authenticate user.'
            })
        }
        next(error);
    }
}

module.exports = verifyUser;