const express = require('express');
const upload = require('../utils/multer');

const {createProject, getProjectById, getProjects} = require('../controllers/project.controller');

const router = express.Router();


router.get('/projects', getProjects);
router.post('/projects', upload.array('images'), createProject);
router.get('/projects/:id', getProjectById);

module.exports = router;