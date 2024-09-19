const Claim = require('../models/carbonIncomeClaim.model');
const MrvUser = require('../models/mrv_user.model');
const Farm = require('../models/farm.model');
const cloudinary = require("../utils/cloudinary.js");

const getClaimByFarmerId = async (req, res) => {
    const { id } = req.params;
    try {
        const farmer = await MrvUser.findById(id);
        if (!farmer) {
            return res.status(404).json({ message: `User with ID: ${id} not found!` });
        }
        const claim = await Claim.find({
            farmer: id,
          }).sort({
            createdAt: -1,
          });
      
        return res.status(200).json(claim);
    } catch (error) {
        console.log(error);
    }
}

const getAllClaims = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const sortBy = req.query.sortBy || "latest";

        let sortCriteria;
        if (sortBy === "latest") {
            sortCriteria = { _id: -1 };
        } else if (sortBy === "oldest") {
            sortCriteria = { _id: 1 };
        } else {
            sortCriteria = {};
        }

        const skip = (page - 1) * limit;
        const claims = await Claim.find({})
            .sort(sortCriteria)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Claim.countDocuments();
        const totalPages = Math.ceil(total / limit);

        const nextPage = page < totalPages ? page + 1 : null;
        const prevPage = page < 1 ? page - 1 : null;

        res
            .status(200)
            .json({ claims, total, page, totalPages, nextPage, prevPage });

    } catch (error) {
        console.log(error);
    }
}

const submitClaim = async (req, res) => {
    try {
        const farmerID = req.userId;
        const farm = await Farm.findOne({ farmer: farmerID });
        const farmID = farm.id;

        let farmDocs = [];
        if (req.files) {
            for (const file of req.files.docs) {
                const uploadResult = await cloudinary.v2.uploader.upload(file.path);
                farmDocs.push(uploadResult.secure_url);
            }
        }

        const {
            wasteDisposalDescription,
            fertilizer,
        } = req.body;

        const claim = await Claim.create({
            farmer: farmerID,
            farm: farmID,
            wasteDisposalDescription,
            fertilizer,
            farmDocs,
        });

        await claim.save();
        res.status(201).json({status: "Successful", message: "Submitted successfully", claim});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    submitClaim, 
    getAllClaims,
    getClaimByFarmerId 
};