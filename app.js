const express = require('express');
const projectRoutes = require('./routes/project.route');
const tagRoutes = require('./routes/tag.route');
const authRoutes = require('./routes/auth.route');
const profileRoutes = require('./routes/profile.route');
const adminRoutes = require('./routes/admin.route');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const cloudinary = require('./utils/cloudinary');
require('dotenv').config();


const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.status(200).json({alive: "True"});
});

app.use("/api/v1", projectRoutes);
app.use("/api/v1", tagRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1",profileRoutes);
app.use("/api/v1/admin", adminRoutes);

app.post('/api/v1/upload', upload.array('images'), async (req, res) => {
  const uploadedImages = [];

  const {title,description,tags} = req.body;

  for (const file of req.files) {
    const uploadResult = await cloudinary.v2.uploader.upload(file.path);
    uploadedImages.push(uploadResult.secure_url);
  }

  // uploadedImages will contain an array of upload results for each image
  // You can perform any necessary operations here with the uploaded images

  res.status(200).json({
    title,
    tags,
    uploadedImages
  });
});
module.exports = app;