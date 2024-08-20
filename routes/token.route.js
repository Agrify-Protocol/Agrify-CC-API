const express = require("express");


const {
  createToken,
  purchaseToken,
  getMyTokens,
  getToken,
  getTokenByID,
  burnToken,
  mintToken
} = require("../controllers/token.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/:tokenSymbol", authMiddleware, getToken);
router.get("/get-by-id/:tokenID", authMiddleware, getTokenByID);
router.post("/:tokenSymbol/burn", authMiddleware, burnToken);
router.post("/mint", authMiddleware, mintToken);
router.get("/", authMiddleware, getMyTokens);
router.post("/", authMiddleware, createToken);
router.post("/buy", authMiddleware, purchaseToken);

module.exports = router;
