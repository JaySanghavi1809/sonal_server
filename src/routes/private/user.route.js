const express = require('express')
const router = express.Router()
const UserController = require('../../controllers/user.controller')

router.get('/get_users', UserController.GetUser);

router.put('/edit_user', UserController.EditUser);


module.exports = router;