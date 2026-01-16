const express = require('express');
const router = express.Router();
const { serveThumbnail } = require('../controllers/mediaController');

// 提供縮圖檔案
router.get('/:filename', serveThumbnail);

module.exports = router;