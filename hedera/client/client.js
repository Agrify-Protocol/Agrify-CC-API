const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
const { myAccountId, myPrivateKey } = require("../config/config.js");
require("@hashgraph/sdk");

//Create your Hedera Testnet client
const client = Client.forTestnet();

//Set your account as the client's operator
client.setOperator(myAccountId, myPrivateKey);

//Set the default maximum transaction fee (in Hbar)
client.setDefaultMaxTransactionFee(new Hbar(10));

//Set the maximum payment for queries (in Hbar)
client.setDefaultMaxQueryPayment(new Hbar(50));

//Create new keys
const newAccountPrivateKey = PrivateKey.generateED25519(); 
const newAccountPublicKey = newAccountPrivateKey.publicKey;

//Create a new account with 1,000 tinybar starting balance
const createAccount = async() => {
    const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

// Get the new account ID
const getReceipt = await newAccount.getReceipt(client);
const newAccountId = getReceipt.accountId;
    
//Log the account ID
console.log("The new account ID is: " +newAccountId);

//Verify the account balance
const accountBalance = await new AccountBalanceQuery()
     .setAccountId(newAccountId)
     .execute(client);

console.log("The new account balance is: " +accountBalance.hbars.toTinybars() +" tinybar.");
}


module.exports = {createAccount, client, newAccountPrivateKey};