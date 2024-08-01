const express = require("express");
const {
  getAllPurchases,
  getPurchasesByProjectId,
  getPurchasesByPaymentRef,
} = require("../controllers/purchase.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware, getAllPurchases);
router.get(
  "/get-by-project/:projectId",
  authMiddleware,
  getPurchasesByProjectId
);
router.get(
  "/get-by-ref/:paymentReference",
  authMiddleware,
  getPurchasesByPaymentRef
);

module.exports = router;
