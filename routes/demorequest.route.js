const express = require("express");
const {
  createDemoRequest,
  getDemoRequests,
} = require("../controllers/demorequest.controller");
const router = express.Router();

router.post("/", createDemoRequest);
router.get("/", getDemoRequests);

module.exports = router;
