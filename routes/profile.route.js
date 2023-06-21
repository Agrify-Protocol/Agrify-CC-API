const express = require('express');
const {profile} = require('../controllers/profile.controller');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

router.get('/profile', authMiddleware, profile);

module.exports = router;