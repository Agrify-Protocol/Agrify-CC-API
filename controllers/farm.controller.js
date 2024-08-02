const Farm = require("../models/farm.model");
const MrvUser = require('../models/mrv_user.model');
const authMiddleWare = require("../middleware/auth")
const mongoose = require("mongoose");
const cloudinary = require("../utils/cloudinary.js");
const axios = require("axios");

const getFarmById = async (req, res) => {
    const { id } = req.params;
    try {
        const farm = await Farm.findById(id).populate({ path: "farmSuggestion" }).populate({ path: "soilData" });
        if (!farm) {
            return res.status(404).json({ message: `Farm with ID: ${id} not found!` });
        }
        return res.status(200).json(farm);
    } catch (error) {
        console.log(error);
    }
}

const deleteFarmUnsafe = async (req, res) => {
    const { id } = req.params;
    try {
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({ message: `Farm with ID: ${id} not found!` });
        }
        await farm.deleteOne();
        return res.status(200).json({ message: "Deleted" });
    } catch (error) {
        console.log(error);
    }
}

const updateFarmUnsafe = async (req, res) => {
    const { id } = req.params;
    try {
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({ message: `Farm with ID: ${id} not found!` });
        }
        const { description, cultivationType } = req.body;

        farm.description = description;
        farm.cultivationType = cultivationType;
        await farm.save();
        return res.status(200).json(farm);
    } catch (error) {
        console.log(error);
    }
}

const updatePreferredLanguage = async (req, res) => {
    const { id } = req.params;
    try {
        const farm = await Farm.findById(id);
        if (!farm) {
            return res.status(404).json({ message: `Farm with ID: ${id} not found!` });
        }
        const { language } = req.body;

        const preferredLanguage = language.toLowerCase().trim();

        if (!['english', 'swahili', 'pidgin'].includes(preferredLanguage)){
            return res.status(400).json({ message: "Invalid request" });
        }

        farm.preferredLanguage = preferredLanguage;
        await farm.save();
        return res.status(200).json({ success: true, preferredLanguage: preferredLanguage });

    } catch (error) {
        console.log(error);
    }
}

const addImageToGallery = async (req, res) => {
    const { farmID } = req.params;

    try {
        const farm = await Farm.findById(farmID);
        if (!farm) {
            return res.status(404).json({ message: `Farm with ID: ${farmID} not found!` });
        }
        let image = {};
        const { description } = req.body;
        if (req.files) {
            const imageArray = req.files.image;
            if (imageArray.length > 1) {
                return res.status(400).json({ message: `Upload one image at a time!` });
            }
            const file = req.files.image[0];
            const uploadResult = await cloudinary.v2.uploader.upload(file.path);
            image.image = uploadResult.secure_url;
            image.description = description;
            farm.farmImages.push(image);
            await farm.save();
            return res.status(200).json(farm);
        }

        return res.status(500).json({ error: "Something went wrong" });
    } catch (error) {
        console.log(error);
    }
}

const calculateCarbonOnFarm = async (req, res) => {

    try {
        const farmerId = req.userId;

        const farmer = await MrvUser.findById(farmerId);
        if (!farmer) {
            return res.status(404).json({ message: `Farmer does not exist with ID ${farmerId}` });
        }

        const farm = await Farm.findOne({ farmer: farmer._id }, null, { sort: {createdAt: -1}}).select(
            ["name", "state", "country", "category", "lat", "long", "area", "availableTonnes"]
        );

        if (!farm) {
            return res.status(404).json({ message: `No farm found for farmer ID ${farmerId}` });
        }

        let carbon = null;
        const { electricity, distance, waste, meal, country } = req.body;

        await axios.post(
            "https://seal-app-bi5ac.ondigitalocean.app/calc_carbon",
            {
                electricity: parseFloat(electricity),
                distance: parseFloat(distance),
                waste: parseFloat(waste),
                meal: parseFloat(meal),
                country
            }
        )
            .then((response) => {
                if (response.status == '201') {
                    if (response.data) {
                        console.log(response.data)
                        if (response.data.success == "true") {
                            carbon = parseFloat(response.data.total_emissions);
                        }
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: "Unable to get carbon emissions" });
            });

        if (carbon) {
            farm.availableTonnes = carbon;
            await farm.save();
            return res.status(200).json(farm);

        }


    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });

    }
}

