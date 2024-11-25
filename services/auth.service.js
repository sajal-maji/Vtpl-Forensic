const User = require('../model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require("../helpers/logEvents");

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiryMin = process.env.JWT_EXPIRY_MIN;
const fs = require('fs');

const createUser = async (name, email, password, userName) => {
    if (!userName, !password) {
        logger.logCreate(`createUser: Provided parameter values are invalid.`, 'systemlog');
        return {
            statusCode: 400,
            status: 'Bad Request',
            message: 'Provided parameter values are invalid.'
        };
    }
    const existUser = await User.findOne({ userName });
    if (existUser) {
        logger.logCreate(`createUser: User already exists with username - ${userName}.`, 'systemlog');
        return {
            statusCode: 400,
            status: 'Bad Request',
            message: 'User already exists.'
        };
    }

    const salt = await bcrypt.genSalt(10);
    const encPassword = await bcrypt.hash(password, salt);

    const user = new User({
        name,
        userName,
        email,
        password: encPassword
    })

    const userData = await user.save();


    const basePath = process.env.MEDIA_BASE_PATH;
    fs.mkdir(`${basePath}/${userData.id}`, { recursive: true }, (err) => {
        if (err) {
            return console.error(err);
        }
    });

    const token = await jwt.sign(
        {
            name,
            userName,
            email,
            id: user._id,
        },
        jwtSecret,
        {
            expiresIn: `${jwtExpiryMin} min`
        }
    );
    logger.logCreate(`createUser: User created successfully.`, 'systemlog');
    return {
        statusCode: 201,
        status: 'Created',
        message: 'User created successfully.',
        token
    };
};

const verifyUser = async (userName, password) => {
    if (!userName, !password) {
        return {
            statusCode: 400,
            status: 'Bad Request',
            message: 'Provided parameter values are invalid.'
        }
    }

    const existUser = await User.findOne({ userName });

    if (!existUser) {
        return {
            statusCode: 401,
            status: 'Unauthorized',
            message: 'Failed to authenticate user.'
        }
    }

    const matchPassword = await bcrypt.compare(password, existUser.password);

    if (!matchPassword) {
        return {
            statusCode: 401,
            status: 'Unauthorized',
            message: 'Incorrect Password.'
        }
    }

    const token = await jwt.sign(
        {
            name: existUser.name,
            userName: existUser.userName,
            id: existUser._id,
        },
        jwtSecret,
        {
            expiresIn: `${jwtExpiryMin} min`
        }
    )

    return {
        statusCode: 200,
        status: 'Success',
        message: 'Successfully authenticated.',
        token
    };
};

module.exports = {
    createUser,
    verifyUser
};