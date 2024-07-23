const express = require("express");
const { profile, overview } = require("../controllers/profile.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/profile", authMiddleware, profile);
router.get("/profile/overview", authMiddleware, overview);

module.exports = router;
