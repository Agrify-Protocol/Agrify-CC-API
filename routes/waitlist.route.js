const express = require("express");

const { addUsertoWaitlist } = require("../controllers/waitlist.controller");
const router = express.Router();

router.post("/join", addUsertoWaitlist);

module.exports = router;
