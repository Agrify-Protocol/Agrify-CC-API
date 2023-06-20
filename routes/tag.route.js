const express = require('express');
const upload = require('../utils/multer');

const {createTag, getTags, getTagById} = require('../controllers/tag.controller');
const router = express.Router();

router.get('/tags', getTags);
router.post('/tags', upload.single('image'), createTag);
router.get('/tags/:id', getTagById);

module.exports = router;