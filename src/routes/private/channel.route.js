const express = require('express');
const router = express.Router();
const channel_controller = require('../../controllers/channel.controller');
const channelValidator = require('../../validators/channel.schema');

router.post('/createChannel', channelValidator.CheckChannelNameExist(), channel_controller.CreateChannel)

router.get('/get_template', channel_controller.GetTemplate)

router.put('/channelExist', channel_controller.CheckChannelFound)



module.exports = router;