const Project = require('../models/project.model');

const createProject = async (req, res) => {
    try {
        const project = await Project.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {createProject};