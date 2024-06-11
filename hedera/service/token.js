const {TokenCreateTransaction, TokenType, TokenSupplyType, PrivateKey, TokenBurnTransaction, TokenAssociateTransaction, TransferTransaction} = require("@hashgraph/sdk");
const { ADMIN_ACCOUNT_ID, ADMIN_PRIVATE_KEY } = require("../config/config.js");
const { client } = require("../client/client.js")
// const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");

// CREATE FUNGIBLE TOKEN (STABLECOIN)
const createHederaToken = async(tokenName, tokenSymbol, initialSupply) => {
    let tokenCreateTx = await new TokenCreateTransaction()
	.setTokenName(tokenName)
	.setTokenSymbol(tokenSymbol)
	.setTokenType(TokenType.FungibleCommon)
    //TODO: Set decimal places depending on purchase model
	// .setDecimals(2)
	.setInitialSupply(initialSupply)
	.setSupplyKey(PrivateKey.fromStringDer(ADMIN_PRIVATE_KEY))
	.setTreasuryAccountId(ADMIN_ACCOUNT_ID)
	.setSupplyType(TokenSupplyType.Infinite)
	// .setSupplyKey(supplyKey)
	.freezeWith(client);

//SIGN WITH TREASURY KEY
let tokenCreateSign = await tokenCreateTx.sign(PrivateKey.fromStringDer(ADMIN_PRIVATE_KEY));

//SUBMIT THE TRANSACTION
let tokenCreateSubmit = await tokenCreateSign.execute(client);

//GET THE TRANSACTION RECEIPT
let tokenReceipt = await tokenCreateSubmit.getReceipt(client);

//GET THE TOKEN ID
let tokenId = tokenReceipt.tokenId;

//LOG THE TOKEN ID TO THE CONSOLE
console.log(`- Created token with ID: ${tokenId} \n`);

return tokenId;
}

const burnHederaToken = async(tokenId, amountInCirculation) => {
//Burn 1,000 tokens and freeze the unsigned transaction for manual signing
const transaction = await new TokenBurnTransaction()
     .setTokenId(tokenId)
     .setAmount(amountInCirculation)
     .freezeWith(client);

//Sign with the supply private key of the token 
const signTx = await transaction.sign(PrivateKey.fromStringDer(ADMIN_PRIVATE_KEY));

//Submit the transaction to a Hedera network    
const txResponse = await signTx.execute(client);

//Request the receipt of the transaction
const receipt = await txResponse.getReceipt(client);
    
//Get the transaction consensus status
const transactionStatus = receipt.status;

console.log("Token deleted. Consensus status: " +transactionStatus.toString());

return receipt;
}


const associateHederaToken = async(tokenId, user) => {
//Associate a token to an account and freeze the unsigned transaction for signing
const transaction = await new TokenAssociateTransaction()
     .setAccountId(user.hederaAccountID)
     .setTokenIds([tokenId])
     .freezeWith(client);

//Sign with the private key of the account that is being associated to a token 
const signTx = await transaction.sign(PrivateKey.fromStringDer(user.hederaPrivateKey));

//Submit the transaction to a Hedera network    
const txResponse = await signTx.execute(client);

//Request the receipt of the transaction
const receipt = await txResponse.getReceipt(client);

console.log(`Token ${tokenId} successfully associated with account ${user.hederaAccountID}!`);

return receipt;
}


const transferHederaToken = async(tokenId, amount, //senderID, 
	recipientID) => {

	const senderID = ADMIN_ACCOUNT_ID;
	const transaction = await new TransferTransaction()
	.addTokenTransfer(tokenId, senderID, -amount)
	.addTokenTransfer(tokenId, recipientID, amount)
	.freezeWith(client);

//Sign with the sender account private key
const signTx = await transaction.sign(PrivateKey.fromStringDer(ADMIN_PRIVATE_KEY));

//Sign with the client operator private key and submit to a Hedera network
const txResponse = await signTx.execute(client);

//Request the receipt of the transaction
const receipt = await txResponse.getReceipt(client);

//Obtain the transaction consensus status
const transactionStatus = receipt.status;

console.log("Transfer status " +transactionStatus.toString());

return receipt;
}



module.exports = {createHederaToken, burnHederaToken, associateHederaToken, transferHederaToken};