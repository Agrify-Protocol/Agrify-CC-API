const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const demoRequestSchema = new Schema(
  {
    firstname: { type: String },
    lastName: { type: String },
    email: { type: String },
    companyName: { type: String },
    carbonCreditEngagement: { type: String },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
      },
    },
  }
);

module.exports = mongoose.model("demoRequest", demoRequestSchema);
