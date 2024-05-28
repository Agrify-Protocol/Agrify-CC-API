const Farm = require("../models/farm.model");
const authMiddleWare = require("../middleware/auth")

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
        
        const {
            name, country, address, city, state
            } = req.body;            
            
        //TODO: Geolocation API
        const farmLocation = "";

        const farm = await Farm.create({
            name, country, address, city, state
        });

        await farm.save();
        res.status(201).json(farm);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};



module.exports = {createFarm, getFarmById};