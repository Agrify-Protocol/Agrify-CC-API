const Token = require("../models/token.model");
const Farm = require("../models/farm.model");
const Aggregate = require("../models/aggregate.model");
const hederaService = require("../hedera/service/token.js");
const walletService = require("../service/walletService.js");
const User = require("../models/user.model");
require("dotenv").config();

//TODO: Token refactor
const createToken = async (
  projectId,
  tokenName,
  tokenOwner,
  minimumPurchaseTonnes,
  price,
  tokenId,
  tokenSymbol,
) => {
  try {
    // const tokenSymbol = `${projectId}-AGT`;
    const totalTonnes = 0;
    // const tokenId = await hederaService.createHederaToken(
    //   tokenName,
    //   tokenSymbol,
    //   totalTonnes

    // );
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

const queryTokenBalance = async (tokenId, accountID) => {
  try {
    let tokens;
    if (accountID) {
      tokens = await hederaService.queryTokenBalance(accountID);
    }
    else {
      tokens = await hederaService.queryAdminTokenBalance();
    }
    let token;
    if (!tokens) token = 0;
    else {
      const tokenCents = tokens.tokens.get(tokenId);
      const tokenDecimal = tokens.tokenDecimals.get(tokenId);
      if (tokenCents == undefined || tokenDecimal == undefined) {
        throw new Error("Unable to get token");
      }
      else {
        token = tokenCents / Math.pow(10, tokenDecimal);
      }
    }

    // await mp.forEach((balance, tokenID) => {
    //   const token = getTokenByID(tokenID);
    //   token.balance = balance;
    //   token.save();
    // });
    return token;

    // return receipt;
  } catch (error) {
    console.error({ error: error.message });
  }
};

const burnToken = async (tokenID) => {
  try {
    const token = await getTokenByID(tokenID);
    // const tokenID = token.tokenId;
    const amountInCirculation = token.totalTonnes;

    // const receipt = await hederaService.burnHederaToken(
    //   tokenID,
    //   amountInCirculation
    // );
    // if (!receipt) throw new Error("Error burning token");
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

const mintToken = async (tokenID, amount) => {
  try {
    const token = await getTokenByID(tokenID);
    // const tokenID = token.tokenId;
    // const amountInCirculation = token.totalTonnes;

    // const receipt = await hederaService.mintHederaToken(
    //   tokenID,
    //   amount
    // );
    // if (!receipt) throw new Error("Error minting token");
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

const associateToken = async (tokenID, accountID) => {
  try {
    const token = await getTokenByID(tokenID);
    // const tokenID = token.tokenId;

    // const accountID = req.userId;

    const buyer = await User.findById(accountID);

    if (!buyer){ 
      throw new Error("User not found");
    }
    if (buyer.associatedTokens.includes(tokenID)) {
      throw new Error("Token already associated to account");
    }
  
    await buyer.associatedTokens.push(tokenID);
    await buyer.save();


    // const receipt = await hederaService.associateHederaToken(
    //   tokenID,
    //   accountID
    // );
    // if (!receipt) throw new Error("Error associating token");

    // token.associatedAccounts.push(accountID);
    return buyer;
  } catch (error) {
    console.error({ error: error.message });
    return error;
  }
};

const purchaseToken = async (
  tokenID,
  amountInTonnes, //senderID,
  buyerID

) => {
  try {
    const token = await getTokenByID(tokenID);

    const tokenBalance = queryTokenBalance(tokenID);

    token.availableTonnes = tokenBalance;

    // const token = await hederaService.getHederaToken(tokenID);

    // const tokenID = token.tokenId;

    // const senderID = mrvUser.hederaAccountID;


    {
      const buyer = await User.findById(buyerID);

      //Associate token to user
      if (!buyer.associatedTokens.includes(tokenID)) {
        const associationReceipt = await hederaService.associateHederaToken(
          tokenID,
          buyer
        );
        if (!associationReceipt) {
          throw new Error("Unable to associate token to recipient");
        } else {
          await buyer.associatedTokens.push(tokenID);
          await buyer.save();
        }
      }

      //Debit user wallet
      const buyerWallet = await walletService.getMyWallet(buyerID);

      const amountInFiat = Number(amountInTonnes * token.price);

      // const debitTx = await walletService.debitWallet(
      //   amountInFiat,
      //   buyerWallet.id,
      //   `Bought ${amountInTonnes} tonnes of ${token.tokenSymbol}`
      // );

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
      // await token.save();
      return receipt;
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
