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

const createFarm = async (req, res) => {
    try {
        // find user in MRV Model
        const mrvUser  = await MrvUser.findById(req.userId);
        if(!mrvUser){
            return res.status(404).json({message: `User does not have an MRV account!`});
        }
        const {
            name, country, address, city, state, latitude, longitude, area
            } = req.body;            
            
        // //TODO: Geolocation API
        const farmLocation = "";

        const farm = await Farm.create({
            name, country, address, city, state, farmer: mrvUser, lat: latitude, long: longitude, area
        });

        await farm.save();
        res.status(201).json(farm);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
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
        result = {farmerId: farmerId, farmName: farm.name, farmLocation: farm.country, latitude: farm.lat ? farm.lat :'', longitude: farm.long ? farm.long : '', area: farm.area ? farm.area : ''};
        return res.status(200).json({data: result});
    } catch (error) {
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
};



module.exports = {createFarm, getFarmById, getFarmByFarmerId};