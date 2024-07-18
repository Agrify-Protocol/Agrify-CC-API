const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/user.model");
const MrvUser = require("../models/mrv_user.model");
const ResetToken = require("../models/resetToken.model");
const sendEmail = require("../utils/sendEmail");
const hederaService = require("../hedera/service/createAccount.js");
const walletService = require("../service/walletService.js");

const register = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    // check if user exists?
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(500).json({
        error: `User with email: ${email} already exists!`,
      });
    }

    // hash password
    const hashPassword = await bcrypt.hash(password, 10);
    const user = new User({
      firstname,
      lastname,
      email,
      password: hashPassword,
    });
    const [hederaAccountID, hederaPublicKey, hederaPrivateKey] =
    await hederaService.createHederaAccount();

    user.hederaAccountID = hederaAccountID;
    user.hederaPublicKey = hederaPublicKey;
    //TODO: Encrypt
    user.hederaPrivateKey = hederaPrivateKey;

    //Create wallet 
    const wallet = await walletService.createWallet(user._id);
    user.wallet = wallet;
    await user.save();


    //Login tokens
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "7d" }
    );
    res.status(201).json({
      message: "User account created!",
      user,
      accessToken: token,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_KEY,
      { expiresIn: "7d" }
    );
    // user.isAdmin = true;
    res.json({
      user,
      token,
      refreshToken,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const verifyEmailWithToken = async (req, res) => {
  try {
    // get token
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });
    if (user) {
      user.verificationToken = undefined;
      user.isEmailVerified = true;

      await user.save();
    }

    res
      .status(200)
      .json({ user: user, message: "Email Verified Successfully" });
  } catch (error) {
    console.log("Error verify_email(): ", error);
    res.status(500).json({ success: false, message: "Failed to verify email" });
  }
};

const requestResetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
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
    await User.updateOne(
      { _id: userId },
      { $set: { password: hash } },
      { new: true }
    );
    const user = await User.findById({ _id: userId });
    await passwordResetToken.deleteOne();
    res.status(201).json({ user: user, message: "User password updated!" });
  } catch (error) {
    console.log(error);
  }
};

const refreshtoken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh Token Required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);
    const userId = decoded.userId;

    const newAccessToken = jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({
      token: newAccessToken,
    });
  } catch (error) {
    return res.status(403).json({ error: "Invalid or Expired Refresh Token" });
  }
};

module.exports = {
  register,
  login,
  requestResetPassword,
  resetPassword,
  refreshtoken,
};
