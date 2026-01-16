const express = require('express');
const router = express.Router();
const {
  getCurrentConfig,
  getDisplayPlaylist,
  getNextMedia,
  getSystemStatus,
} = require('../controllers/displayController');

// 取得目前播放配置
router.get('/current-config', getCurrentConfig);

// 取得展示播放清單
router.get('/playlist', getDisplayPlaylist);

// 取得下一個媒體
router.get('/next-media', getNextMedia);

// 取得系統狀態
router.get('/status', getSystemStatus);

module.exports = router;