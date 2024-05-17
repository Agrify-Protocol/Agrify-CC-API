const express = require('express');

const addUsertoWaitlist = require('../controllers/waitlist.controller');
const router = express.Router();

router.post('/waitlist', addUsertoWaitlist);

module.exports = router;