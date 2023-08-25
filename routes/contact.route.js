const express = require("express");
const {
  createMessage,
  getContactMessages,
} = require("../controllers/contact.controller");
const router = express.Router();

router.post("/create", createMessage);
router.get("/all-messages", getContactMessages);

module.exports = router;
