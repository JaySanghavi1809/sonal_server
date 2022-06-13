const express = require('express');
const router = express.Router();
const auth_controller = require('../../controllers/auth.controller');
const userValidator = require('../../validators/user.validate.schema');

router.post('/register', userValidator.register(), auth_controller.register);

router.post('/login', userValidator.login(), auth_controller.login);

router.post('/verifyOtp', userValidator.verifyOtp(), auth_controller.verifyOtp);

router.post('/forgotPassword', userValidator.forgotPassword(), auth_controller.forgotPassword);

router.post('/resetPassword', userValidator.resetPassword(), auth_controller.resetPassword);

router.post('/resendOtp', userValidator.resendOtp(), auth_controller.resendOtp);


module.exports = router;