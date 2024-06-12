const { Client, PrivateKey, AccountCreateTransaction, AccountBalanceQuery, Hbar, TransferTransaction } = require("@hashgraph/sdk");
require('dotenv').config();

// async function environmentSetup() {

    const ADMIN_ACCOUNT_ID = process.env.ADMIN_ACCOUNT_ID;
    const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;
    const initialHbarBalance = process.env.DEFAULT_HBAR_BALANCE;

    // If we weren't able to grab it, we should throw a new error
    if (!ADMIN_ACCOUNT_ID || !ADMIN_PRIVATE_KEY) {
        throw new Error("Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present");
    }

// }
// environmentSetup();

module.exports = { ADMIN_ACCOUNT_ID, ADMIN_PRIVATE_KEY, initialHbarBalance };
