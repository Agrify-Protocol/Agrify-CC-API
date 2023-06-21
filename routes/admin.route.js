const express = require('express');
const {getAllUsers} = require('../controllers/admin.controller');
const adminMiddleware = require('../middleware/admin.middleware');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.get('/users', authMiddleware, adminMiddleware, getAllUsers);

module.exports = router;