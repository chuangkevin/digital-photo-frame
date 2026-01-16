const express = require('express');
const router = express.Router();

const mediaRoutes = require('./mediaRoutes');
const playbackRoutes = require('./playbackRoutes');
const playlistRoutes = require('./playlistRoutes');
const displayRoutes = require('./displayRoutes');
const fileRoutes = require('./fileRoutes');
const thumbnailRoutes = require('./thumbnailRoutes');

// API 路由
router.use('/media', mediaRoutes);
router.use('/playback', playbackRoutes);
router.use('/playlist', playlistRoutes);
router.use('/display', displayRoutes);

// 檔案服務路由
router.use('/files', fileRoutes);
router.use('/thumbnails', thumbnailRoutes);

// API 根路徑資訊
router.get('/', (req, res) => {
  res.json({
    name: '數位相框 API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      media: '/api/media',
      playback: '/api/playback',
      playlist: '/api/playlist',
      display: '/api/display',
      files: '/api/files',
      thumbnails: '/api/thumbnails'
    },
    documentation: 'https://github.com/yourproject/api-docs'
  });
});

module.exports = router;