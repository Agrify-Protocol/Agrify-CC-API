const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
require('dotenv').config();


    const ADMIN_ACCOUNT_ID = process.env.ADMIN_ACCOUNT_ID;
    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
    const initialHbarBalance = process.env.DEFAULT_HBAR_BALANCE;

    if (!ADMIN_ACCOUNT_ID || !ADMIN_PRIVATE_KEY) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }


module.exports = { ADMIN_ACCOUNT_ID, ADMIN_PRIVATE_KEY, initialHbarBalance };
