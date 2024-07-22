const farmModel = require("../models/farm.model");
const FarmSuggestion = require("../models/farm_suggestion.model");
const MrvUser = require("../models/mrv_user.model");

const createFarmSuggestion = async (req, res) => {
  try {
    const { FarmId } = req.body;
    // check if the farmer id exists
    // const farmer = await MrvUser.findById(FarmerId);

    // if (!farmer) {
    //   return res
    //     .status(404)
    //     .json({ message: `Farmer does not exist with ID ${FarmerId}` });
    // }

    const farm = await farmModel.findById(FarmId);
    if (!farm) {
      return res
        .status(404)
        .json({ message: `Farm does not exist with ID ${farm}` });
    }

    // parse tasks for each month
    const parseTasks = (monthData) => {
      return Object.keys(monthData).map((taskKey) => ({
        Task: monthData[taskKey],
      }));
    };

    const month1Tasks = parseTasks(req.body.Month1);
    const month2Tasks = parseTasks(req.body.Month2);
    const month3Tasks = parseTasks(req.body.Month3);

    const farmSuggestionData = {
      PeriodStart: req.body.PeriodStart,
      PeriodEnd: req.body.PeriodEnd,
      // FarmerId: req.body.FarmerId,
      FarmId: req.body.FarmId,
      FarmerName: req.body.FarmerName,
      FarmScore: req.body.FarmScore,
      RecommendationsIntro: req.body.RecommendationsIntro,
      Month1: { Tasks: month1Tasks },
      Month2: { Tasks: month2Tasks },
      Month3: { Tasks: month3Tasks },
      RecommendationsSummary: req.body.RecommendationsSummary,
    };

    // create a new farm suggestion entry
    const farmSuggestion = await FarmSuggestion.create(farmSuggestionData);
    await farmSuggestion.save();
    farm.farmSuggestion = farmSuggestion;
    await farm.save();
    res.status(201).json(farmSuggestion);
  } catch (error) {
    res.status(500).json({ message: `Server Error: ${error.message}` });
  }
};

const getLatestFarmSuggestion = async (req, res) => {
  try {
    const { farmId } = req.params;
    const farm = await farmModel.findById(farmId);
    const farmSuggestion = await FarmSuggestion.findOne({
      FarmId: farmId,
    }).sort({
      createdAt: -1,
    });
    if (farmSuggestion != farm.farmSuggestion){
      farm.farmSuggestion = farmSuggestion;
      await farm.save();
    }
    res.status(200).json(farmSuggestion);
  } catch (error) {
    if (!farmSuggestion) {
      return res.status(404).json({
        message: "No farm suggestions found for the given Farmer ID",
      });
    }
    res.status(200).json(farmSuggestion);
  }
};

module.exports = {
  createFarmSuggestion,
  getLatestFarmSuggestion,
};
