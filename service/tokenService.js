const Token = require("../models/token.model");
const Farm = require("../models/farm.model");
const Aggregate = require("../models/aggregate.model");
const hederaService = require("../hedera/service/token.js");
const walletService = require("../service/walletService.js");
const User = require("../models/user.model");
require("dotenv").config();
const FARMER_PAYOUT_PERCENTAGE = require("../config.js");

//TODO: Token refactor
const createToken = async (
  projectId,
  tokenName,
  tokenOwner,
  // totalTonnes,
  // availableTonnes,
  minimumPurchaseTonnes,
  price,
) => {
  try {
    const tokenSymbol = `${projectId}-AGT`;
    const totalTonnes = 0;
    const tokenId = await hederaService.createHederaToken(
      tokenName,
      tokenSymbol,
      totalTonnes

    );
    if (!tokenId) throw new Error("Error creating token");
    const token = await Token.create({
      tokenId,
      projectId,
      tokenName,
      tokenSymbol,
      tokenOwner,
      totalTonnes,
      availableTonnes: totalTonnes,
      minimumPurchaseTonnes,
      price,
    });
    // token.tokenId = tokenID;
    await token.save();
    return token;
  } catch (error) {
    console.error({ error: error.message });
  }
};

const getToken = async (tokenSymbol) => {
  try {
    const token = await Token.findOne({ tokenSymbol: tokenSymbol });

    if (!token) throw new Error("Unable to get token");
    return token;
  } catch (error) {
    console.error({ error: error.message });
  }
};

const getTokenByID = async (tokenId) => {
  try {
    const token = await Token.findOne({ tokenId: tokenId });

    if (!token) throw new Error("Unable to get token");
    return token;
  } catch (error) {
    console.error({ error: error.message });
  }
};

const queryTokenBalance = async (accountID) => {
  try {
    const tokens = await hederaService.queryTokenBalance(accountID);
    if (!tokens) throw new Error("Unable to get token");

    const tokenList = tokens.tokens;
    const mp = new Map(tokenList);
    // for (const token in object) {
    //   if (Object.hasOwnProperty.call(object, token)) {
    //     const element = object[token];
        
    //   }
    // }
    await mp.forEach((balance, tokenID) => {
      const token = getTokenByID(tokenID);
      token.balance = balance;
      token.save();
    });
    return token;

    // return receipt;
  } catch (error) {
    console.error({ error: error.message });
  }
};

const burnToken = async (tokenSymbol) => {
  try {
    const token = await getToken(tokenSymbol);
    const tokenID = token.tokenId;
    const amountInCirculation = token.totalTonnes;

    const receipt = await hederaService.burnHederaToken(
      tokenID,
      amountInCirculation
    );
    if (!receipt) throw new Error("Error burning token");
    token.totalTonnes -= amountInCirculation;
    token.availableTonnes -= amountInCirculation;
    // token.tokenId = tokenID;
    await token.save();
    console.log("Successfully burnt token " + tokenID);
    return token;
  } catch (error) {
    console.error({ error: error.message });
    return error;
  }
};

const mintToken = async (tokenSymbol, amount) => {
  try {
    const token = await getToken(tokenSymbol);
    const tokenID = token.tokenId;
    // const amountInCirculation = token.totalTonnes;

    const receipt = await hederaService.mintHederaToken(
      tokenID,
      amount
    );
    if (!receipt) throw new Error("Error minting token");
    token.totalTonnes += amount;
    token.availableTonnes += amount;
    // token.tokenId = tokenID;
    await token.save();
    console.log(`Successfully minted ${amount} tokens`);
    return token;
  } catch (error) {
    console.error({ error: error.message });
    return error;
  }
};

const associateToken = async (tokenSymbol, accountID) => {
  try {
    const token = await getToken(tokenSymbol);
    const tokenID = token.tokenId;

    const accountID = req.userId;

    const receipt = await hederaService.associateHederaToken(
      tokenID,
      accountID
    );
    if (!receipt) throw new Error("Error associating token");

    token.associatedAccounts.push(accountID);
    return token;
  } catch (error) {
    console.error({ error: error.message });
    return error;
  }
};

const purchaseToken = async (
  tokenSymbol,
  amountInTonnes, //senderID,
  buyerID
) => {
  try {
    const token = await getToken(tokenSymbol);

    const tokenID = token.tokenId;

    // const senderID = mrvUser.hederaAccountID;


    {
      const buyer = await User.findById(buyerID);

      //Associate token to user
      if (!token.associatedAccounts.includes(buyer.hederaAccountID)) {
        const associationReceipt = await hederaService.associateHederaToken(
          tokenID,
          buyer
        );
        if (!associationReceipt) {
          throw new Error("Unable to associate token to recipient");
        } else {
          await token.associatedAccounts.push(buyer.hederaAccountID);
          await token.save();
        }
      }

      //Debit user wallet
      const buyerWallet = await walletService.getMyWallet(buyerID);

      const amountInFiat = Number(amountInTonnes * token.price);

      const debitTx = await walletService.debitWallet(
        amountInFiat,
        buyerWallet.id,
        `Bought ${amountInTonnes} tonnes of ${token.tokenSymbol}`
      );

      //Credit farmer wallet
      const project = await Aggregate.findOne({ projectToken: token });

      const farmList = project.farms;

      //FOR EACH FARM IN FARMS
      farmList.forEach(async (farmRef) => {
        const farmID = farmRef.toString();
        const farm = await Farm.findOne({ _id: farmID});
        // FARMER PERCENTAGE (FP) = farmerAvailableTonnes / projectAvailableTonnes 
        const FP = farm.availableTonnes / token.availableTonnes;

        //FARM TONNES DEBIT = FP * amountInTonnes
        const debitedAmountInTonnes = FP * amountInTonnes;
        farm.availableTonnes -= debitedAmountInTonnes;
        await farm.save();

        //FARMER WALLET CREDIT = 70% * (FP * amountInFiat)
        const creditAmount = (0.7 * FP * amountInFiat).toFixed(2);
        const farmerWallet = await walletService.getMyWallet(farm.farmer);

        const creditTx = await walletService.creditWallet(
          creditAmount,
          farmerWallet.id,
          `Sold ${debitedAmountInTonnes} tonnes of ${token.tokenSymbol}`
        );

        //Add tokens to farmer wallet
        await walletService.addTokenToFarmerWallet(farmerWallet.id, token.id, debitedAmountInTonnes, FP);

      });

      //Add tokens to buyer wallet

      await walletService.addTokenToBuyerWallet(buyerWallet.id, token.id, amountInTonnes);

      //Make HEDERA transfer
      const receipt = await hederaService.transferHederaToken(
        tokenID,
        amountInTonnes, // senderID,
        buyer.hederaAccountID
      );

      //TODO: Transaction receipt
      if (!receipt) throw new Error("Error transferring token");

      token.availableTonnes -= amountInTonnes;

      //TODO: Update project tonnes
      await token.save();
      return debitTx;
    }
  } catch (error) {
    console.error({ error: error.message });
    return error;
  }
};

module.exports = {
  createToken,
  getToken,
  getTokenByID,
  burnToken,
  mintToken,
  associateToken,
  purchaseToken,
  queryTokenBalance,
};
