const express = require('express');
const authMiddleware = require('../middleware/auth');

const {createFarm, getFarmById, getMyFarm} = require('../controllers/farm.controller');

const router = express.Router();


// router.get('/farm', getProjects);
router.post('/farm', authMiddleware, createFarm);
router.get('/farm/:id', authMiddleware, getFarmById);
router.get('/farm', authMiddleware, getMyFarm);

module.exports = router;