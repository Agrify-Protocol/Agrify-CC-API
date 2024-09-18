const Purchase = require("../models/purchase.model");

const getAllPurchases = async (req, res) => {
  try {
    const userId = req.userId;
    const purchases = await Purchase.find({ userId });
    res.status(200).json(purchases);
  } catch (error) {
    console.log(error);
  }
};

const getPurchasesByProjectId = async (req, res) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;

    const purchases = await Purchase.find({ userId, projectId }).sort({ _id: -1 });

    if (!purchases || purchases.length === 0) {
      return res
        .status(404)
        .json({ message: "No purchases found for this project" });
    }

    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getPurchasesByPaymentRef = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentReference } = req.params;

    const purchases = await Purchase.find({ userId, paymentReference });

    if (!purchases || purchases.length === 0) {
      return res
        .status(404)
        .json({ message: `No purchases found with ref: ${paymentReference}` });
    }

    res.status(200).json(purchases);
  } catch (error) {
    console.error("Error fetching purchases:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getAllPurchases, getPurchasesByProjectId, getPurchasesByPaymentRef };
