const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    isAdmin: { type: Boolean, default: false },
    isBuyer: { type: Boolean, default: true },
    verificationToken: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    hederaAccountID: { type: String },
    hederaPublicKey: { type: String },
    hederaPrivateKey: { type: String },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.password;
        delete ret.createdAt;
        delete ret.updatedAt;
        delete ret.hederaPublicKey;
        delete ret.hederaPrivateKey;
      },
    },
  }
);

module.exports = mongoose.model("User", userSchema);
