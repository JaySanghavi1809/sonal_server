const express = require("express");
const router = express.Router();

const categoryRoute = require("./meta-category.route");
router.use("/category", categoryRoute);

module.exports = router;