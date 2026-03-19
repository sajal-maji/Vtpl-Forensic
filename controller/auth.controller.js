const authService = require("../services/auth.service");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require('../model/user.model');

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




const forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        email = email.trim().toLowerCase();

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Generate token
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Hash token before saving (security)
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

        await user.save();

        // Reset URL
        const resetUrl = `${process.env.FRONT_URL}/reset-password/${resetToken}`;

        

        // Send email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // transporter.verify((err, success) => {
        //     if (err) console.log(err);
        //     else console.log("Email server ready");
        // });

        await transporter.sendMail({
            to: user.email,
            subject: "Password Reset",
            html: `
                <h3>Password Reset Request</h3>
                <p>Click below link to reset your password:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>This link expires in 10 minutes.</p>
            `
        });

        return res.json({ message: "Reset link sent to email" });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};




const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Hash incoming token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.json({ message: "Password reset successful" });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


module.exports = {
    createUser,
    verifyUser,
    forgotPassword,
    resetPassword
};