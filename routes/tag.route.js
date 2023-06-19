const express = require('express');

const {createTag} = require('../controllers/tag.controller');
const router = express.Router();

router.post('/tags', createTag);
module.exports = router;