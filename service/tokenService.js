const Token = require("../models/token.model");
const hederaService = require("../hedera/service/createToken.js");

const createToken = async (projectId, tokenName, tokenOwner, initialSupply) => {
	try {
		const tokenSymbol = projectId+"-AGT";  
		const tokenId = await hederaService.createHederaToken(tokenName, tokenSymbol, initialSupply);
		if (!tokenId) throw new Error("Error creating token");
		const token = await Token.create({
			tokenId, projectId, tokenName, tokenSymbol, tokenOwner, initialSupply,
		});
		// token.tokenId = tokenID;
		await token.save();
		return token;
	} catch (error) {
		console.error({ error: error.message });
	}
};


module.exports = { createToken };