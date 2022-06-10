const express = require('express');
const router = express.Router();
const auth_controller = require('../../controllers/auth.controller');
const UserValidatorSchema = require('../../../src/validators/user.validate.schema');


router.post('/register', UserValidatorSchema.register(), auth_controller.register);
router.post('/login', UserValidatorSchema.login(), auth_controller.login);


module.exports = router;