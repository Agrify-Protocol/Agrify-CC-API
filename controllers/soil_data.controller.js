const SoilData = require("../models/soil_data.model");
const MrvUser = require("../models/mrv_user.model");
const Farm = require("../models/farm.model");

const createSoilData = async (req, res) => {
  try {
    const { FarmId } = req.body;

    // Check if the farmer exists
    // const farmer = await MrvUser.findById(FarmerId);
    // if (!farmer) {
    //   return res
    //     .status(404)
    //     .json({ message: `Farmer does not exist with ID ${FarmerId}` });
    // }

    // Check if the farm exists
    const farm = await Farm.findById(FarmId);
    if (!farm) {
      return res
        .status(404)
        .json({ message: `Farm does not exist with ID ${FarmId}` });
    }

    // Create new soil data entry
    const soilData = await SoilData.create(req.body);
    await soilData.save();
    farm.soilData = soilData;
    await farm.save();
    res.status(201).json(soilData);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

const getSoilData = async (req, res) => {
  try {
    const { farmId } = req.params;
    const soilData = await SoilData.findOne({ FarmId: farmId });
    return res.status(201).json(soilData);
  } catch (error) {
    res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

module.exports = {
  createSoilData,
  getSoilData,
};
