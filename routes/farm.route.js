const express = require('express');
const authMiddleware = require('../middleware/auth');

const {createFarm, getFarmById} = require('../controllers/farm.controller');

const router = express.Router();


// router.get('/farm', getProjects);
router.post('/farm', authMiddleware, createFarm);
router.get('/farm/:id', authMiddleware, getFarmById);

module.exports = router;