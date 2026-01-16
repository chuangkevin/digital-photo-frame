/**
 * 全域錯誤處理中介軟體
 */
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Sequelize 驗證錯誤
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(error => error.message);
    return res.status(400).json({
      error: '驗證錯誤',
      message: messages.join(', ')
    });
  }

  // Sequelize 唯一性約束錯誤
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      error: '重複資料',
      message: '該資料已存在'
    });
  }

  // 檔案不存在錯誤
  if (err.code === 'ENOENT') {
    return res.status(404).json({
      error: '檔案未找到',
      message: '請求的檔案不存在'
    });
  }

  // 自定義錯誤狀態碼
  if (err.status) {
    return res.status(err.status).json({
      error: err.message || '請求錯誤',
      message: err.message
    });
  }

  // 預設伺服器錯誤
  res.status(500).json({
    error: '伺服器內部錯誤',
    message: process.env.NODE_ENV === 'development' ? err.message : '請稍後再試'
  });
};

/**
 * 404 錯誤處理
 */
const notFound = (req, res) => {
  res.status(404).json({
    error: '路由未找到',
    message: `無法找到 ${req.method} ${req.originalUrl}`
  });
};

/**
 * 非同步錯誤包裝器
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
};