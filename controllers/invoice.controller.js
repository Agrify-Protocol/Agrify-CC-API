const Invoice = require("../models/invoice.model");
const Project = require("../models/project.model");
const User = require("../models/user.model");

const createInvoice = async (req, res) => {
  try {
    const userId = req.userId; // Get the user ID from authMiddleware
    const { projectId } = req.body;

    // Check if the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: `Project does not exist with ID ${projectId}` });
    }

    const invoice = new Invoice({
      ...req.body,
      userId, // Attach the logged-in user's ID to the invoice
    });
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
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
};
