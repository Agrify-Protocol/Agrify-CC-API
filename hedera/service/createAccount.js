const { AccountCreateTransaction, PrivateKey, Hbar, HbarUnit } = require("@hashgraph/sdk");
const { ADMIN_ACCOUNT_ID, ADMIN_PRIVATE_KEY, initialHbarBalance } = require("../../config.js");
const { client } = require("../client/client.js")

//Create new keys
const newAccountPrivateKey = PrivateKey.generateED25519();
const newAccountPublicKey = newAccountPrivateKey.publicKey;

const createHederaAccount = async () => {
    try {
        let account = await new AccountCreateTransaction()
            .setInitialBalance(Hbar.fromTinybars(initialHbarBalance))
            .setKey(newAccountPublicKey)
            .execute(client);

        const receipt = await account.getReceipt(client);
        const newAccountId = receipt.accountId;

        //Log the account ID
        console.log("The new account ID is: " + newAccountId);
        console.log("Public key: " + newAccountPublicKey);
        console.log("Private key: " + newAccountPrivateKey);

        return [newAccountId, newAccountPublicKey, newAccountPrivateKey];
    }

    catch (error) {
        console.error(error);
    }
}
module.exports = { createHederaAccount };
