const express = require("express");
const upload = require("../utils/multer");
const authMiddleware = require("../middleware/auth");

const {
  createProject,
  getProjectById,
  getProjects,
  seedProjects,
  resetSeedProjects,
} = require("../controllers/project.controller");

const router = express.Router();

router.get("/projects", authMiddleware, getProjects);
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
router.get("/projects/:id", authMiddleware, getProjectById);

router.post("/seed-projects", seedProjects);
router.post("/reset-seed-projects", resetSeedProjects);

module.exports = router;
