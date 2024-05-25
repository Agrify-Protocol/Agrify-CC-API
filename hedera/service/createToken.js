const {TokenCreateTransaction, TokenType, TokenSupplyType, PrivateKey} = require("@hashgraph/sdk");
const { myAccountId, myPrivateKey } = require("../config/config.js");
const { client } = require("../client/client.js")
// const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");

// CREATE FUNGIBLE TOKEN (STABLECOIN)
const createHederaToken = async(tokenName, tokenSymbol, initialSupply) => {
    let tokenCreateTx = await new TokenCreateTransaction()
	.setTokenName(tokenName)
	.setTokenSymbol(tokenSymbol)
	.setTokenType(TokenType.FungibleCommon)
    //TODO: Set decimal places depending on purchase model
	.setDecimals(2)
	.setInitialSupply(initialSupply)
	.setTreasuryAccountId(myAccountId)
	.setSupplyType(TokenSupplyType.Infinite)
	// .setSupplyKey(supplyKey)
	.freezeWith(client);

//SIGN WITH TREASURY KEY
let tokenCreateSign = await tokenCreateTx.sign(PrivateKey.generateED25519());

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