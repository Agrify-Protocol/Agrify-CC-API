const express = require('express');

const {
    investInNature, 
    getAllInvestors,
    getInvestorById 
} = require('../controllers/investor.controller');

const router = express.Router();

router.post('/invest', investInNature);
router.get('/investors/:id', getInvestorById);
router.get('/investors', getAllInvestors);

module.exports = router;