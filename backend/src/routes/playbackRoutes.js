const express = require('express');
const router = express.Router();
const {
  getPlaybackConfigs,
  getPlaybackConfigById,
  createPlaybackConfig,
  updatePlaybackConfig,
  activatePlaybackConfig,
  deletePlaybackConfig,
  getActivePlaybackConfig,
} = require('../controllers/playbackController');

// 取得所有播放配置
router.get('/configs', getPlaybackConfigs);

// 取得目前啟用的播放配置
router.get('/configs/active', getActivePlaybackConfig);

// 取得單一播放配置
router.get('/configs/:id', getPlaybackConfigById);

// 建立新的播放配置
router.post('/configs', createPlaybackConfig);

// 更新播放配置
router.put('/configs/:id', updatePlaybackConfig);

// 啟用播放配置
router.put('/configs/:id/activate', activatePlaybackConfig);

// 刪除播放配置
router.delete('/configs/:id', deletePlaybackConfig);

module.exports = router;