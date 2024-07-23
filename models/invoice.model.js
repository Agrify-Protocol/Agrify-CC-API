const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = new Schema(
  {
    clientName: { type: String, required: true },
    paymentDueDate: { type: Date, required: true },
    phoneNumber: { type: String, required: true },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    quantity: { type: Number, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "cancelled", "paid"],
      default: "pending",
    },
    invoiceNo: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    contactNo: { type: String, required: true },
    issuedOn: { type: Date, default: Date.now },
    paymentReference: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", invoiceSchema);
