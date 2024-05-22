const Token = require("../models/token.model");
const MrvUser = require("../models/mrv_user.model");
const hederaService = require("../hedera/service/createToken.js");

const getAllTokens = async (req, res) => {
  try {
    const result = await Token.find({}).sort({ tokenName: 1 }).exec();
    res.status(200).json({ message: "Tokens", data: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getToken = async (req, res) => {
  const {tokenSymbol} = req.params;

  try {
    const token = await Token.findOne({tokenSymbol: tokenSymbol});
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
    const { tokenName, tokenSymbol, tokenOwner, initialSupply } =
      req.body;
    const user = await MrvUser.findOne({ email: tokenOwner });


    if (!user) {
      res.status(400).json({ message: "No user found with email: " + tokenOwner });
    }
    else if (!user.isFarmer){
      res.status(400).json({ message: "Only farmers can own tokens" });
    }

    else {
      const token = await Token.create({
        tokenName, tokenSymbol, tokenOwner, initialSupply,
      });
      const tokenID = await hederaService.createHederaToken(req.body);
      token.tokenId = tokenID;
      await token.save();
      res.status(201).json({token});
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createToken,
  getAllTokens,
  getToken
};
