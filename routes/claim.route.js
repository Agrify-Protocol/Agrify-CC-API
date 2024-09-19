const express = require('express');
const authMiddleWare = require("../middleware/auth");
const upload = require("../utils/multer");


const {
    submitClaim, 
    getAllClaims,
    getClaimByFarmerId
} = require('../controllers/incomeClaim.controller');

const router = express.Router();

router.post('/claims', authMiddleWare, 
    upload.fields([
        { name: "docs", maxCount: 8 },
    ]),
submitClaim);
router.get('/claims/get-by-farmer/:id', getClaimByFarmerId);
router.get('/claims', getAllClaims);

module.exports = router;