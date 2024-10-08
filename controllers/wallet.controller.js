const Wallet = require("../models/wallet.model");
const walletService = require("../service/walletService.js");
const authMiddleWare = require("../middleware/auth")


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

    const wallet = await walletService.getMyWallet(req.userId);

    if (!wallet) {
      return res.status(404).json({ message: `No wallet found for user ${req.userId}` });
    }

    res.status(200).json({ wallet });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getWalletById = async (req, res) => {
  const { userId } = req.params;

  try {

    const wallet = await walletService.getWalletById(userId);

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
    const depositReceipt = await walletService.creditWallet(amount, wallet.id, "Deposit");

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

  if (!wallet) {
    return res.status(404).json({ message: "No wallet found" });
  }

  if (Number(wallet.balance) < amount) {
    return res.status(400).json({ message: "Insufficient balance" });
  }

    const depositReceipt = await walletService.debitWallet(amount, wallet.id, "Withdrawal");

    if (!depositReceipt) {
      return res.status(200).json({ message: "Transaction failed" });
    }
    res.status(200).json({ message: "Transaction successful", data: depositReceipt });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  createWallet,
  deleteWallet,
  getMyWallet,
  getWalletById,
  fundWallet,
  withdraw,
};
