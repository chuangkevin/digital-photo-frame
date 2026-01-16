const express = require('express');
const router = express.Router();
const { serveMedia, serveThumbnail } = require('../controllers/mediaController');

// 提供媒體檔案
router.get('/:filename', serveMedia);

module.exports = router;