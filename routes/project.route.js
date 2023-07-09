const express = require('express');
const upload = require('../utils/multer');

const {createProject, getProjectById, getProjects} = require('../controllers/project.controller');

const router = express.Router();


router.get('/projects', getProjects);
router.post('/projects',upload.fields([
    {name: "images",maxCount: 8},
    {name: "cover", maxCount: 1},
    {name: 'supdoc',maxCount: 1}
]), createProject);
router.get('/projects/:id', getProjectById);

module.exports = router;