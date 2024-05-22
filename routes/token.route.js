const express = require("express");


const {
  createToken,
  getMyTokens,
  getToken,
} = require("../controllers/token.controller");
const authMiddleware = require("../middleware/auth");
const router = express.Router();

router.get("/:tokenSymbol", authMiddleware, getToken);
router.get("/", authMiddleware, getMyTokens);
router.post("/", authMiddleware, createToken);

module.exports = router;
