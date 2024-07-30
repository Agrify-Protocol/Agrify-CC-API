const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const MrvUser = require("../../models/mrv_user.model");
const ResetToken = require("../../models/mrv/resetToken.model.js");
const sendEmail = require("../../utils/sendEmail");
const hederaService = require("../../hedera/service/createAccount.js");
const walletService = require("../../service/walletService.js");

const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const user = await MrvUser.findOne({ email });

    if (user) {
      return res.status(400).json({ error: "User already exists!" });
    }

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
    });

    let verifyToken = crypto.randomBytes(32).toString("hex");
    mrvUser.verificationToken = verifyToken;
    const [hederaAccountID, hederaPublicKey, hederaPrivateKey] =
      await hederaService.createHederaAccount();
    mrvUser.hederaAccountID = hederaAccountID;
    mrvUser.hederaPublicKey = hederaPublicKey;
    //TODO: Encrypt
    mrvUser.hederaPrivateKey = hederaPrivateKey;

    //Create wallet
    const wallet = await walletService.createWallet(mrvUser._id);
    mrvUser.wallet = wallet;
    await mrvUser.save();
    sendEmail(
      mrvUser.email,
      "Welcome to Agrify",
      {
        name: mrvUser.firstname,
        emailVerificationCode,
      },
      "./email/template/welcome.handlebars"
    );

    const token = jwt.sign({ userId: mrvUser._id }, process.env.JWT_SECRET_KEY);
    res.status(201).json({
      message: "MRV Account Created!",
      data: { mrvUser, token },
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

const verifyEmailWithToken = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await MrvUser.findOne({ verificationToken: token });
    if (user) {
      user.isEmailVerified = true;
      user.verificationToken = undefined;
      await user.save();
    }

    res
      .status(201)
      .json({ mrvUser: user, message: "Email Verified Successfully" });
  } catch (error) {
    console.log(error);
  }
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
const resendEmailVerificationCode = async (req, res) => {
  const { email } = req.body;

  try {
    const mrvUser = await MrvUser.findOne({ email });
    if (!mrvUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (mrvUser.isEmailVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already verified" });
    }

    const emailVerificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    // const emailVerificationCodeExpiration = Date.now() + 600000;

    sendEmail(
      mrvUser.email,
      "Verification Code",
      {
        name: mrvUser.firstname,
        emailVerificationCode,
      },
      "./email/template/resendEmail.handlebars"
    );

    mrvUser.emailVerificationCode = emailVerificationCode;
    mrvUser.emailVerificationCodeExpiration = Date.now() + 600000;
    await mrvUser.save();
    res.status(200).json({ success: true, message: "Verification code sent!" });
  } catch (error) {
    console.log("Error sending code: ", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong. Please try again",
      });
  }
};

const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await MrvUser.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User does not exist!" });
    }
    let token = await ResetToken.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = await bcrypt.hash(resetToken, 10);
    const newToken = await new ResetToken({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();
    const link = `${process.env.CLIENT_URL}/passwordReset?token=${resetToken}&id=${user._id}`;
    sendEmail(
      user.email,
      "Password Reset Request",
      {
        name: user.firstname,
        link: link,
      },
      "./email/template/requestResetPassword.handlebars"
    );
    res.json({ link });
  } catch (error) {
    console.log(error);
  }
};

const resetPassword = async (req, res) => {
  try {
    const { userId, token, password } = req.body;
    let passwordResetToken = await ResetToken.findOne({ userId });
    if (!passwordResetToken) {
      return res
        .status(500)
        .json({ error: "Invalid or expired password reset token!" });
    }
    const isValid = await bcrypt.compare(token, passwordResetToken.token);
    if (!isValid) {
      return res
        .status(500)
        .json({ error: "Invalid or expired password reset token!" });
    }
    const hash = await bcrypt.hash(password, 10);
    await MrvUser.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    const user = await MrvUser.findById({ _id: userId });
    await passwordResetToken.deleteOne();
    res.status(201).json({ user: user, message: "User password updated!" });
  } catch (error) {
    console.log(error);
  }
};


module.exports = {
  register,
  login,
  verifyEmailWithCode,
  verifyEmailWithToken,
  resendEmailVerificationCode,
  requestResetPassword,
  resetPassword,
};
