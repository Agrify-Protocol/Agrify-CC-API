const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const mrvUserSchema = new Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    email: { type: String, unique: true },
    password: { type: String },
    emailVerificationCode: { type: String },
    emailVerificationCodeExpiration: { type: String },
    isProjectDeveloper: { type: Boolean, default: false },
    isFarmer: { type: Boolean, default: false },
    isVerifier: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        delete ret.password;
        delete ret.createdAt;
        delete ret.updatedAt;
      },
    },
  }
);

module.exports = mongoose.model("MrvUser", mrvUserSchema);
