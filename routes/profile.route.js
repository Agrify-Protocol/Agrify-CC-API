const express = require("express");
const {
  profile,
  overview,
  createReport,
  myReports,
  reportDetails,
} = require("../controllers/profile.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/profile", authMiddleware, profile);
router.get("/profile/overview", authMiddleware, overview);
router.post("/profile/reports/create", authMiddleware, createReport);
router.get("/profile/reports", authMiddleware, myReports);
router.get("/profile/reports/:reportId", authMiddleware, reportDetails);

module.exports = router;
