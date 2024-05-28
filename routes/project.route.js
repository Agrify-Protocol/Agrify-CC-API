const express = require("express");
const upload = require("../utils/multer");
const authMiddleware = require("../middleware/auth");

const {
  createProject,
  getProjectById,
  getProjects,
  seedProjects,
} = require("../controllers/project.controller");

const router = express.Router();

router.get("/projects", getProjects);
router.post(
  "/projects",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 8 },
    { name: "cover", maxCount: 1 },
    { name: "supdoc", maxCount: 1 },
  ]),
  createProject
);
router.get("/projects/:id", getProjectById);

router.post("/seed-projects", seedProjects);

module.exports = router;
