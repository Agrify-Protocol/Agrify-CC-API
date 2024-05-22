const { AccountCreateTransaction, PrivateKey, Hbar } = require("@hashgraph/sdk");
const { myAccountId, myPrivateKey, initialHbarBalance } = require("../config/config.js");
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

        return newAccountId;
    }

    catch (error) {
        console.error(error);
    }
}
module.exports = { createHederaAccount };
