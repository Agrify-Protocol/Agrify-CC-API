const express = require("express");
const { getProfile } = require("../../controllers/mrv/mrv_profile.controller");
const authMiddleware = require("../../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware, getProfile);

module.exports = router;
