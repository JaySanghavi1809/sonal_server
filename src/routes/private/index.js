const express = require("express");
const router = express.Router();

const categoryRoute = require("./category.route");
const channelRoute = require("./channel.route");
const userRouter = require("./user.route");

router.use("/category", categoryRoute);
router.use("/channel", channelRoute);
router.use("/user", userRouter);

module.exports = router;