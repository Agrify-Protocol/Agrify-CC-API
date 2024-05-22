const express = require("express");

const {
  createToken,
  getAllTokens,
  getToken,
} = require("../controllers/token.controller");
const router = express.Router();

router.get("/:tokenSymbol", getToken);
router.get("/", getAllTokens);
router.post("/", createToken);

module.exports = router;
