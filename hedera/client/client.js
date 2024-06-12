const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
const { ADMIN_ACCOUNT_ID, ADMIN_PRIVATE_KEY } = require("../config/config.js");
require("@hashgraph/sdk");

//Create your Hedera Testnet client
const client = Client.forTestnet();

//Set your account as the client's operator
client.setOperator(ADMIN_ACCOUNT_ID, ADMIN_PRIVATE_KEY);

//Set the default maximum transaction fee (in Hbar)
// client.setDefaultMaxTransactionFee(new Hbar(1));

//Set the maximum payment for queries (in Hbar)
// client.setDefaultMaxQueryPayment(new Hbar(1));


module.exports = { client };