const calculateCarbon = async (req, res) => {

    try {

        const { electricity, distance, waste, meal, country } = req.body;

        await axios.post(
            "https://seal-app-bi5ac.ondigitalocean.app/calc_carbon",
            {
                electricity: parseFloat(electricity),
                distance: parseFloat(distance),
                waste: parseFloat(waste),
                meal: parseFloat(meal),
                country
            }
        )
            .then((response) => {
                if (response.status == '201') {
                    if (response.data) {
                        if (response.data.success == "true") {
                            return res.status(200).json(response.data);
                        }
                    }
                }
            })
            .catch((error) => {
                console.log(error);
                return res.status(500).json({ error: "Unable to get carbon emissions" });
            });


    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "Something went wrong" });

    }
}

const addProjectMilestones = async (req, res) => {
    const { farmID } = req.params;

    try {
        const farm = await Farm.findById(farmID);
        if (!farm) {
            return res.status(404).json({ message: `Farm with ID: ${farmID} not found!` });
        }
        // const { title, funding, duration } = req.body;
        farm.milestones.push(req.body);
        await farm.save();
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
        const mrvUser = await MrvUser.findById(req.userId);
        if (!mrvUser) {
            return res.status(404).json({ message: `User does not have an MRV account!` });
        }

        if (mrvUser.farmID) {
            const farm = await Farm.findById(mrvUser.farmID);
            if (farm)
                return res.status(400).json({ message: `User already has a farm!` });
        }

        let image = {};
        let farmDocs = [];
        let farmImages = [];
        if (req.files) {
            for (const file of req.files.images) {
                const uploadResult = await cloudinary.v2.uploader.upload(file.path);
                image.image = uploadResult.secure_url;
                farmImages.push(image);
            }
            for (const file of req.files.docs) {
                const uploadResult = await cloudinary.v2.uploader.upload(file.path);
                farmDocs.push(uploadResult.secure_url);
            }
        }

        const {
            name, description, cultivationType, country, address, city, state, preferredLanguage, latitude, longitude, area, category
        } = req.body;

        // //TODO: Geolocation API
        const farmLocation = "";

        const cat = category.toLowerCase();

        const farm = await Farm.create({
            name, description, cultivationType, country: country == "NG" ? "Nigeria" : country, address, city, state, preferredLanguage, farmImages, farmDocs, category: cat, farmer: mrvUser, lat: latitude, long: longitude, area
        });

        await farm.save();
        mrvUser.farmID = farm._id;
        await mrvUser.save();
        res.status(201).json(farm);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

const createFarmUnsafe = async (req, res) => {
    try {
        // find user in MRV Model
        const mrvUser = await MrvUser.findById(req.userId);
        if (!mrvUser) {
            return res.status(404).json({ message: `User does not have an MRV account!` });
        }

        let image = {};
        let farmDocs = [];
        let farmImages = [];
        if (req.files) {
            for (const file of req.files.images) {
                const uploadResult = await cloudinary.v2.uploader.upload(file.path);
                image.image = uploadResult.secure_url;
                farmImages.push(image);
            }
            for (const file of req.files.docs) {
                const uploadResult = await cloudinary.v2.uploader.upload(file.path);
                farmDocs.push(uploadResult.secure_url);
            }
        }

        const {
            name, description, cultivationType, country, address, city, state, preferredLanguage, latitude, longitude, area, category
        } = req.body;

        // //TODO: Geolocation API
        const farmLocation = "";

        const cat = category.toLowerCase();

        const farm = await Farm.create({
            name, description, cultivationType, country: country == "NG" ? "Nigeria" : country, address, city, state, preferredLanguage, farmImages, farmDocs, category: cat, farmer: mrvUser, lat: latitude, long: longitude, area
        });

        await farm.save();
        mrvUser.farmID = farm._id;
        await mrvUser.save();
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

        // Find farms by farmer ID
        const farm = await Farm.find({ farmer: farmer._id }).select(
            ["name", "state", "country", "category", "lat", "long", "area", "availableTonnes"]
        );
        if (farm.length == 0) {
            return res.status(404).json({ message: `No farm found for farmer ID ${farmerId}` });
        }
        // result = {farmerId: farmerId, farmName: farm.name, farmLocation: farm.country, category: farm.category, latitude: farm.lat ? farm.lat :'', longitude: farm.long ? farm.long : '', area: farm.area ? farm.area : ''};
        return res.status(200).json({ data: farm });
    } catch (error) {
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
};



module.exports = { 
    createFarm, 
    createFarmUnsafe,
    deleteFarmUnsafe, 
    updateFarmUnsafe, 
    getFarmById, 
    getFarmByFarmerId, 
    getAllFarms, 
    addImageToGallery, 
    addProjectMilestones, 
    calculateCarbon, 
    calculateCarbonOnFarm,
    updatePreferredLanguage };