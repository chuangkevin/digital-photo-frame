const { PlaybackConfig, PlaylistItem, MediaFile } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');
const { emitToDisplay, emitToAll, SocketEvents } = require('../services/socketService');

/**
 * 取得所有播放配置
 */
const getPlaybackConfigs = asyncHandler(async (req, res) => {
  const configs = await PlaybackConfig.findAll({
    order: [['createdTime', 'DESC']],
    include: [{
      model: PlaylistItem,
      as: 'playlistItems',
      include: [{
        model: MediaFile,
        as: 'mediaFile',
        where: { isActive: true },
        required: false
      }]
    }]
  });

  res.json({ data: configs });
});

/**
 * 取得單一播放配置
 */
const getPlaybackConfigById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const config = await PlaybackConfig.findByPk(id, {
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
    return res.status(404).json({
      error: '配置未找到',
      message: '指定的播放配置不存在'
    });
  }

  res.json({ data: config });
});

/**
 * 建立新的播放配置
 */
const createPlaybackConfig = asyncHandler(async (req, res) => {
  const {
    modeType,
    name,
    imageDisplayDuration = 5,
    videoLoop = true,
    audioLoop = true,
    sequenceRandom = false
  } = req.body;

  // 驗證必要欄位
  if (!modeType || !name) {
    return res.status(400).json({
      error: '缺少必要欄位',
      message: 'modeType 和 name 為必要欄位'
    });
  }

  if (!['fixed_media', 'library_sequence'].includes(modeType)) {
    return res.status(400).json({
      error: '無效的模式類型',
      message: 'modeType 必須是 fixed_media 或 library_sequence'
    });
  }

  const config = await PlaybackConfig.create({
    modeType,
    name,
    imageDisplayDuration,
    videoLoop,
    audioLoop,
    sequenceRandom,
    isActive: false
  });

  // 廣播配置建立事件
  emitToAll(SocketEvents.CONFIG_CREATED, { config });

  res.status(201).json({
    message: '播放配置建立成功',
    data: config
  });
});

/**
 * 更新播放配置
 */
const updatePlaybackConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const config = await PlaybackConfig.findByPk(id);

  if (!config) {
    return res.status(404).json({
      error: '配置未找到',
      message: '指定的播放配置不存在'
    });
  }

  // 移除不可更新的欄位
  delete updateData.id;
  delete updateData.isActive;
  delete updateData.createdTime;

  await config.update(updateData);

  // 廣播配置更新事件
  emitToAll(SocketEvents.CONFIG_UPDATED, { config });

  res.json({
    message: '播放配置更新成功',
    data: config
  });
});

/**
 * 啟用播放配置
 */
const activatePlaybackConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const config = await PlaybackConfig.findByPk(id);

  if (!config) {
    return res.status(404).json({
      error: '配置未找到',
      message: '指定的播放配置不存在'
    });
  }

  await config.activate();

  // 廣播配置啟用事件 - 通知展示頁面刷新
  emitToDisplay(SocketEvents.CONFIG_ACTIVATED, { configId: id });
  emitToDisplay(SocketEvents.REFRESH_DISPLAY, {});

  res.json({
    message: '播放配置已啟用',
    data: config
  });
});

/**
 * 刪除播放配置
 */
const deletePlaybackConfig = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const config = await PlaybackConfig.findByPk(id);

  if (!config) {
    return res.status(404).json({
      error: '配置未找到',
      message: '指定的播放配置不存在'
    });
  }

  if (config.isActive) {
    return res.status(400).json({
      error: '無法刪除',
      message: '不能刪除正在使用的播放配置'
    });
  }

  // 刪除相關的播放清單項目
  await PlaylistItem.destroy({
    where: { configId: id }
  });

  // 刪除配置
  await config.destroy();

  // 廣播配置刪除事件
  emitToAll(SocketEvents.CONFIG_DELETED, { configId: id });

  res.json({
    message: '播放配置刪除成功'
  });
});

/**
 * 取得目前啟用的播放配置
 */
const getActivePlaybackConfig = asyncHandler(async (req, res) => {
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
    return res.status(404).json({
      error: '沒有啟用的配置',
      message: '目前沒有啟用的播放配置'
    });
  }

  res.json({ data: config });
});

module.exports = {
  getPlaybackConfigs,
  getPlaybackConfigById,
  createPlaybackConfig,
  updatePlaybackConfig,
  activatePlaybackConfig,
  deletePlaybackConfig,
  getActivePlaybackConfig,
};