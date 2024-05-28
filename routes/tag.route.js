const express = require("express");
const upload = require("../utils/multer");

const {
  createTag,
  getTags,
  getTagById,
  seedTags,
} = require("../controllers/tag.controller");
const router = express.Router();

router.get("/tags", getTags);
router.post("/tags", upload.single("image"), createTag);
router.get("/tags/:id", getTagById);
router.post("/seed-tags", seedTags);

module.exports = router;
