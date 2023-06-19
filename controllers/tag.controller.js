const Tag = require('../models/tag.model');

const createTag = async(req, res) => {
    try {
        const tag = await Tag.create(req.body);
        res.status(201).json(tag);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {createTag}