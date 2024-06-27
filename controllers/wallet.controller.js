const Wallet = require("../models/wallet.model");
const Transction = require("../models/transaction.model");
const MrvUser = require("../models/mrv_user.model");
const tokenService = require("../service/tokenService.js");
const walletService = require("../service/walletService.js");
const authMiddleWare = require("../middleware/auth")

// const getAllTokens = async (req, res) => {
//   try {
//     const result = await Token.find({}).sort({ tokenName: 1 }).exec();
//     res.status(200).json({ message: "Tokens", data: result });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const createWallet = async (req, res) => {
  try {
    const exisitingWallet = await Wallet.findOne({ userId: req.userId });

    if (exisitingWallet) {
      return res.status(400).json({ message: `Wallet already exists` });
    }

    const wallet = await walletService.createWallet(req.userId);

    res.status(200).json({ message: "Wallet created", data: wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteWallet = async (req, res) => {
  try {
    const exisitingWallet = await Wallet.findOne({ userId: req.userId });

    if (!exisitingWallet) {
      res.status(404).json({ message: `Wallet not found` });
    }

    const wallet = await walletService.deleteWallet(req.userId);

    res.status(200).json({message: "Wallet deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMyWallet = async (req, res) => {
  try {
    //TODO: Token refactor

    // const result = await Token.find({tokenOwner: req.userId}).sort({ tokenName: 1 }).exec();

    const wallet = await walletService.getMyWallet(req.userId);

    if (!wallet) {
      return res.status(404).json({ message: `No wallet found for user ${req.userId}` });
    }

    res.status(200).json({ wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const fundWallet = async (req, res) => {
  const { amount } =
    req.body;

  try {
    const wallet = await walletService.getMyWallet(req.userId);
    // const token = await Token.findOne({tokenSymbol: tokenSymbol});
    const depositReceipt = await walletService.creditWallet(amount, wallet.id, "deposit");

    if (!depositReceipt) {
      return res.status(200).json({ message: "Transaction failed" });
    }
    res.status(200).json({ message: "Transaction successful", data: depositReceipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const withdraw = async (req, res) => {
  const { amount } =
    req.body;
    try {
  const wallet = await walletService.getMyWallet(req.userId);

  // const wallet = await Wallet.findOne({ _id: wa });
  if (!wallet) {
    return res.status(404).json({ message: "No wallet found" });
  }

  if (Number(wallet.balance) < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

    // const token = await Token.findOne({tokenSymbol: tokenSymbol});
    const depositReceipt = await walletService.debitWallet(amount, wallet.id, "withdrawal");

    if (!depositReceipt) {
      return res.status(200).json({ message: "Transaction failed" });
    }
    res.status(200).json({ message: "Transaction successful", data: depositReceipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const getTokenByID = async (req, res) => {
//   const { tokenID } = req.params;

//   try {
//     // const token = await Token.findOne({tokenSymbol: tokenSymbol});
//     const token = await tokenService.getTokenByID(tokenID);

//     if (!token) {
//       return res.status(404).json({ message: "Token " + tokenID + " not found!" });
//     }
//     res.status(200).json(token);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const createToken = async (req, res) => {
//   try {
//     const { tokenName, tokenSymbol, amountInCirculation } =
//       req.body;
//     const user = await MrvUser.findOne({ _id: req.userId });

//     if (!user.isFarmer) {
//       res.status(400).json({ message: "Only farmers can own tokens" });
//     }

//     else {
//       const token = await tokenService.createToken(tokenName, tokenSymbol, amountInCirculation);
//       if (!token) throw new Error("Error creating token");
//       res.status(201).json({ token });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const purchaseToken = async (req, res) => {
//   try {
//     const { tokenSymbol, amount } =
//       req.body;
//     // const user = await MrvUser.findOne({ _id: req.userId });

//     // if (!user.isFarmer){
//     //   res.status(400).json({ message: "Only farmers can send tokens" });
//     // }

//     // else {

//     //TODO: Insufficient balance

//     const token = await tokenService.getToken(tokenSymbol);

//     if (amount < token.minimumPurchaseTonnes) {
//       return res.status(400).json({
//         error: `Amount cannot be less than ${token.minimumPurchaseTonnes}`,
//       });
//     }
//     if (amount > token.availableTonnes) {
//       return res.status(400).json({
//         error: `Amount cannot be greater than ${token.availableTonnes}`,
//       });
//     }
//     const tokenReceipt = await tokenService.purchaseToken(tokenSymbol, amount, req.userId);
//     if (!tokenReceipt) throw new Error("Error transferring token");
//     res.status(200).json({ tokenReceipt });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// const burnToken = async (req, res) => {
//   try {
//     const { tokenSymbol } =
//       req.params;
//     const token = await Token.findOne({ tokenSymbol: tokenSymbol });

//     if (!token) {
//       return res.status(404).json({ message: "Token " + tokenSymbol + " not found!" });
//     }
//     else {
//       const token = await tokenService.burnToken(tokenSymbol);
//       res.status(200).json({ message: "Token burnt successfully", data: token });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

module.exports = {
  createWallet,
  deleteWallet,
  getMyWallet,
  fundWallet,
  withdraw,
};
