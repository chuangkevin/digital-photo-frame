const { PlaybackConfig, PlaylistItem, MediaFile } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * 取得目前播放配置（展示頁面用）
 */
const getCurrentConfig = asyncHandler(async (req, res) => {
  const config = await PlaybackConfig.findOne({
    where: { isActive: true },
    include: [{
      model: PlaylistItem,
      as: 'playlistItems',
      include: [{
        model: MediaFile,
        as: 'mediaFile',
        where: { isActive: true },
        required: false
      }],
      order: [['playOrder', 'ASC']]
    }]
  });

  if (!config) {
    // 如果沒有啟用的配置，回傳預設設定
    return res.json({
      data: {
        modeType: 'library_sequence',
        name: '預設模式',
        imageDisplayDuration: 5,
        videoLoop: true,
        audioLoop: true,
        sequenceRandom: false,
        playlistItems: []
      }
    });
  }

  res.json({ data: config });
});

/**
 * 取得展示播放清單
 */
const getDisplayPlaylist = asyncHandler(async (req, res) => {
  const config = await PlaybackConfig.findOne({
    where: { isActive: true }
  });

  let mediaFiles = [];

  if (!config) {
    // 沒有配置時，取得所有媒體檔案
    mediaFiles = await MediaFile.findAll({
      where: { isActive: true },
      order: [['uploadTime', 'DESC']]
    });
  } else if (config.modeType === 'fixed_media') {
    // 固定媒體模式：取得播放清單中的媒體
    const playlistItems = await PlaylistItem.findAll({
      where: { configId: config.id },
      include: [{
        model: MediaFile,
        as: 'mediaFile',
        where: { isActive: true },
        required: true
      }],
      order: config.sequenceRandom ?
        [['playOrder', 'ASC']] : // 先按順序排列，隨機在前端處理
        [['playOrder', 'ASC']]
    });

    mediaFiles = playlistItems.map(item => item.mediaFile);
  } else if (config.modeType === 'library_sequence') {
    // 媒體庫循序模式：取得所有媒體檔案
    const order = config.sequenceRandom ?
      [['uploadTime', 'DESC']] : // 先按時間排序，隨機在前端處理
      [['uploadTime', 'DESC']];

    mediaFiles = await MediaFile.findAll({
      where: { isActive: true },
      order
    });
  }

  // 如果設定為隨機播放，在這裡打亂順序
  if (config?.sequenceRandom) {
    mediaFiles = shuffleArray(mediaFiles);
  }

  res.json({
    data: {
      config: config || {
        modeType: 'library_sequence',
        imageDisplayDuration: 5,
        videoLoop: true,
        audioLoop: true,
        sequenceRandom: false
      },
      mediaFiles
    }
  });
});

/**
 * 取得下一個媒體（可用於預載）
 */
const getNextMedia = asyncHandler(async (req, res) => {
  const { currentMediaId } = req.query;

  if (!currentMediaId) {
    return res.status(400).json({
      error: '缺少參數',
      message: '請提供 currentMediaId'
    });
  }

  const config = await PlaybackConfig.findOne({
    where: { isActive: true }
  });

  let nextMedia = null;

  if (!config || config.modeType === 'library_sequence') {
    // 庫存循序模式或無配置：取得下一個時間順序的媒體
    nextMedia = await MediaFile.findOne({
      where: {
        isActive: true,
        id: { [require('sequelize').Op.gt]: currentMediaId }
      },
      order: [['uploadTime', 'ASC']],
      limit: 1
    });

    // 如果沒找到，回到第一個
    if (!nextMedia) {
      nextMedia = await MediaFile.findOne({
        where: { isActive: true },
        order: [['uploadTime', 'ASC']],
        limit: 1
      });
    }
  } else if (config.modeType === 'fixed_media') {
    // 固定媒體模式：取得播放清單中的下一個
    const currentItem = await PlaylistItem.findOne({
      where: {
        configId: config.id,
        mediaId: currentMediaId
      }
    });

    if (currentItem) {
      const nextItem = await PlaylistItem.findOne({
        where: {
          configId: config.id,
          playOrder: { [require('sequelize').Op.gt]: currentItem.playOrder }
        },
        include: [{
          model: MediaFile,
          as: 'mediaFile',
          where: { isActive: true },
          required: true
        }],
        order: [['playOrder', 'ASC']],
        limit: 1
      });

      if (nextItem) {
        nextMedia = nextItem.mediaFile;
      } else {
        // 回到第一個
        const firstItem = await PlaylistItem.findOne({
          where: { configId: config.id },
          include: [{
            model: MediaFile,
            as: 'mediaFile',
            where: { isActive: true },
            required: true
          }],
          order: [['playOrder', 'ASC']],
          limit: 1
        });

        nextMedia = firstItem?.mediaFile || null;
      }
    }
  }

  if (!nextMedia) {
    return res.status(404).json({
      error: '沒有下一個媒體',
      message: '找不到下一個媒體檔案'
    });
  }

  res.json({ data: nextMedia });
});

/**
 * 取得系統狀態
 */
const getSystemStatus = asyncHandler(async (req, res) => {
  const mediaCount = await MediaFile.count({
    where: { isActive: true }
  });

  const imageCount = await MediaFile.count({
    where: { isActive: true, fileType: 'image' }
  });

  const videoCount = await MediaFile.count({
    where: { isActive: true, fileType: 'video' }
  });

  const audioCount = await MediaFile.count({
    where: { isActive: true, fileType: 'audio' }
  });

  const configCount = await PlaybackConfig.count();

  const activeConfig = await PlaybackConfig.findOne({
    where: { isActive: true },
    attributes: ['id', 'name', 'modeType']
  });

  res.json({
    data: {
      mediaCount,
      breakdown: {
        images: imageCount,
        videos: videoCount,
        audios: audioCount
      },
      configCount,
      activeConfig,
      systemTime: new Date().toISOString()
    }
  });
});

/**
 * 陣列隨機排序工具函數
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

module.exports = {
  getCurrentConfig,
  getDisplayPlaylist,
  getNextMedia,
  getSystemStatus,
};