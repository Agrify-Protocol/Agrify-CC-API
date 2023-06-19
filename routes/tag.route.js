const express = require('express');
const upload = require('../utils/multer');

const {createTag} = require('../controllers/tag.controller');
const router = express.Router();

router.post('/tags', upload.single('image'), createTag);
module.exports = router;