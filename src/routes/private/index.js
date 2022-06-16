const express = require("express");
const router = express.Router();

const categoryRoute = require("./meta-category.route");
const channelRoute = require("./channel.route");
router.use("/category", categoryRoute);
router.use("/channel", channelRoute);

module.exports = router;