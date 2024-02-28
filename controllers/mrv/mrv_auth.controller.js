const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const MrvUser = require("../../models/mrv_user.model");
const sendEmail = require("../../utils/sendEmail");

const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);
    const emailVerificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const mrvUser = new MrvUser({
      firstname,
      lastname,
      email,
      password: hashPassword,
      emailVerificationCode,
      emailVerificationCodeExpiration: Date.now() + 600000,
      isProjectDeveloper: true,
    });
    await mrvUser.save();
    sendEmail(mrvUser.email, "Email Verification Link Sent", {
      name: mrvUser.firstname,
      emailVerificationCode,
    });
    res.status(201).json({
      message: "MRV Account Created!",
      data: { emailVerificationCode },
    });
    // res.status(201).json({ message: "MRV User Account Created!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const mrvUser = await MrvUser.findOne({ email });

    if (!mrvUser) {
      return res.status(401).json({ eror: "Invalid Credentials!" });
    }

    const isPassword = await bcrypt.compare(password, mrvUser.password);
    if (!isPassword) {
      return res.status(401).json({ error: "Invalid Credentials!" });
    }

    const token = jwt.sign({ userId: mrvUser._id }, process.env.JWT_SECRET_KEY);
    res.json({ mrvUser, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const generateOtp = async (req, res) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  try {
    const mrvUser = await MrvUser.findOneAndUpdate(
      { otp, otpExpiration: Date.now() + 600000 },
      { upsert: true, new: true }
    );
  } catch (error) {}
};

const verifyEmailWithCode = async (req, res) => {
  const { emailVerificationCode } = req.body;
  try {
    const mrvUser = await MrvUser.findOne({ emailVerificationCode });
    if (!mrvUser || mrvUser.emailVerificationCodeExpiration < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    mrvUser.emailVerificationCode = undefined;
    mrvUser.emailVerificationCodeExpiration = undefined;
    mrvUser.isEmailVerified = true;
    await mrvUser.save();

    res
      .status(200)
      .json({ success: true, message: "Email Verified Successfully!" });
  } catch (error) {
    console.log("Error verifying Email: ", error);
    res.status(500).json({ success: false, message: "Failed to verify Email" });
  }
};

module.exports = { register, login, verifyEmailWithCode };
