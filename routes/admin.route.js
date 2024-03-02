const express = require("express");
const {
  getAllUsers,
  deleteMRVUser,
} = require("../controllers/admin.controller");
const adminMiddleware = require("../middleware/admin.middleware");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.delete("/delete-mrv-user/:email", deleteMRVUser);

module.exports = router;
