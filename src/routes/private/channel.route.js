const express = require('express');
const router = express.Router();
const channel_controller = require('../../controllers/channel.controller');
// const ChannelSchema = require('../../validators/channel.schema');

router.post('/createChannel', channel_controller.CreateChannel)

router.get('/get_template', channel_controller.GetTemplate)

router.put('/channelExist', channel_controller.CheckChannelFound)



module.exports = router;