const ffmpeg = require('fluent-ffmpeg');
const ffprobeInstaller = require('@ffprobe-installer/ffprobe');
const ffmpegStatic = require('ffmpeg-static');
const path = require('path');

// 設定 ffprobe 和 ffmpeg 路徑
ffmpeg.setFfprobePath(ffprobeInstaller.path);
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * 讀取影片的 metadata
 * @param {string} filePath - 影片檔案路徑
 * @returns {Promise<Object>} 包含 duration 和 rotation 的物件
 */
function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        return reject(err);
      }

      try {
        // 獲取影片串流資訊
        const videoStream = metadata.streams.find(
          stream => stream.codec_type === 'video'
        );

        if (!videoStream) {
          return resolve({
            duration: 0,
            rotation: 0,
          });
        }

        // 獲取旋轉資訊
        // 旋轉資訊可能儲存在不同的地方：
        // 1. videoStream.tags.rotate (字串，例如 "90")
        // 2. videoStream.side_data_list (陣列，包含 rotation 屬性)
        let rotation = 0;

        // 方法 1: 從 tags.rotate 讀取
        if (videoStream.tags && videoStream.tags.rotate) {
          rotation = parseInt(videoStream.tags.rotate, 10);
        }

        // 方法 2: 從 side_data_list 讀取 (某些影片格式使用這個)
        if (videoStream.side_data_list) {
          const displayMatrix = videoStream.side_data_list.find(
            data => data.side_data_type === 'Display Matrix'
          );
          if (displayMatrix && displayMatrix.rotation !== undefined) {
            rotation = Math.abs(displayMatrix.rotation);
          }
        }

        // 標準化旋轉角度 (確保是 0, 90, 180, 270)
        rotation = rotation % 360;
        if (rotation < 0) {
          rotation += 360;
        }

        // 獲取影片時長（秒）
        const duration = metadata.format.duration
          ? Math.round(metadata.format.duration)
          : 0;

        resolve({
          duration,
          rotation,
          width: videoStream.width,
          height: videoStream.height,
        });
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * 檢查檔案是否為影片
 * @param {string} mimeType - MIME 類型
 * @returns {boolean}
 */
function isVideo(mimeType) {
  return mimeType && mimeType.startsWith('video/');
}

/**
 * 自動旋轉影片到正確方向並移除 rotation metadata
 * @param {string} inputPath - 輸入影片路徑
 * @param {string} outputPath - 輸出影片路徑（可選，預設覆蓋原檔案）
 * @returns {Promise<string>} 輸出檔案路徑
 */
function autoRotateVideo(inputPath, outputPath = null) {
  return new Promise(async (resolve, reject) => {
    try {
      // 先讀取 metadata 檢查是否需要旋轉
      const metadata = await getVideoMetadata(inputPath);

      // 如果不需要旋轉，直接返回
      if (!metadata.rotation || metadata.rotation === 0) {
        return resolve(inputPath);
      }

      // 如果沒有指定輸出路徑，使用臨時檔案
      const tempOutput = outputPath || inputPath + '.temp.mp4';

      // 根據旋轉角度設定 transpose 濾鏡
      // transpose=1: 順時針旋轉 90°
      // transpose=2: 逆時針旋轉 90°
      // transpose=1,transpose=1: 旋轉 180°
      let videoFilter;
      switch (metadata.rotation) {
        case 90:
          videoFilter = 'transpose=1';
          break;
        case 180:
          videoFilter = 'transpose=1,transpose=1';
          break;
        case 270:
          videoFilter = 'transpose=2';
          break;
        default:
          // 不應該到這裡，但以防萬一
          return resolve(inputPath);
      }

      // 使用 ffmpeg 旋轉影片
      ffmpeg(inputPath)
        .videoFilters(videoFilter)
        .outputOptions([
          '-metadata:s:v:0 rotate=0', // 移除 rotation metadata
          '-c:a copy' // 音訊不重新編碼，直接複製
        ])
        .output(tempOutput)
        .on('end', async () => {
          try {
            if (!outputPath) {
              // 如果沒有指定輸出路徑，用旋轉後的檔案替換原檔案
              const fs = require('fs-extra');
              await fs.move(tempOutput, inputPath, { overwrite: true });
              resolve(inputPath);
            } else {
              resolve(tempOutput);
            }
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          reject(new Error(`影片旋轉失敗: ${err.message}`));
        })
        .run();

    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
  getVideoMetadata,
  isVideo,
  autoRotateVideo,
};
