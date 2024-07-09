const Wallet = require("../models/wallet.model");
const Token = require("../models/token.model");
const Transaction = require("../models/transaction.model");

const getMyWallet = async (userId) => {
  try {
    const wallet = await Wallet.findOne({ userId: userId }).populate({
      path: "tokens",
      populate: {
        path: "token",
        select: ["tokenSymbol", "tokenName"],
      },
    });

    if (!wallet) {
      throw new Error(`No wallet found for user ${userId}`);
    }
    return wallet;
  } catch (error) {
    console.error({ error: error.message });
  }
};

const createWallet = async (userId) => {
  try {
    const walletExists = await Wallet.findOne({ userId });
    if (walletExists) {
      throw new Error("Wallet already exists for this user");
    }

    const wallet = await Wallet.create({ userId });
    await wallet.save();
    return wallet;
  } catch (error) {
    console.error({ error: error.message });
    return error;
  }
};

const deleteWallet = async (userId) => {
  try {
    const walletExists = await Wallet.findOne({ userId });
    if (!walletExists) {
      throw new Error("Wallet not found for this user");
    }

    await Wallet.deleteOne({ userId });
    return walletExists;
  } catch (error) {
    console.error({ error: error.message });
  }
};

const creditWallet = async (
  amount,
  walletId,
  desc) => {
  const wallet = await Wallet.findOne({ _id: walletId });
  if (!wallet) {
    //TODO: Create wallet
    throw new Error(`Wallet ${walletId} not found`);
  }

  const updatedWallet = await Wallet.findOneAndUpdate({ _id: walletId }, { $inc: { balance: amount } });

  const reference = generateUniqueRef();

  const transaction = await Transaction.create([{
    trnxType: 'CR',
    desc,
    amount,
    walletId,
    reference,
    balanceBefore: Number(wallet.balance),
    balanceAfter: Number(wallet.balance) + Number(amount),
  }]);

  console.log(`Wallet credited successfully`);
  return transaction;

}

const addTokenToBuyerWallet = async (
  walletId,
  tokenId,
  amount) => {
  const wallet = await Wallet.findOne({ _id: walletId });
  const token = await Token.findOne({ _id: tokenId });
  const walletTokens = wallet.tokens;
  // if (wallet.tokens.includes({token})){
  const existingToken = walletTokens.findIndex(t => t.token.toHexString() == tokenId);

  if (existingToken == -1) {
    await wallet.tokens.push({ token: token, amountInTonnes: amount });
    await wallet.save();
  }
  else {
    wallet.tokens[existingToken].amountInTonnes += amount;
    await wallet.save();
  }
  // existingToken.amount += amount;
  // const updatedWallet = await Wallet.findOneAndUpdate({_id: walletId}, { $inc: { balance: amount } });
  return existingToken;
}

const addTokenToFarmerWallet = async (
  walletId,
  tokenId,
  amount,
  FP) => {
  const wallet = await Wallet.findOne({ _id: walletId });
  const token = await Token.findOne({ _id: tokenId });
  const walletTokens = wallet.tokens;
  // if (wallet.tokens.includes({token})){
  const existingToken = walletTokens.findIndex(t => t.token.toHexString() == tokenId);

  if (existingToken == -1) {
    await wallet.tokens.push({ token: token, amountInTonnes: (FP * token.availableTonnes).toFixed(2) - amount });
    await wallet.save();
  }
  else {
    wallet.tokens[existingToken].amountInTonnes -= amount;
    await wallet.save();
  }
  // existingToken.amount += amount;
  // const updatedWallet = await Wallet.findOneAndUpdate({_id: walletId}, { $inc: { balance: amount } });
  return existingToken;
}

function generateUniqueRef() {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let code = "";
  for (let i = 0; i < 8; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  return code;
}

const debitWallet = async (
  amount,
  walletId,
  desc) => {
  const wallet = await Wallet.findOne({ _id: walletId });
  if (!wallet) {
    throw new Error(`Wallet ${walletId} not found`);
  }

  if (Number(wallet.balance) < amount) {
    throw new Error("Insufficient balance");
  }

  const updatedWallet = await Wallet.findOneAndUpdate({ _id: walletId }, { $inc: { balance: -amount } });

  const reference = generateUniqueRef();

  const transaction = await Transaction.create([{
    trnxType: 'DR',
    desc,
    amount,
    walletId,
    reference,
    balanceBefore: Number(wallet.balance),
    balanceAfter: Number(wallet.balance) - Number(amount),
  }]);

  console.log(`Wallet debited successfully.`);
  return transaction;

}


module.exports = {
  getMyWallet,
  deleteWallet,
  createWallet,
  creditWallet,
  debitWallet,
  addTokenToFarmerWallet,
  addTokenToBuyerWallet
};
