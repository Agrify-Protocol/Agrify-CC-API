const Farm = require("../models/farm.model");
const MrvUser = require('../models/mrv_user.model');
const authMiddleWare = require("../middleware/auth")
const mongoose = require("mongoose");

const getFarmById = async (req, res) => {
    const {id} = req.params;
    try {
        const farm = await Farm.findById(id);
        if(!farm){
            return res.status(404).json({message: `Farm with ID: ${id} not found!`});
        }
        return res.status(200).json(farm);
    } catch (error) {
        console.log(error);
    }
}

const getAllFarms = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const sortBy = req.query.sortBy || "latest";

        let sortCriteria;
        if (sortBy === "latest") {
          sortCriteria = { _id: -1 };
        } else if (sortBy === "oldest") {
          sortCriteria = { _id: 1 };
        } else if (sortBy === "tonnesLeftLowToHigh") {
          sortCriteria = { availableTonnes: 1 };
        } else if (sortBy === "tonnesLeftHighToLow") {
          sortCriteria = { availableTonnes: -1 };
        } else {
          sortCriteria = {};
        }
    
        const farmFields = "name category state country availableTonnes";

        const skip = (page - 1) * limit;
        const farms = await Farm.find({}, farmFields)
          .sort(sortCriteria)
          .skip(skip)
          .limit(parseInt(limit))
        //   .populate({
        //     path: "farmer"
        //   })
          ;
        const total = await Farm.countDocuments();
        const totalPages = Math.ceil(total / limit);
    
        const nextPage = page < totalPages ? page + 1 : null;
        const prevPage = page < 1 ? page - 1 : null;
        
        res
        .status(200)
        .json({ farms, total, page, totalPages, nextPage, prevPage });

    } catch (error) {
        console.log(error);
    }
}

const createFarm = async (req, res) => {
    try {
        // find user in MRV Model
        const mrvUser  = await MrvUser.findById(req.userId);
        if(!mrvUser){
            return res.status(404).json({message: `User does not have an MRV account!`});
        }
        const {
            name, country, address, city, state, latitude, longitude, area, category, availableTonnes
            } = req.body;            
            
        // //TODO: Geolocation API
        const farmLocation = "";
        
        const cat = category.toLowerCase();

        const farm = await Farm.create({
            name, country, address, city, state, category: cat, availableTonnes, farmer: mrvUser, lat: latitude, long: longitude, area
        });

        await farm.save();
        res.status(201).json(farm);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const getFarmByFarmerId = async (req, res) => {
    let result = {};
    const { farmerId } = req.params;

    // Validate farmerId
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
        return res.status(400).json({ message: `Invalid farmer ID ${farmerId}` });
    }

    try {
        // Ensure farmer exists
        const farmer = await MrvUser.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ message: `Farmer does not exist with ID ${farmerId}` });
        }

        // Find farm by farmer ID
        const farm = await Farm.findOne({ farmer: farmer._id });
        if (!farm) {
            return res.status(404).json({ message: `No farm found for farmer ID ${farmerId}` });
        }
        result = {farmerId: farmerId, farmName: farm.name, farmLocation: farm.country, category: farm.category, latitude: farm.lat ? farm.lat :'', longitude: farm.long ? farm.long : '', area: farm.area ? farm.area : ''};
        return res.status(200).json({data: result});
    } catch (error) {
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
};



module.exports = {createFarm, getFarmById, getFarmByFarmerId, getAllFarms};