const express = require("express");
const router = express.Router();

const authRoute = require("./auth.route");
// const userRoute = require("./user.route");

router.use("/user", authRoute);
// router.use("/user", userRoute);


module.exports = router;
