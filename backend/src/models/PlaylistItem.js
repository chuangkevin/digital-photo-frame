const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PlaylistItem = sequelize.define('PlaylistItem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    configId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'playback_config',
        key: 'id'
      }
    },
    mediaId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'media_files',
        key: 'id'
      }
    },
    playOrder: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  }, {
    tableName: 'playlist_items',
    indexes: [
      {
        fields: ['configId']
      },
      {
        fields: ['mediaId']
      },
      {
        fields: ['configId', 'playOrder']
      }
    ]
  });

  // 定義關聯
  PlaylistItem.associate = (models) => {
    // 播放清單項目屬於一個配置
    PlaylistItem.belongsTo(models.PlaybackConfig, {
      foreignKey: 'configId',
      as: 'config'
    });

    // 播放清單項目屬於一個媒體檔案
    PlaylistItem.belongsTo(models.MediaFile, {
      foreignKey: 'mediaId',
      as: 'mediaFile'
    });
  };

  return PlaylistItem;
};