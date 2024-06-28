const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tokenSchema = new Schema(
  {
    tokenId: { type: String, required: true },
    projectId: { type: String, required: true },
    tokenName: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    tokenOwner: { type: String, required: true },
    totalTonnes: { type: Number, required: true },
    availableTonnes: { type: Number, required: true },
    minimumPurchaseTonnes: { type: Number, required: true },
    balance: { type: Number, required: true, default: 0.00 },
    price: { type: Number, required: true },
    associatedAccounts: [
       { type: String }
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.associatedAccounts;
        delete ret.balance;
      },
    },
  }
);

module.exports = mongoose.model("Token", tokenSchema);
