const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const walletSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "USD"
    },
    balance: {
      type: Number,
      required: true,
      default: 0.00
    },
    tokens: [
      {
        token: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Token",
        },
        amount: {
          type: Number,
          required: true,
        },
      },
    ],    // projectToken: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Token",
    // },
    //TODO: Add farmID
  },
  { timestamps: true }
);

module.exports = mongoose.model("Wallet", walletSchema);
