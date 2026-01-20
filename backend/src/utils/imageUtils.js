const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');

/**
 * 自動旋轉圖片（根據 EXIF orientation）
 * @param {string} inputPath - 輸入圖片路徑
 * @returns {Promise<void>} 直接覆蓋原檔案
 */
const autoRotateImage = async (inputPath) => {
  try {
    const buffer = await sharp(inputPath)
      .rotate() // 自動根據 EXIF orientation 旋轉
      .toBuffer();

    // 覆蓋原檔案
    await sharp(buffer).toFile(inputPath);
  } catch (error) {
    console.error('自動旋轉圖片失敗:', error);
    throw error;
  }
};

/**
 * 產生圖片縮圖
 */
const generateThumbnail = async (inputPath, outputPath, size = 300) => {
  try {
    await sharp(inputPath)
      .rotate() // 自動根據 EXIF orientation 旋轉
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
 * 產生影片縮圖（擷取第一幀）
 */
const generateVideoThumbnail = async (inputPath, outputPath) => {
  const ffmpeg = require('fluent-ffmpeg');
  const ffmpegStatic = require('ffmpeg-static');
  const ffprobeInstaller = require('@ffprobe-installer/ffprobe');

  // 設定 ffmpeg 和 ffprobe 路徑
  ffmpeg.setFfmpegPath(ffmpegStatic);
  ffmpeg.setFfprobePath(ffprobeInstaller.path);

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        count: 1,
        folder: path.dirname(outputPath),
        filename: path.basename(outputPath),
        size: '300x300',
        timemarks: ['1'] // 在第 1 秒擷取
      })
      .on('end', () => {
        resolve(outputPath);
      })
      .on('error', async (err) => {
        console.warn('FFmpeg 擷取縮圖失敗，使用備用方案:', err.message);

        // 備用方案：建立灰色圖片
        try {
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

          resolve(outputPath);
        } catch (sharpErr) {
          reject(sharpErr);
        }
      });
  });
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
  autoRotateImage,
  generateThumbnail,
  generateVideoThumbnail,
  generateAudioThumbnail,
  generateThumbnailByType,
};