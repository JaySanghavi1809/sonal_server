const express = require('express');
const router = express.Router();
const auth_controller = require('../../controllers/auth.controller');
// const user_controller = require('../../controllers/user.controller');

router.post('/register', auth_controller.register);
router.post('/login', auth_controller.login);
router.post('/token', auth_controller.token);
router.get('/forgot-password/:username', auth_controller.forgotPassowrd);
router.put('/reset-password/:id', auth_controller.resetPassword)
router.get('/varify/:username/:code', auth_controller.varifyCode);
router.get('/resend/:username/', auth_controller.resendCode);


module.exports = router;