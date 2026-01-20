const path = require('path');
const fs = require('fs-extra');
const { MediaFile } = require('../models');
const { getFileType, deleteFile, getFileSize } = require('../utils/fileUtils');
const { generateThumbnailByType, autoRotateImage } = require('../utils/imageUtils');
const { getVideoMetadata, isVideo, autoRotateVideo } = require('../utils/videoUtils');
const { asyncHandler } = require('../middleware/errorHandler');
const { emitToDisplay, emitToAll, SocketEvents } = require('../services/socketService');

/**
 * 上傳媒體檔案
 */
const uploadMedia = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      error: '沒有檔案',
      message: '請選擇要上傳的檔案'
    });
  }

  const file = req.file;
  const fileType = getFileType(file.mimetype);

  try {
    // 自動旋轉媒體到正確方向
    if (fileType === 'image') {
      console.log('自動旋轉圖片:', file.originalname);
      await autoRotateImage(file.path);
    } else if (fileType === 'video') {
      console.log('自動旋轉影片:', file.originalname);
      await autoRotateVideo(file.path);
    }

    // 產生縮圖
    const thumbnailsDir = process.env.UPLOAD_PATH ?
      path.join(process.env.UPLOAD_PATH, '../thumbnails') :
      './uploads/thumbnails';

    await fs.ensureDir(thumbnailsDir);

    const thumbnailFilename = `thumb_${file.filename}`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

    await generateThumbnailByType(file.path, thumbnailPath, fileType);

    // 解碼檔案名稱 (處理 UTF-8 編碼問題)
    let decodedOriginalName;
    try {
      // 嘗試將 Latin-1 編碼的字串轉換為 UTF-8
      decodedOriginalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    } catch (e) {
      decodedOriginalName = file.originalname;
    }

    // 如果是影片，讀取 metadata（只讀取時長）
    let duration = null;
    if (isVideo(file.mimetype)) {
      try {
        const videoMetadata = await getVideoMetadata(file.path);
        duration = videoMetadata.duration;
      } catch (error) {
        console.warn('無法讀取影片 metadata:', error);
      }
    }

    // 儲存到資料庫
    const mediaFile = await MediaFile.create({
      filename: file.filename,
      originalName: decodedOriginalName,
      filePath: file.path,
      thumbnailPath: thumbnailPath,
      fileType: fileType,
      mimeType: file.mimetype,
      fileSize: file.size,
      duration: duration,
      tags: req.body.tags || null,
    });

    // 廣播媒體上傳事件
    emitToAll(SocketEvents.MEDIA_UPLOADED, { media: mediaFile });
    // 通知展示頁面刷新
    emitToDisplay(SocketEvents.REFRESH_DISPLAY, {});

    res.status(201).json({
      message: '檔案上傳成功',
      data: mediaFile
    });

  } catch (error) {
    // 如果資料庫操作失敗，清理已上傳的檔案
    await deleteFile(file.path);
    throw error;
  }
});

/**
 * 取得媒體檔案列表
 */
const getMediaList = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    fileType,
    search
  } = req.query;

  const offset = (page - 1) * limit;
  const where = { isActive: true };

  // 檔案類型篩選
  if (fileType && ['image', 'video', 'audio'].includes(fileType)) {
    where.fileType = fileType;
  }

  // 搜尋功能
  if (search) {
    const { Op } = require('sequelize');
    where[Op.or] = [
      { originalName: { [Op.like]: `%${search}%` } },
      { tags: { [Op.like]: `%${search}%` } }
    ];
  }

  const { rows: mediaFiles, count } = await MediaFile.findAndCountAll({
    where,
    order: [['uploadTime', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  res.json({
    data: mediaFiles,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      itemsPerPage: parseInt(limit)
    }
  });
});

/**
 * 取得單一媒體檔案資訊
 */
const getMediaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mediaFile = await MediaFile.findOne({
    where: { id, isActive: true }
  });

  if (!mediaFile) {
    return res.status(404).json({
      error: '檔案未找到',
      message: '指定的媒體檔案不存在'
    });
  }

  res.json({ data: mediaFile });
});

/**
 * 更新媒體檔案資訊
 */
const updateMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { tags } = req.body;

  const mediaFile = await MediaFile.findOne({
    where: { id, isActive: true }
  });

  if (!mediaFile) {
    return res.status(404).json({
      error: '檔案未找到',
      message: '指定的媒體檔案不存在'
    });
  }

  await mediaFile.update({ tags });

  // 廣播媒體更新事件
  emitToAll(SocketEvents.MEDIA_UPDATED, { media: mediaFile });
  // 通知展示頁面刷新
  emitToDisplay(SocketEvents.REFRESH_DISPLAY, {});

  res.json({
    message: '檔案資訊更新成功',
    data: mediaFile
  });
});

/**
 * 刪除媒體檔案
 */
const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const mediaFile = await MediaFile.findOne({
    where: { id, isActive: true }
  });

  if (!mediaFile) {
    return res.status(404).json({
      error: '檔案未找到',
      message: '指定的媒體檔案不存在'
    });
  }

  // 軟刪除（標記為非活躍）
  await mediaFile.update({ isActive: false });

  // 實際刪除檔案
  await deleteFile(mediaFile.filePath);
  if (mediaFile.thumbnailPath) {
    await deleteFile(mediaFile.thumbnailPath);
  }

  // 廣播媒體刪除事件
  emitToAll(SocketEvents.MEDIA_DELETED, { mediaId: id });
  // 通知展示頁面刷新
  emitToDisplay(SocketEvents.REFRESH_DISPLAY, {});

  res.json({
    message: '檔案刪除成功'
  });
});

/**
 * 取得媒體檔案（用於前端顯示）
 */
const serveMedia = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  const mediaFile = await MediaFile.findOne({
    where: { filename, isActive: true }
  });

  if (!mediaFile) {
    return res.status(404).json({
      error: '檔案未找到'
    });
  }

  const filePath = path.resolve(mediaFile.filePath);

  // 設定 HTTP 快取標頭
  // Cache-Control: 1 年快取，因為檔案名稱包含唯一 ID，檔案內容不會改變
  res.set({
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 年
    'Last-Modified': new Date(mediaFile.uploadTime).toUTCString(),
  });

  res.sendFile(filePath);
});

/**
 * 取得縮圖檔案
 */
const serveThumbnail = asyncHandler(async (req, res) => {
  const { filename } = req.params;

  const mediaFile = await MediaFile.findOne({
    where: { filename, isActive: true }
  });

  if (!mediaFile || !mediaFile.thumbnailPath) {
    return res.status(404).json({
      error: '縮圖未找到'
    });
  }

  const thumbnailPath = path.resolve(mediaFile.thumbnailPath);

  // 設定 HTTP 快取標頭
  res.set({
    'Cache-Control': 'public, max-age=31536000, immutable', // 1 年
    'Last-Modified': new Date(mediaFile.uploadTime).toUTCString(),
  });

  res.sendFile(thumbnailPath);
});

module.exports = {
  uploadMedia,
  getMediaList,
  getMediaById,
  updateMedia,
  deleteMedia,
  serveMedia,
  serveThumbnail,
};