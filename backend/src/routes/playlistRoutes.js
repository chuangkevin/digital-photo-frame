const express = require('express');
const router = express.Router();
const {
  getPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  reorderPlaylist,
  clearPlaylist,
} = require('../controllers/playlistController');

// 取得指定配置的播放清單
router.get('/:configId', getPlaylist);

// 新增媒體到播放清單
router.post('/:configId/items', addToPlaylist);

// 從播放清單移除媒體
router.delete('/:configId/items/:itemId', removeFromPlaylist);

// 重新排序播放清單
router.put('/:configId/reorder', reorderPlaylist);

// 清空播放清單
router.delete('/:configId', clearPlaylist);

module.exports = router;