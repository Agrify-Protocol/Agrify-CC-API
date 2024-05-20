const express = require("express");

const {
  addUsertoWaitlist,
  getWaitlist,
} = require("../controllers/waitlist.controller");
const router = express.Router();

router.get("/", getWaitlist);
router.post("/join", addUsertoWaitlist);

module.exports = router;
