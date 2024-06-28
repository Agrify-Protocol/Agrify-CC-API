const express = require("express");


const { getTransactionHistory } = require("../controllers/transaction.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware, getTransactionHistory);

module.exports = router;
