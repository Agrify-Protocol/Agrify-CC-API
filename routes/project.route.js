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

const {
  createAggregateProject,
  deleteUnsafe,
  updateProjectFields,
  updateProjectToken,
  getAllAggregateProjects,
  getProjectsByCategory,
  getAllProjectCategories,
  addFarmToAggregate,
  getAggregateProjectById,
  preorderFarmProduce,
  getAllPreOrders,
  getOrderById,
} = require("../controllers/aggregate.controller");

const router = express.Router();

router.get("/projects", authMiddleware, getProjects);
router.get("/projects/aggregate", authMiddleware, getAllAggregateProjects);
router.get("/projects/aggregate/category/:category", authMiddleware, getProjectsByCategory);
router.get("/projects/aggregate/category", authMiddleware, getAllProjectCategories);
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
router.post(
  "/projects/aggregate",
  authMiddleware,
  upload.fields([
    { name: "images", maxCount: 8 },
    { name: "cover", maxCount: 1 },
    { name: "supdoc", maxCount: 1 },
  ]),
  createAggregateProject
);
router.get("/projects/:id", authMiddleware, getProjectById);
router.put("/projects/aggregate/update/:id", authMiddleware, updateProjectFields);
router.put("/projects/aggregate/updateToken/:id", authMiddleware, updateProjectToken);
router.get("/projects/aggregate/:id", authMiddleware, getAggregateProjectById);
router.delete("/projects/aggregate/:id", authMiddleware, deleteUnsafe);

router.post("/preorder/:id", authMiddleware, preorderFarmProduce);
router.get("/preorders", authMiddleware, getAllPreOrders);
router.get("/preorders/:id", authMiddleware, getOrderById);

router.post("/projects/addFarm", addFarmToAggregate);
router.post("/seed-projects", seedProjects);
router.post("/reset-seed-projects", resetSeedProjects);

module.exports = router;
