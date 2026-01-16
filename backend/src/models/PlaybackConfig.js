const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlaybackConfig = sequelize.define('PlaybackConfig', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    modeType: {
      type: DataTypes.ENUM('fixed_media', 'library_sequence'),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    imageDisplayDuration: {
      type: DataTypes.INTEGER, // 圖片顯示秒數
      defaultValue: 5,
      validate: {
        min: 1,
        max: 60
      }
    },
    videoLoop: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    audioLoop: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    sequenceRandom: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    createdTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'playback_config',
    indexes: [
      {
        fields: ['modeType']
      },
      {
        fields: ['isActive']
      }
    ]
  });

  // 定義關聯
  PlaybackConfig.associate = (models) => {
    // 一個配置可以有多個播放清單項目
    PlaybackConfig.hasMany(models.PlaylistItem, {
      foreignKey: 'configId',
      as: 'playlistItems'
    });
  };

  // 實例方法：啟用此配置（同時停用其他配置）
  PlaybackConfig.prototype.activate = async function() {
    const transaction = await sequelize.transaction();
    try {
      // 停用所有其他配置
      await PlaybackConfig.update(
        { isActive: false },
        { where: {}, transaction }
      );

      // 啟用此配置
      await this.update({ isActive: true }, { transaction });

      await transaction.commit();
      return this;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  };

  return PlaybackConfig;
};