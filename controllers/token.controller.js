const Token = require("../models/token.model");
const MrvUser = require("../models/mrv_user.model");
const User = require("../models/user.model");
const hederaService = require("../hedera/service/token.js");
const tokenService = require("../service/tokenService.js");
const walletService = require("../service/walletService.js");
const authMiddleWare = require("../middleware/auth")


const getMyTokens = async (req, res) => {
  try {
    //TODO: Token refactor
    // if (!token.associatedAccounts.includes(buyer.hederaAccountID)) {
    // }

    const result = await Token.find({projectFarmers: { $in: [req.userId]}}).sort({ tokenName: 1 }).exec();

    // var findUser = await MrvUser.findOne({ _id: req.userId });

    // if (!findUser){
    //   findUser = await User.findOne({ _id: req.userId });
    // }
    // const user = findUser;

    // const result = await Token.find({ associatedAccounts: { $in: [user.hederaAccountID] } })

    // const result = await tokenService.queryTokenBalance(user.hederaAccountID);

    res.status(200).json({ message: "My tokens", data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getToken = async (req, res) => {
  const { tokenSymbol } = req.params;

  try {
    const token = await tokenService.getToken(tokenSymbol);

    if (!token) {
      return res.status(404).json({ message: "Token " + tokenSymbol + " not found!" });
    }
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTokenByID = async (req, res) => {
  const { tokenID } = req.params;

  try {
    const token = await tokenService.getTokenByID(tokenID);

    if (!token) {
      return res.status(404).json({ message: "Token " + tokenID + " not found!" });
    }
    res.status(200).json(token);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createToken = async (req, res) => {
  try {
    const { tokenName, tokenSymbol, amountInCirculation } =
      req.body;
    const user = await MrvUser.findOne({ _id: req.userId });

    if (!user.isFarmer) {
      return res.status(400).json({ message: "Only farmers can own tokens" });
    }

    else {
      const token = await tokenService.createToken(tokenName, tokenSymbol, amountInCirculation);
      if (!token) throw new Error("Error creating token");
      res.status(201).json({ token });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const purchaseToken = async (req, res) => {
  try {
    const { tokenSymbol, amount } =
      req.body;
    // const user = await MrvUser.findOne({ _id: req.userId });

    // if (!user.isFarmer){
    //   res.status(400).json({ message: "Only farmers can send tokens" });
    // }

    // else {

    const token = await tokenService.getToken(tokenSymbol);

    const debitAmount = Number(amount * token.price);

    const wallet = await walletService.getMyWallet(req.userId);
    if (Number(wallet.balance) < debitAmount) {
      return res.status(400).json({
        error: `Insufficient balance`
      });
    }

    if (amount < token.minimumPurchaseTonnes) {
      return res.status(400).json({
        error: `Amount cannot be less than ${token.minimumPurchaseTonnes}`,
      });
    }
    if (amount > token.availableTonnes) {
      return res.status(400).json({
        error: `Amount cannot be greater than ${token.availableTonnes}`,
      });
    }
      const tokenReceipt = await tokenService.purchaseToken(tokenSymbol, amount, req.userId);
      if (!tokenReceipt) throw new Error("Error transferring token");
      res.status(200).json({message: "Transaction successful", data: tokenReceipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const burnToken = async (req, res) => {
  try {
    const { tokenSymbol } =
      req.params;
    const token = await Token.findOne({ tokenSymbol: tokenSymbol });

    if (!token) {
      return res.status(404).json({ message: "Token " + tokenSymbol + " not found!" });
    }
    else {
      const token = await tokenService.burnToken(tokenSymbol);
      res.status(200).json({ message: "Token burnt successfully", data: token });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createToken,
  purchaseToken,
  burnToken,
  getMyTokens,
  getToken,
  getTokenByID,
};
