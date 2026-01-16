const { PlaylistItem, MediaFile, PlaybackConfig } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * 取得指定配置的播放清單
 */
const getPlaylist = asyncHandler(async (req, res) => {
  const { configId } = req.params;

  const config = await PlaybackConfig.findByPk(configId);
  if (!config) {
    return res.status(404).json({
      error: '配置未找到',
      message: '指定的播放配置不存在'
    });
  }

  const playlistItems = await PlaylistItem.findAll({
    where: { configId },
    include: [{
      model: MediaFile,
      as: 'mediaFile',
      where: { isActive: true },
      required: true
    }],
    order: [['playOrder', 'ASC']]
  });

  res.json({ data: playlistItems });
});

/**
 * 新增媒體到播放清單
 */
const addToPlaylist = asyncHandler(async (req, res) => {
  const { configId } = req.params;
  const { mediaIds } = req.body;

  if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
    return res.status(400).json({
      error: '無效的媒體ID',
      message: 'mediaIds 必須是非空陣列'
    });
  }

  // 檢查配置是否存在
  const config = await PlaybackConfig.findByPk(configId);
  if (!config) {
    return res.status(404).json({
      error: '配置未找到',
      message: '指定的播放配置不存在'
    });
  }

  // 檢查媒體檔案是否存在
  const mediaFiles = await MediaFile.findAll({
    where: {
      id: mediaIds,
      isActive: true
    }
  });

  if (mediaFiles.length !== mediaIds.length) {
    return res.status(400).json({
      error: '媒體檔案不存在',
      message: '部分媒體檔案不存在或已刪除'
    });
  }

  // 取得目前最大的播放順序
  const maxOrder = await PlaylistItem.max('playOrder', {
    where: { configId }
  }) || 0;

  // 建立播放清單項目
  const playlistItems = [];
  for (let i = 0; i < mediaIds.length; i++) {
    playlistItems.push({
      configId: parseInt(configId),
      mediaId: mediaIds[i],
      playOrder: maxOrder + i + 1
    });
  }

  const created = await PlaylistItem.bulkCreate(playlistItems);

  // 取得完整的播放清單項目（包含媒體檔案資訊）
  const createdItems = await PlaylistItem.findAll({
    where: {
      id: created.map(item => item.id)
    },
    include: [{
      model: MediaFile,
      as: 'mediaFile'
    }]
  });

  res.status(201).json({
    message: '媒體已加入播放清單',
    data: createdItems
  });
});

/**
 * 從播放清單移除媒體
 */
const removeFromPlaylist = asyncHandler(async (req, res) => {
  const { configId, itemId } = req.params;

  const playlistItem = await PlaylistItem.findOne({
    where: {
      id: itemId,
      configId
    }
  });

  if (!playlistItem) {
    return res.status(404).json({
      error: '播放清單項目未找到',
      message: '指定的播放清單項目不存在'
    });
  }

  await playlistItem.destroy();

  res.json({
    message: '已從播放清單移除'
  });
});

/**
 * 重新排序播放清單
 */
const reorderPlaylist = asyncHandler(async (req, res) => {
  const { configId } = req.params;
  const { itemOrders } = req.body;

  if (!Array.isArray(itemOrders)) {
    return res.status(400).json({
      error: '無效的排序資料',
      message: 'itemOrders 必須是陣列'
    });
  }

  // 檢查配置是否存在
  const config = await PlaybackConfig.findByPk(configId);
  if (!config) {
    return res.status(404).json({
      error: '配置未找到',
      message: '指定的播放配置不存在'
    });
  }

  // 批次更新播放順序
  const updatePromises = itemOrders.map(({ itemId, playOrder }) => {
    return PlaylistItem.update(
      { playOrder },
      {
        where: {
          id: itemId,
          configId
        }
      }
    );
  });

  await Promise.all(updatePromises);

  // 取得更新後的播放清單
  const updatedPlaylist = await PlaylistItem.findAll({
    where: { configId },
    include: [{
      model: MediaFile,
      as: 'mediaFile',
      where: { isActive: true },
      required: true
    }],
    order: [['playOrder', 'ASC']]
  });

  res.json({
    message: '播放清單排序更新成功',
    data: updatedPlaylist
  });
});

/**
 * 清空播放清單
 */
const clearPlaylist = asyncHandler(async (req, res) => {
  const { configId } = req.params;

  // 檢查配置是否存在
  const config = await PlaybackConfig.findByPk(configId);
  if (!config) {
    return res.status(404).json({
      error: '配置未找到',
      message: '指定的播放配置不存在'
    });
  }

  await PlaylistItem.destroy({
    where: { configId }
  });

  res.json({
    message: '播放清單已清空'
  });
});

module.exports = {
  getPlaylist,
  addToPlaylist,
  removeFromPlaylist,
  reorderPlaylist,
  clearPlaylist,
};