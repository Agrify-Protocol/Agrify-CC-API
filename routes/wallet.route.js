const express = require("express");


const {
  createWallet,
  deleteWallet,
  getMyWallet,
  getWalletById,
  fundWallet,
  withdraw,
} = require("../controllers/wallet.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.post("/create", authMiddleware, createWallet);
router.post("/delete", authMiddleware, deleteWallet);
router.get("/", authMiddleware, getMyWallet);
router.get("/:userId", authMiddleware, getWalletById);
router.post("/fund", authMiddleware, fundWallet);
router.post("/withdraw", authMiddleware, withdraw);

module.exports = router;
