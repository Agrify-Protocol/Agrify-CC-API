const express = require("express");
const router = express.Router();
const soilDataController = require("../controllers/soil_data.controller");

router.post("/create", soilDataController.createSoilData);
router.get("/:farmId", soilDataController.getSoilData);

module.exports = router;
