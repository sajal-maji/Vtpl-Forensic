const router = require('express').Router();
const { createUser, verifyUser } = require('../controller/auth.controller');

router.put('/register', createUser);
router.post('/login', verifyUser);

module.exports = router;