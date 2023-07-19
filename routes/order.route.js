const express = require("express");
const authMiddleware = require("../middleware/auth");
const {
  createOrder,
  payStripe,
  getMyOrders,
} = require("../controllers/order.controller");

const router = express.Router();
router.post("/orders", authMiddleware, createOrder);
router.post("/pay/stripe", payStripe);
router.get("/orders/me", authMiddleware, getMyOrders);

module.exports = router;
