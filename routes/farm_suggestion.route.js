const express = require("express");
const router = express.Router();
const farmSuggestionController = require("../controllers/farm_suggestion.controller");

router.post("/create", farmSuggestionController.createFarmSuggestion);
router.get("/latest/:farmId", farmSuggestionController.getLatestFarmSuggestion);

module.exports = router;
