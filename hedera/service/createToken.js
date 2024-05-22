const {TokenCreateTransaction, TokenType, TokenSupplyType} = require("@hashgraph/sdk");
const { myAccountId, myPrivateKey } = require("../config/config.js");
const { client, newAccountPrivateKey } = require("../client/client.js")
// const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");

// CREATE FUNGIBLE TOKEN (STABLECOIN)
const createHederaToken = async(tokenCreateRequest) => {
    let tokenCreateTx = await new TokenCreateTransaction()
	.setTokenName(tokenCreateRequest.tokenName)
	.setTokenSymbol(tokenCreateRequest.tokenSymbol)
	.setTokenType(TokenType.FungibleCommon)
	.setDecimals(2)
	.setInitialSupply(tokenCreateRequest.initialSupply)
	.setTreasuryAccountId(myAccountId)
	.setSupplyType(TokenSupplyType.Infinite)
	// .setSupplyKey(supplyKey)
	.freezeWith(client);

//SIGN WITH TREASURY KEY
let tokenCreateSign = await tokenCreateTx.sign(newAccountPrivateKey);

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

module.exports = {createHederaToken};