const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("../middleware/auth");
const User = require("../models/user.model");
const Order = require("../models/order.model");
const Purchase = require("../models/purchase.model");
const Report = require("../models/report.model");
const moment = require("moment");

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

const overview = async (req, res) => {
  try {
    // get total projects funded
    // using purchases for now

    const userId = req.userId;

    const purchases = await Purchase.find({ userId: req.userId }).populate(
      "projectId"
    );

    const uniqueProjects = new Set(
      purchases.map((purchase) => purchase.projectId.toString())
    );

    const totalProjectsFunded = uniqueProjects.size;
    const totalTonnes = purchases.reduce(
      (sum, purchase) => sum + purchase.tonnes,
      0
    );

    // total amounts from invoices
    const invoiceAmounts = await Purchase.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          invoiceId: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: "invoices",
          localField: "invoiceId",
          foreignField: "_id",
          as: "invoice",
        },
      },
      { $unwind: "$invoice" },
      {
        $group: { _id: null, totalInvoiceAmount: { $sum: "$invoice.amount" } },
      },
      { $project: { _id: 0, totalInvoiceAmount: 1 } },
    ]);

    const totalInvoiceAmount =
      invoiceAmounts.length > 0 ? invoiceAmounts[0].totalInvoiceAmount : 0;
    const totalAmount = totalInvoiceAmount;

    const projectsFunded = purchases.map((purchase) => ({
      title: purchase.projectId.title,
      location: purchase.projectId.countryOfOrigin,
      purchaseType: purchase.purchaseType.toUpperCase,
      startDate: new Date(
        purchase.projectId.creditStartDate
      ).toLocaleDateString("en-US"),
    }));
    const data = {
      totalProjectsFunded,
      totalTonnes,
      totalAmount,
      projectsFunded,
    };

    res.status(200).json({ data });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

const createReport = async (req, res) => {
  try {
    const userId = req.userId;
    const { reportName } = req.body;

    // Find all purchases for the logged-in user and populate the project fields
    const purchases = await Purchase.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).populate("projectId", "title location startDate");

    // Calculate the total number of unique projects funded
    const uniqueProjects = new Set(
      purchases.map((purchase) => purchase.projectId.toString())
    );
    const totalProjectsFunded = uniqueProjects.size;

    // Calculate total tonnes
    const totalTonnes = purchases.reduce(
      (sum, purchase) => sum + purchase.tonnes,
      0
    );

    // Calculate total amount from invoices
    const invoiceAmounts = await Purchase.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          invoiceId: { $exists: true, $ne: null },
        },
      },
      {
        $lookup: {
          from: "invoices",
          localField: "invoiceId",
          foreignField: "_id",
          as: "invoice",
        },
      },
      { $unwind: "$invoice" },
      {
        $group: { _id: null, totalInvoiceAmount: { $sum: "$invoice.amount" } },
      },
      { $project: { _id: 0, totalInvoiceAmount: 1 } },
    ]);

    const totalInvoiceAmount =
      invoiceAmounts.length > 0 ? invoiceAmounts[0].totalInvoiceAmount : 0;

    const totalAmount = totalInvoiceAmount;

    const projectsFunded = purchases.map((purchase) => ({
      title: purchase.projectId.title,
      location: purchase.projectId.countryOfOrigin,
      purchaseType: purchase.purchaseType,
      startDate: moment(purchase.projectId.creditStartDate).format("MM-DD-YY"),
    }));

    const report = new Report({
      userId,
      reportName,
      summary: {
        totalProjectsFunded,
        totalTonnes,
        totalAmount,
        projectsFunded,
      },
    });

    await report.save();

    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const myReports = async (req, res) => {
  try {
    const userId = req.userId;
    const reports = await Report.find({ userId }).select(
      "reportName createdAt"
    );
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const reportDetails = async (req, res) => {
  try {
    const userId = req.userId;
    const { reportId } = req.params;

    const report = await Report.findOne({
      _id: new mongoose.Types.ObjectId(reportId),
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  profile,
  overview,
  createReport,
  myReports,
  reportDetails,
};
