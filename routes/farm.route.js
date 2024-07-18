const express = require('express');
const authMiddleware = require('../middleware/auth');
const upload = require("../utils/multer");

const {createFarm, getFarmById, getFarmByFarmerId, getAllFarms, addImageToGallery, addProjectMilestones} = require('../controllers/farm.controller');

const router = express.Router();


// router.get('/farm', getProjects);
router.post('/farm', authMiddleware,
    upload.fields([
        { name: "images"},
        { name: "docs", maxCount: 8 },
    ]),
    createFarm);
router.get('/farm/:id', authMiddleware, getFarmById);
router.put('/farm/:farmID/milestones', authMiddleware, addProjectMilestones);
router.put('/farm/:farmID', authMiddleware, 
upload.fields([
    { name: "image" },
]),
addImageToGallery);
router.get('/farm', authMiddleware, getAllFarms);
router.get('/farm/get-by-farmer/:farmerId', getFarmByFarmerId);

module.exports = router;