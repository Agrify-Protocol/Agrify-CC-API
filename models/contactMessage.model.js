const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contactMessageSchema = new Schema(
  {
    firstname: { type: String },
    lastName: { type: String },
    userType: { type: String },
    email: { type: String },
    message: { type: String },
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

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
