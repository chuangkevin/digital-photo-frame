const express = require('express');
const router = express.Router();
const { upload, handleUploadError } = require('../middleware/upload');
const {
  uploadMedia,
  getMediaList,
  getMediaById,
  updateMedia,
  deleteMedia,
  serveMedia,
  serveThumbnail,
} = require('../controllers/mediaController');

// 上傳媒體檔案
router.post('/upload', upload.single('media'), handleUploadError, uploadMedia);

// 取得媒體列表
router.get('/', getMediaList);

// 取得單一媒體檔案資訊
router.get('/:id', getMediaById);

// 更新媒體檔案資訊
router.put('/:id', updateMedia);

// 刪除媒體檔案
router.delete('/:id', deleteMedia);

module.exports = router;