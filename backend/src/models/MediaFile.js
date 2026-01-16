const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MediaFile = sequelize.define('MediaFile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    filename: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    originalName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    filePath: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    thumbnailPath: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fileType: {
      type: DataTypes.ENUM('image', 'video', 'audio'),
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    fileSize: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // 影片/音訊長度(秒)
      allowNull: true,
    },
    uploadTime: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    tags: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  }, {
    tableName: 'media_files',
    indexes: [
      {
        fields: ['fileType']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['uploadTime']
      }
    ]
  });

  // 定義關聯
  MediaFile.associate = (models) => {
    // 一個媒體檔案可以在多個播放清單中
    MediaFile.hasMany(models.PlaylistItem, {
      foreignKey: 'mediaId',
      as: 'playlistItems'
    });
  };

  return MediaFile;
};