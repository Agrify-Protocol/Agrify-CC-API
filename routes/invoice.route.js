const express = require("express");
const router = express.Router();
const {
  createInvoice,
  payInvoice,
  updateInvoice,
  getInvoice,
  cancelInvoice,
  getAllInvoices,
  getAllInvoicesForProject,
} = require("../controllers/invoice.controller");
const authMiddleware = require("../middleware/auth");

router.get("/", authMiddleware, getAllInvoices);
router.post("/create", authMiddleware, createInvoice);
router.post("/:invoiceId/pay", authMiddleware, payInvoice);
router.put("/:invoiceId/", authMiddleware, updateInvoice);
router.get("/:invoiceId", authMiddleware, getInvoice);
router.post("/:invoiceId/cancel", authMiddleware, cancelInvoice);
router.get(
  "/get-by-project/:projectId",
  authMiddleware,
  getAllInvoicesForProject
);

module.exports = router;
