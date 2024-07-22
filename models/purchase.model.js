const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const purchaseSchema = new Schema(
  {
    purchaseType: {
      type: String,
      required: true,
      enum: ["invoice", "card", "wallet"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    tonnes: {
      type: Number,
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    invoiceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purchase", purchaseSchema);
