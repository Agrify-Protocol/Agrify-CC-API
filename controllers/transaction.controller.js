const Transaction = require("../models/transaction.model");
const authMiddleWare = require("../middleware/auth")

// const getAllTokens = async (req, res) => {
//   try {
//     const result = await Token.find({}).sort({ tokenName: 1 }).exec();
//     res.status(200).json({ message: "Tokens", data: result });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId })
    // .populate({path:'trnxType'})
    // .populate(['trnxType', 'amount', 'reference'])
    // .sort( {updatedAt: -1});
    
    // const exisitingWallet = await Wallet.findOne({ userId: req.userId });

    // if (exisitingWallet) {
    //   return res.status(400).json({ message: `Wallet already exists` });
    // }

    // const wallet = await walletService.createWallet(req.userId);

    res.status(200).json({ message: "Transactions", data: transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTransactionHistory,
};
