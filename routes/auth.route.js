const express = require("express");
const {
  register,
  login,
  requestResetPassword,
  resetPassword,
  refreshtoken,
  verifyEmailWithToken,
} = require("../controllers/auth.controller");
const {
  validateRequest,
  registerSchema,
  loginSchema,
} = require("../utils/validation");

const router = express.Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.post("/requestResetPassword", requestResetPassword);
router.post("/resetPassword", resetPassword);
router.post("/refreshToken", refreshtoken);
router.post("/verify-email-token", verifyEmailWithToken);

module.exports = router;
