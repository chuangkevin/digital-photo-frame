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
    nightModeEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: '是否啟用夜間模式',
    },
    nightModeStartTime: {
      type: DataTypes.STRING(5),
      defaultValue: '22:00',
      comment: '夜間模式開始時間 (HH:MM)',
    },
    nightModeEndTime: {
      type: DataTypes.STRING(5),
      defaultValue: '07:00',
      comment: '夜間模式結束時間 (HH:MM)',
    },
    nightModeBrightness: {
      type: DataTypes.INTEGER,
      defaultValue: 30,
      validate: {
        min: 10,
        max: 100,
      },
      comment: '夜間模式亮度 (10-100)',
    },
    dayBrightness: {
      type: DataTypes.INTEGER,
      defaultValue: 100,
      validate: {
        min: 10,
        max: 100,
      },
      comment: '日間模式亮度 (10-100)',
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