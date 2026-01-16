const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs-extra');

// 環境變數設定
require('dotenv').config();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// 確保上傳目錄存在
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const MEDIA_PATH = path.join(UPLOAD_PATH, 'media');
const THUMBNAILS_PATH = path.join(UPLOAD_PATH, 'thumbnails');

async function ensureDirectories() {
  await fs.ensureDir(MEDIA_PATH);
  await fs.ensureDir(THUMBNAILS_PATH);
  await fs.ensureDir('./data');
}

// 初始化資料庫
const { testConnection, syncDatabase } = require('./src/models');
const routes = require('./src/routes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

// 建立 Express 應用
const app = express();

// 安全性中介軟體
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false // 在開發環境中關閉 CSP
}));

// 壓縮中介軟體
app.use(compression());

// CORS 設定
app.use(cors({
  origin: NODE_ENV === 'production' ?
    ['http://localhost:3000'] : // 生產環境限制來源
    true, // 開發環境允許所有來源
  credentials: true
}));

// 請求限制 (開發環境下禁用)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分鐘
  max: NODE_ENV === 'production' ? 100 : 0, // 0 = 不限制
  message: {
    error: '請求過於頻繁',
    message: '請稍後再試'
  },
  skip: () => NODE_ENV !== 'production' // 開發環境跳過限制
});
app.use('/api', limiter);

// 檔案上傳限制 (開發環境下禁用)
const uploadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分鐘
  max: NODE_ENV === 'production' ? 5 : 0,
  message: {
    error: '上傳過於頻繁',
    message: '請稍後再試'
  },
  skip: () => NODE_ENV !== 'production'
});
app.use('/api/media/upload', uploadLimiter);

// Body 解析中介軟體
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API 路由
app.use('/api', routes);

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    version: require('./package.json').version
  });
});

// 根路徑
app.get('/', (req, res) => {
  res.json({
    name: '數位相框後端服務',
    version: require('./package.json').version,
    status: 'running',
    api: '/api',
    health: '/health'
  });
});

// 404 處理
app.use(notFound);

// 錯誤處理
app.use(errorHandler);

/**
 * 啟動伺服器
 */
async function startServer() {
  try {
    // 確保目錄存在
    await ensureDirectories();
    console.log('📁 上傳目錄已準備');

    // 測試資料庫連接
    await testConnection();

    // 同步資料庫（不強制重建）
    await syncDatabase(false);

    // 啟動伺服器
    app.listen(PORT, () => {
      console.log('🚀 數位相框後端服務已啟動');
      console.log(`📡 伺服器運行於: http://localhost:${PORT}`);
      console.log(`🌍 環境: ${NODE_ENV}`);
      console.log(`📊 API 文件: http://localhost:${PORT}/api`);
      console.log(`❤️ 健康檢查: http://localhost:${PORT}/health`);

      if (NODE_ENV === 'development') {
        console.log('\n📝 開發模式下的有用端點:');
        console.log('   媒體列表: GET /api/media');
        console.log('   上傳檔案: POST /api/media/upload');
        console.log('   播放配置: GET /api/playback/configs');
        console.log('   展示播放清單: GET /api/display/playlist');
      }
    });

  } catch (error) {
    console.error('❌ 伺服器啟動失敗:', error);
    process.exit(1);
  }
}

// 優雅關機處理
process.on('SIGTERM', () => {
  console.log('📴 接收到 SIGTERM 信號，正在關閉伺服器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 接收到 SIGINT 信號，正在關閉伺服器...');
  process.exit(0);
});

// 捕獲未處理的錯誤
process.on('uncaughtException', (error) => {
  console.error('💥 未捕獲的例外:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 未處理的 Promise 拒絕:', reason);
  process.exit(1);
});

// 啟動伺服器
startServer();