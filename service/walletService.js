const Token = require("../models/token.model");
const hederaService = require("../hedera/service/token.js");
const Wallet = require("../models/wallet.model");
const Transaction = require("../models/transaction.model");
require("dotenv").config();

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
  userId, 
  purpose, 
  reference ) => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    //TODO: Create wallet
    throw new Error(`No wallet found for user ${userId}`);
    }

  const updatedWallet = await Wallet.findOneAndUpdate({userId}, { $inc: { balance: amount } });

  const transaction = await Transaction.create([{
    trnxType: 'CR',
    purpose,
    amount,
    userId,
    reference,
    balanceBefore: Number(wallet.balance),
    balanceAfter: Number(wallet.balance) + Number(amount),
  }]);

  console.log(`Wallet credited successfully`);
  return transaction;

}

const debitWallet = async (
  amount, 
  userId, 
  purpose, 
  reference) => {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) {
    throw new Error(`No wallet found for user ${userId}`);
    }

    if (Number(wallet.balance) < amount) {
      throw new Error("Insufficient balance");
    }

  const updatedWallet = await Wallet.findOneAndUpdate({userId}, { $inc: { balance: -amount } });

  const transaction = await Transaction.create([{
    trnxType: 'DR',
    purpose,
    amount,
    userId,
    reference,
    balanceBefore: Number(wallet.balance),
    balanceAfter: Number(wallet.balance) - Number(amount),
  }]);

  console.log(`Wallet debited successfully.`);
  return transaction;

}



  // const purchaseToken = async (
  //   tokenSymbol,
  //   amount, //senderID,
  //   recipientID
  // ) => {
  //   try {
  //     const token = await getToken(tokenSymbol);

  //     const tokenID = token.tokenId;

  //     // const senderID = mrvUser.hederaAccountID;


  //     {
  //       const recipientUser = await MrvUser.findOne({ _id: recipientID });

  //       //Associate token to user
  //       if (!token.associatedAccounts.includes(recipientUser.hederaAccountID)) {
  //         const associationReceipt = await hederaService.associateHederaToken(
  //           tokenID,
  //           recipientUser
  //         );
  //         if (!associationReceipt) {
  //           throw new Error("Unable to associate token to recipient");
  //         } else {
  //           await token.associatedAccounts.push(recipientUser.hederaAccountID);
  //           await token.save();
  //         }
  //       }

  //       //Make transfer
  //       const receipt = await hederaService.transferHederaToken(
  //         tokenID,
  //         amount, // senderID,
  //         recipientUser.hederaAccountID
  //       );

  //       //TODO: Transaction receipt
  //       if (!receipt) throw new Error("Error transferring token");

  //       token.availableTonnes -= amount;

  //       //TODO: Update project tonnes
  //       await token.save();
  //       return token;
  //     }
  //   } catch (error) {
  //     console.error({ error: error.message });
  //     return error;
  //   }
  // };

  module.exports = {
    deleteWallet,
    createWallet,
    creditWallet,
    debitWallet,
  };
