const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');

/**
 * 產生圖片縮圖
 */
const generateThumbnail = async (inputPath, outputPath, size = 300) => {
  try {
    await sharp(inputPath)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('產生縮圖失敗:', error);
    throw error;
  }
};

/**
 * 產生影片縮圖（第一幀）
 * 注意：這裡需要 FFmpeg，在簡化版本中先跳過，使用預設圖片
 */
const generateVideoThumbnail = async (inputPath, outputPath) => {
  try {
    // 簡化實作：使用預設的影片圖標
    const defaultVideoIcon = path.join(__dirname, '../assets/video-icon.jpg');

    if (await fs.pathExists(defaultVideoIcon)) {
      await fs.copy(defaultVideoIcon, outputPath);
    } else {
      // 如果沒有預設圖標，建立一個簡單的佔位圖
      await sharp({
        create: {
          width: 300,
          height: 300,
          channels: 3,
          background: { r: 100, g: 100, b: 100 }
        }
      })
      .jpeg()
      .toFile(outputPath);
    }

    return outputPath;
  } catch (error) {
    console.error('產生影片縮圖失敗:', error);
    throw error;
  }
};

/**
 * 產生音訊縮圖
 */
const generateAudioThumbnail = async (inputPath, outputPath) => {
  try {
    // 使用預設的音訊圖標
    const defaultAudioIcon = path.join(__dirname, '../assets/audio-icon.jpg');

    if (await fs.pathExists(defaultAudioIcon)) {
      await fs.copy(defaultAudioIcon, outputPath);
    } else {
      // 如果沒有預設圖標，建立一個簡單的佔位圖
      await sharp({
        create: {
          width: 300,
          height: 300,
          channels: 3,
          background: { r: 50, g: 100, b: 150 }
        }
      })
      .jpeg()
      .toFile(outputPath);
    }

    return outputPath;
  } catch (error) {
    console.error('產生音訊縮圖失敗:', error);
    throw error;
  }
};

/**
 * 根據檔案類型產生縮圖
 */
const generateThumbnailByType = async (filePath, outputPath, fileType) => {
  try {
    switch (fileType) {
      case 'image':
        return await generateThumbnail(filePath, outputPath);
      case 'video':
        return await generateVideoThumbnail(filePath, outputPath);
      case 'audio':
        return await generateAudioThumbnail(filePath, outputPath);
      default:
        throw new Error(`不支援的檔案類型: ${fileType}`);
    }
  } catch (error) {
    console.error('產生縮圖失敗:', error);
    throw error;
  }
};

module.exports = {
  generateThumbnail,
  generateVideoThumbnail,
  generateAudioThumbnail,
  generateThumbnailByType,
};