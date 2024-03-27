const express = require("express");
const {
  getProfile,
  updateProfile,
} = require("../../controllers/mrv/mrv_profile.controller");
const authMiddleware = require("../../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
module.exports = router;
