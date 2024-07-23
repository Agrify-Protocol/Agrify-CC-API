const express = require("express");
const {
  paystackInitialize,
  payInvoice,
  handlePaystackWebhook,
  payWithCard,
} = require("../controllers/payment.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/paystack/initialize", paystackInitialize);
router.post("/pay-invoice/:invoiceId", payInvoice);
router.post("/paystack/webhook", handlePaystackWebhook);
router.post("/create-card-payment", authMiddleware, payWithCard);

module.exports = router;
