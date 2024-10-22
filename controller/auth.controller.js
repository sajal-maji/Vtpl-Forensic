const User = require('../model/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
const jwtExpiryMin = process.env.JWT_EXPIRY_MIN;
const fs = require('fs');

exports.createUser = async (req, res, next) => {
    try {
        
        const {name, email, password,userName} = req.body;

        if (!userName, !password){
            return res.status(400).json({
                statusCode: 400,
                status: 'Bad Request',
                message: 'Provided parameter values are invalid.'
            })
        }

        const existUser = await User.findOne({userName});

        if (existUser){
            return res.status(400).json({
                statusCode: 400,
                status: 'Bad Request',
                message: 'User already exists.'
            })
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
        // Create a new directory
        fs.mkdir(`${basePath}/${userData.id}`, { recursive: true }, (err) => {
        if (err) {
            return console.error(err);
        }
        console.log('Directory created successfully!');
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
        )
        
        res.status(201).json({
            statusCode: 201,
            status: 'Created',
            message: 'User created successfully.',
            token
        })
    } catch (error) {
        next(error);
    }

}


exports.verifyUser = async (req, res, next) => {
    try {
        const {email, password,userName} = req.body;

        if (!userName, !password){
            return res.status(400).json({
                statusCode: 400,
                status: 'Bad Request',
                message: 'Provided parameter values are invalid.'
            })
        }

        const existUser = await User.findOne({userName});

        if (!existUser){
            return res.status(401).json({
                statusCode: 401,
                status: 'Unauthorized',
                message: 'Failed to authenticate user.'
            })
        }
        
        const matchPassword = await bcrypt.compare(password, existUser.password);
        
        if (!matchPassword){
            return res.status(401).json({
                statusCode: 401,
                status: 'Unauthorized',
                message: 'Failed to authenticate user.'
            })
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
        
        res.status(201).json({
            statusCode: 200,
            status: 'Success',
            message: 'Successfully authenticated.',
            token
        })
    } catch (error) {
        next(error);
    }

}