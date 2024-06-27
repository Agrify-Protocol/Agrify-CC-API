const Token = require("../models/token.model");
const hederaService = require("../hedera/service/token.js");
const MrvUser = require("../models/mrv_user.model");
require("dotenv").config();

//TODO: Token refactor
const createToken = async (
  projectId,
  tokenName,
  tokenOwner,
  totalTonnes,
  availableTonnes,
  minimumPurchaseTonnes,
  price,
) => {
  try {
    const tokenSymbol = `${projectId}-AGT`;
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
      availableTonnes,
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

const getTokenByID = async (tokenSymbol) => {
  try {
    const token = await Token.findOne({ tokenId: tokenSymbol });

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
  amount, //senderID,
  recipientID
) => {
  try {
    const token = await getToken(tokenSymbol);

    const tokenID = token.tokenId;

    // const senderID = mrvUser.hederaAccountID;


    {
      const recipientUser = await MrvUser.findOne({ _id: recipientID });

      //Associate token to user
      if (!token.associatedAccounts.includes(recipientUser.hederaAccountID)) {
        const associationReceipt = await hederaService.associateHederaToken(
          tokenID,
          recipientUser
        );
        if (!associationReceipt) {
          throw new Error("Unable to associate token to recipient");
        } else {
          await token.associatedAccounts.push(recipientUser.hederaAccountID);
          await token.save();
        }
      }

      //Make transfer
      const receipt = await hederaService.transferHederaToken(
        tokenID,
        amount, // senderID,
        recipientUser.hederaAccountID
      );

      //TODO: Transaction receipt
      if (!receipt) throw new Error("Error transferring token");

      token.availableTonnes -= amount;

      //TODO: Update project tonnes
      await token.save();
      return token;
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
  associateToken,
  purchaseToken,
  queryTokenBalance,
};
