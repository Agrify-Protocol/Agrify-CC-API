const Farm = require("../models/farm.model");
const authMiddleWare = require("../middleware/auth")
const Project = require("../models/project.model");

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

const getMyFarm = async (req, res) => {
    try {
        const farm = await Farm.findOne({});
        if(!farm){
            return res.status(404).json({message: `No farm found!`});
        }
        const farmProjects = await Project.find({});
        console.log(farmProjects);
        farm.projects.push(...farmProjects);
        console.log(farm.projects)
        return res.status(200).json(farm);
    } catch (error) {
        console.log(error);
    }
}


const createFarm = async (req, res) => {
    try {
        
        const existingFarm = await Farm.findOne();
        if (existingFarm){
            throw new Error("Farm already created");
        }
        const {
            name, country, address, city, state
            } = req.body;            
            
        const farmerID = req.userId;
        //TODO: Geolocation API
        const farmLocation = "";

        const farm = await Farm.create({
            name, country, address, city, state, farmerID,
        });

        await farm.save();
        res.status(201).json(farm);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};



module.exports = {createFarm, getFarmById, getMyFarm};