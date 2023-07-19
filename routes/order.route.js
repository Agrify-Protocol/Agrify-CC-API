const express = require("express");
const authMiddleware = require("../middleware/auth");
const { createOrder, payStripe } = require("../controllers/order.controller");

const router = express.Router();
router.post("/orders", authMiddleware, createOrder);
router.post("/pay/stripe", payStripe);

module.exports = router;
