const express = require('express');
const authMiddleware = require('../middleware/auth');

const {createFarm, getFarmById, getFarmByFarmerId, getAllFarms} = require('../controllers/farm.controller');

const router = express.Router();


// router.get('/farm', getProjects);
router.post('/farm', authMiddleware, createFarm);
router.get('/farm/:id', authMiddleware, getFarmById);
router.get('/farm', authMiddleware, getAllFarms);
router.get('/farm/get-by-farmer/:farmerId', getFarmByFarmerId);

module.exports = router;