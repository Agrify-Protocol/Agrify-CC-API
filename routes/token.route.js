const express = require("express");


const {
  createToken,
  purchaseToken,
  getMyTokens,
  getToken,
  burnToken
} = require("../controllers/token.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/:tokenSymbol", authMiddleware, getToken);
router.post("/:tokenSymbol/burn", authMiddleware, burnToken);
router.get("/", authMiddleware, getMyTokens);
router.post("/", authMiddleware, createToken);
router.post("/buy", authMiddleware, purchaseToken);

module.exports = router;
