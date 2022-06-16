const express = require('express');
const router = express.Router();
const channel_controller = require('../../controllers/channel.controller');
// const postValidator = require('../../validators/post.schema');

router.post('/createChannel', channel_controller.CreateChannel)
router.post('/createTemplate', channel_controller.CreateTemplate)

router.put('/UpdateChannel', channel_controller.UpdateChannel)

module.exports = router;