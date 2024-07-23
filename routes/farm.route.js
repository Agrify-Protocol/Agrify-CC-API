const express = require('express');
const authMiddleware = require('../middleware/auth');
const upload = require("../utils/multer");

const {createFarm, deleteFarmUnsafe, createFarmUnsafe, updateFarmUnsafe, getFarmById, getFarmByFarmerId, getAllFarms, addImageToGallery, addProjectMilestones} = require('../controllers/farm.controller');

const router = express.Router();


// router.get('/farm', getProjects);
router.post('/farm', authMiddleware,
    upload.fields([
        { name: "images"},
        { name: "docs", maxCount: 8 },
    ]),
    createFarm);
router.post('/ufarm', authMiddleware,
    upload.fields([
        { name: "images"},
        { name: "docs", maxCount: 8 },
    ]),
    createFarmUnsafe);
router.get('/farm/:id', authMiddleware, getFarmById);
router.delete('/farm/:id', authMiddleware, deleteFarmUnsafe);
router.put('/farm/:farmID/milestones', authMiddleware, addProjectMilestones);
router.put('/ufarm/:farmID', authMiddleware, updateFarmUnsafe);
router.put('/farm/:farmID', authMiddleware, 
upload.fields([
    { name: "image" },
]),
addImageToGallery);
router.get('/farm', authMiddleware, getAllFarms);
router.get('/farm/get-by-farmer/:farmerId', getFarmByFarmerId);

module.exports = router;