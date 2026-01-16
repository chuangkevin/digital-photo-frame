const multer = require('multer');
const path = require('path');
const { generateUniqueFilename, isFileSupported } = require('../utils/fileUtils');

// 設定儲存位置和檔案名稱
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads/media';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = generateUniqueFilename(file.originalname);
    cb(null, uniqueName);
  }
});

// 檔案篩選器
const fileFilter = (req, file, cb) => {
  if (isFileSupported(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error(`不支援的檔案類型: ${file.mimetype}`);
    error.status = 400;
    cb(error, false);
  }
};

// 設定檔案大小限制
const limits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024, // 100MB
};

// 建立 multer 實例
const upload = multer({
  storage,
  fileFilter,
  limits,
});

// 錯誤處理中介軟體
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: '檔案太大',
        message: `檔案大小不能超過 ${limits.fileSize / (1024 * 1024)}MB`
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: '意外的檔案欄位',
        message: '請確認檔案欄位名稱正確'
      });
    }
  }

  if (error.status === 400) {
    return res.status(400).json({
      error: '檔案類型錯誤',
      message: error.message
    });
  }

  next(error);
};

module.exports = {
  upload,
  handleUploadError,
};