const express = require('express');

const {createProject} = require('../controllers/project.controller');

const router = express.Router();


router.post('/projects', createProject);

module.exports = router;