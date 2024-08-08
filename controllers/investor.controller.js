const Investor = require('../models/investor.model');

const getInvestorById = async (req, res) => {
    const { id } = req.params;
    try {
        const investor = await Investor.findById(id);
        if (!investor) {
            return res.status(404).json({ message: `User with ID: ${id} not found!` });
        }
        return res.status(200).json(investor);
    } catch (error) {
        console.log(error);
    }
}

const getAllInvestors = async (req, res) => {
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
        const investors = await Investor.find({})
            .sort(sortCriteria)
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Investor.countDocuments();
        const totalPages = Math.ceil(total / limit);

        const nextPage = page < totalPages ? page + 1 : null;
        const prevPage = page < 1 ? page - 1 : null;

        res
            .status(200)
            .json({ investors, total, page, totalPages, nextPage, prevPage });

    } catch (error) {
        console.log(error);
    }
}

const investInNature = async (req, res) => {
    try {

        const investor = await Investor.create(req.body);

        await investor.save();
        res.status(201).json({status: "Successful", message: "Submitted successfully", investor});
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    investInNature, 
    getAllInvestors,
    getInvestorById 
};