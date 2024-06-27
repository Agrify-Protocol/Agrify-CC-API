const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    trnxType: {
      type: String,
      required: true,
      enum: ['CR', 'DR']
    },
    purpose:{
      type: String,
      enum : ['deposit', 'transfer', 'reversal', 'withdrawal'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      default: 0.00
    },
    userId: {
      type: String,
      required: true,
      // ref: 'Wallet'
    },
    reference: { type: String, required: true },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
    // summary: { type: String, required: true },
    // trnxSummary:{ type: String, required: true }
  },
  { timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret._id;
        delete ret.userId;
        delete ret.updatedAt;
        delete ret.balanceBefore;
        delete ret.balanceAfter;
      },
    },
   }
);

module.exports = mongoose.model("Transaction", transactionSchema);
