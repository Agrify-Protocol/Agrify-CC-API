const Invoice = require("../models/invoice.model");
const Project = require("../models/project.model");
const Purchase = require("../models/purchase.model");
const Aggregate = require("../models/aggregate.model");
const User = require("../models/user.model");

const createInvoice = async (req, res) => {
  try {
    const userId = req.userId; // Get the user ID from authMiddleware
    const { projectId } = req.body;

    // Check if the project exists
    // const project = await Project.findById(projectId);
    // if (!project) {
    //   return res
    //     .status(404)
    //     .json({ message: `Project does not exist with ID ${projectId}` });
    // }

    const project = await Aggregate.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project does not exist with ID ${projectId}` });
    }
    const invoiceNumber = await generateUniqueInvoiceNumber();

    const invoice = new Invoice({
      ...req.body,
      userId, // Attach the logged-in user's ID to the invoice
      invoiceNo: invoiceNumber,
    });
    const purchase = new Purchase({
      purchaseType: "invoice",
      status: "pending",
      tonnes: req.body.quantity,
      amount: req.body.amount,
      projectId,
      invoiceId: invoice._id,
      userId,
    });
    await invoice.save();
    await purchase.save();

    // refactor to use await
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const generateUniqueInvoiceNumber = async () => {
  const datePart = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const randomPart = Math.random().toString(10).substring(2, 7).toUpperCase();

  let invoiceNumber = `AGR-INV-${datePart}-${randomPart}`;

  const existingInvoice = await Invoice.findOne({ invoiceNo: invoiceNumber });
  while (existingInvoice) {
    const newRandomPart = Math.random()
      .toString(10)
      .substring(2, 7)
      .toUpperCase();
    invoiceNumber = `AGR-INV-${datePart}-${randomPart}`;
  }

  return invoiceNumber;
};

const payInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res
        .status(404)
        .json({ message: `Invoice does not exist with ID ${invoiceId}` });
    }

    invoice.status = "paid";
    await invoice.save();
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res
        .status(404)
        .json({ message: `Invoice does not exist with ID ${invoiceId}` });
    }
    Object.assign(invoice, req.body);
    await invoice.save();
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const getAllInvoices = async (req, res) => {
  try {
    const userId = req.userId;
    const invoices = await Invoice.find({ userId }).populate("projectId");
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

const getAllInvoicesForProject = async (req, res) => {
  try {
    const userId = req.userId;
    const { projectId } = req.params;
    const invoicesForProject = await Invoice.find({
      userId,
      projectId,
    }).populate("projectId");
    res.status(200).json(invoicesForProject);
  } catch (error) {}
};

const getInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId)
      .populate("userId")
      .populate("projectId");
    if (!invoice) {
      return res
        .status(404)
        .json({ message: `Invoice does not exist with ID ${invoiceId}` });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

const cancelInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      return res
        .status(404)
        .json({ message: `Invoice does not exist with ID ${invoiceId}` });
    }
    invoice.status = "cancelled";
    await invoice.save();
    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

module.exports = {
  createInvoice,
  payInvoice,
  updateInvoice,
  getAllInvoices,
  getInvoice,
  cancelInvoice,
  getAllInvoicesForProject,
};
