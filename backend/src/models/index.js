const { sequelize, testConnection } = require('../config/database');
const MediaFileModel = require('./MediaFile');
const PlaybackConfigModel = require('./PlaybackConfig');
const PlaylistItemModel = require('./PlaylistItem');

// 初始化模型
const MediaFile = MediaFileModel(sequelize);
const PlaybackConfig = PlaybackConfigModel(sequelize);
const PlaylistItem = PlaylistItemModel(sequelize);

// 建立關聯
const models = {
  MediaFile,
  PlaybackConfig,
  PlaylistItem,
};

// 執行關聯設定
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// 同步資料庫
const syncDatabase = async (force = false) => {
  try {
    // 在開發環境使用 alter 來自動調整表結構
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    if (force) {
      await sequelize.sync({ force: true });
      console.log('✅ 資料庫已重建（force: true）');
    } else if (isDevelopment) {
      await sequelize.sync({ alter: true });
      console.log('✅ 資料庫同步完成（開發模式 - alter: true）');
    } else {
      await sequelize.sync({ force: false });
      console.log('✅ 資料庫同步完成（生產模式）');
    }
  } catch (error) {
    console.error('❌ 資料庫同步失敗:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  testConnection,
  models,
  syncDatabase,
  MediaFile,
  PlaybackConfig,
  PlaylistItem,
};