const express = require("express");
const {
  getAllPurchases,
  getPurchasesByProjectId,
} = require("../controllers/purchase.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/", authMiddleware, getAllPurchases);
router.get(
  "/get-by-project/:projectId",
  authMiddleware,
  getPurchasesByProjectId
);

module.exports = router;
