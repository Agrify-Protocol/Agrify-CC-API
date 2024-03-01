const express = require("express");
const {
  register,
  login,
  verifyEmailWithCode,
  verifyEmailWithToken,
} = require("../../controllers/mrv/mrv_auth.controller");
const {
  validateRequest,
  mrvSignupSchema,
  mrvSignInSchema,
  emailVerificationSchema,
} = require("../../utils/validation");
const router = express.Router();

router.post("/register", validateRequest(mrvSignupSchema), register);
router.post("/login", validateRequest(mrvSignInSchema), login);
router.post(
  "/verify-email",
  validateRequest(emailVerificationSchema),
  verifyEmailWithCode
);
router.post("/verify-email-token", verifyEmailWithToken);

module.exports = router;
