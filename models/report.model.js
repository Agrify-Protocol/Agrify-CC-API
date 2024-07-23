const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reportName: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  summary: {
    totalProjectsFunded: Number,
    totalTonnes: Number,
    totalAmount: Number,
    projectsFunded: [
      {
        title: String,
        location: String,
        purchaseType: String,
        startDate: String,
      },
    ],
  },
});

module.exports = mongoose.model("Report", reportSchema);
