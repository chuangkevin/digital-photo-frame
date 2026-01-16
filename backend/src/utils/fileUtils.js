const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');

// 支援的檔案類型
const SUPPORTED_IMAGES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
const SUPPORTED_VIDEOS = [
  'video/mp4',
  'video/webm',
  'video/avi',
  'video/x-msvideo',
  'video/quicktime',      // iPhone MOV
  'video/x-matroska',     // MKV
  'video/3gpp',           // 3GP
  'video/x-m4v',          // M4V
];
const SUPPORTED_AUDIOS = [
  'audio/mp3',
  'audio/mpeg',           // MP3 標準 MIME
  'audio/wav',
  'audio/ogg',
  'audio/aac',
  'audio/x-m4a',          // M4A
  'audio/mp4',            // M4A
];

const SUPPORTED_MIME_TYPES = [
  ...SUPPORTED_IMAGES,
  ...SUPPORTED_VIDEOS,
  ...SUPPORTED_AUDIOS
];

/**
 * 根據 MIME 類型判斷檔案類型
 */
const getFileType = (mimeType) => {
  if (SUPPORTED_IMAGES.includes(mimeType)) return 'image';
  if (SUPPORTED_VIDEOS.includes(mimeType)) return 'video';
  if (SUPPORTED_AUDIOS.includes(mimeType)) return 'audio';
  return null;
};

/**
 * 檢查檔案是否支援
 */
const isFileSupported = (mimeType) => {
  return SUPPORTED_MIME_TYPES.includes(mimeType);
};

/**
 * 產生唯一檔案名稱
 */
const generateUniqueFilename = (originalName) => {
  const ext = path.extname(originalName);
  const uuid = uuidv4();
  return `${uuid}${ext}`;
};

/**
 * 確保目錄存在
 */
const ensureDirectoryExists = async (dirPath) => {
  try {
    await fs.ensureDir(dirPath);
  } catch (error) {
    console.error('建立目錄失敗:', error);
    throw error;
  }
};

/**
 * 刪除檔案
 */
const deleteFile = async (filePath) => {
  try {
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  } catch (error) {
    console.error('刪除檔案失敗:', error);
    throw error;
  }
};

/**
 * 取得檔案大小
 */
const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
};

/**
 * 格式化檔案大小
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  SUPPORTED_IMAGES,
  SUPPORTED_VIDEOS,
  SUPPORTED_AUDIOS,
  SUPPORTED_MIME_TYPES,
  getFileType,
  isFileSupported,
  generateUniqueFilename,
  ensureDirectoryExists,
  deleteFile,
  getFileSize,
  formatFileSize,
};