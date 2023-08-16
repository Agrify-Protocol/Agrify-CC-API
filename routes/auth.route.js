const express = require("express");
const {
  register,
  login,
  requestResetPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/requestResetPassword", requestResetPassword);
router.post("/resetPassword", resetPassword);

module.exports = router;
