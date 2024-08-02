const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const investorSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['financier', 'insetting', 'developer', 'off-taker', 'explorer'],
    },
    interest: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
      },
    },

  }
);

module.exports = mongoose.model("Investor", investorSchema);
