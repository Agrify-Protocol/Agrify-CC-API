const express = require('express');

const {createProject, getProjectById, getProjects} = require('../controllers/project.controller');

const router = express.Router();


router.get('/projects', getProjects);
router.post('/projects', createProject);
router.get('/projects/:id', getProjectById);

module.exports = router;