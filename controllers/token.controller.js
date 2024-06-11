const Token = require("../models/token.model");
const MrvUser = require("../models/mrv_user.model");
const hederaService = require("../hedera/service/token.js");
const tokenService = require("../service/tokenService.js");
const authMiddleWare = require("../middleware/auth")

// const getAllTokens = async (req, res) => {
//   try {
//     const result = await Token.find({}).sort({ tokenName: 1 }).exec();
//     res.status(200).json({ message: "Tokens", data: result });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getMyTokens = async (req, res) => {
  try {
    //TODO: Token refactor

    // const result = await Token.find({tokenOwner: req.userId}).sort({ tokenName: 1 }).exec();

    const user = await MrvUser.findOne({ _id: req.userId });

    const result = await Token.find({associatedAccounts: { $in: [user.hederaAccountID]}})

    res.status(200).json({ message: "My tokens", data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getToken = async (req, res) => {
  const {tokenSymbol} = req.params;

  try {
    // const token = await Token.findOne({tokenSymbol: tokenSymbol});
    const token = await tokenService.getToken(tokenSymbol);

    if(!token){
      return res.status(404).json({message: "Token " + tokenSymbol + " not found!"});
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

    if (!user.isFarmer){
      res.status(400).json({ message: "Only farmers can own tokens" });
    }

    else {
      const token = await tokenService.createToken(tokenName, tokenSymbol, amountInCirculation);
      if (!token) throw new Error("Error creating token");
      res.status(201).json({token});
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
      
      const token = await tokenService.purchaseToken(tokenSymbol, amount, req.userId);
      if (!token) throw new Error("Error transferring token");
      res.status(200).json({token});
    // }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const burnToken = async (req, res) => {
  try {
    const { tokenSymbol } =
      req.params;
    const token = await Token.findOne({ tokenSymbol: tokenSymbol });

    if(!token){
      return res.status(404).json({message: "Token " + tokenSymbol + " not found!"});
  }
    else {
      const token = await tokenService.burnToken(tokenSymbol);
      res.status(200).json({ message: "Token burnt successfully", data: token});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createToken,
  purchaseToken,
  burnToken,
  // getAllTokens,
  getMyTokens,  
  getToken
};
