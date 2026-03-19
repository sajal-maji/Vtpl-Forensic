const router = require('express').Router();
const { createUser, verifyUser, forgotPassword, resetPassword } = require('../controller/auth.controller');
const path = require("path");

router.put('/register', createUser);
router.post('/login', verifyUser);

router.post("/forgot-password", forgotPassword);
router.get("/reset-password/:token", (req, res) => {
        try {
    res.sendFile(path.join(__dirname, "../views/reset-password.html"));
} catch (err) {
    res.status(500).json({
        message: "File not found"
    });
}
});
router.post("/reset-password/:token", resetPassword);

module.exports = router;