const express = require("express");
const authMiddleware = require("../middleware/auth");
const User = require("../models/user.model");
const Order = require("../models/order.model");

const profile = async (req, res) => {
  try {
    const selectedFields = "orderReferenceId";
    const user = await User.findById(req.userId);
    const history = await Order.aggregate([
      { $match: { user: user._id } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.project",
          orders: { $addToSet: "$_id" },
          quantity: { $sum: "$orderItems.quantity" },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "projectInfo",
        },
      },
      {
        $project: {
          projectId: "$_id",
          title: { $arrayElemAt: ["$projectInfo.title", 0] },
          orders: 1,
          quantity: 2,
        },
      },
    ]);
    res.status(200).json({ user, history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  profile,
};
