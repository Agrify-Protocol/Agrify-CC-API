const express = require("express");
const router = express.Router();
const {
  createInvoice,
  payInvoice,
  updateInvoice,
  getInvoice,
  cancelInvoice,
  getAllInvoices,
} = require("../controllers/invoice.controller");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getAllInvoices);
router.post("/create", authMiddleware, createInvoice);
router.post("/:invoiceId/pay", authMiddleware, payInvoice);
router.put("/:invoiceId/", authMiddleware, updateInvoice);
router.get("/:invoiceId", authMiddleware, getInvoice);
router.post("/:invoiceId/cancel", authMiddleware, cancelInvoice);

module.exports = router;
