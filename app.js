const express = require("express");
const cors = require("cors");
const projectRoutes = require("./routes/project.route");
const farmRoutes = require("./routes/farm.route");
const investorRoutes = require("./routes/investor.route");
const orderRoutes = require("./routes/order.route");
const tagRoutes = require("./routes/tag.route");
const authRoutes = require("./routes/auth.route");
const profileRoutes = require("./routes/profile.route");
const adminRoutes = require("./routes/admin.route");
const contactRoutes = require("./routes/contact.route");
const demoRequestRoutes = require("./routes/demorequest.route");
const waitlistRoutes = require("./routes/waitlist.route");
const tokenRoutes = require("./routes/token.route");
const walletRoutes = require("./routes/wallet.route");
const transactionRoutes = require("./routes/transaction.route");
const mrvAuthRoutes = require("./routes/mrv/mrv_auth.route");
const mrvProfileRoutes = require("./routes/mrv/mrv_profile.route");
const soilDataRoutes = require("./routes/soil_data.route");
const farmSuggestionRoutes = require("./routes/farm_suggestion.route");
const invoiceRoutes = require("./routes/invoice.route");
const purchaseRoutes = require("./routes/purchase.route");
const paymentRoutes = require("./routes/payment.route");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const cloudinary = require("./utils/cloudinary");
const fileUpload = require("express-fileupload");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
// app.use(fileUpload({useTempFiles: true}));

app.get("/", (req, res) => {
  res.status(200).json({ alive: "True" });
});

app.get("/api/v1/roost", (req, res) => {
  res.status(200).json({ alive: "Roost" });
});

app.use("/api/v1", projectRoutes);
app.use("/api/v1", orderRoutes);
app.use("/api/v1", tagRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1", profileRoutes);
app.use("/api/v1", farmRoutes);
app.use("/api/v1", investorRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/contact", contactRoutes);
app.use("/api/v1/demo-requests", demoRequestRoutes);
app.use("/api/v1/waitlist", waitlistRoutes);
app.use("/api/v1/tokens", tokenRoutes);
app.use("/api/v1/wallet", walletRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/mrv/auth/", mrvAuthRoutes);
app.use("/api/v1/mrv/profile", mrvProfileRoutes);
app.use("/api/v1/soil-data/", soilDataRoutes);
app.use("/api/v1/farm-suggestions", farmSuggestionRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/v1/payments", paymentRoutes);

app.post("/api/v1/upload", upload.array("images"), async (req, res) => {
  const uploadedImages = [];

  const { title, description, tags } = req.body;

  for (const file of req.files) {
    const uploadResult = await cloudinary.v2.uploader.upload(file.path);
    uploadedImages.push(uploadResult.secure_url);
  }

  // uploadedImages will contain an array of upload results for each image
  // You can perform any necessary operations here with the uploaded images

  res.status(200).json({
    title,
    tags,
    uploadedImages,
  });
});
// CORS
app.use(async (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", true);
  res.header("Access-Control-Allow-Methods", "*");
  return next();
});
module.exports = app;
