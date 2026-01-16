const path = require('path');
const fs = require('fs-extra');

// 設定環境變數
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/database.sqlite');

const { testConnection, syncDatabase } = require('../src/models');

/**
 * 初始化資料庫
 */
async function initDatabase() {
  try {
    console.log('🗄️ 開始初始化資料庫...');

    // 確保資料庫目錄存在
    const dbDir = path.dirname(process.env.DB_PATH);
    await fs.ensureDir(dbDir);
    console.log(`📁 資料庫目錄已準備: ${dbDir}`);

    // 測試資料庫連接
    await testConnection();

    // 同步資料庫結構
    await syncDatabase(false); // 不強制重建

    console.log('✅ 資料庫初始化完成!');
    console.log(`📍 資料庫位置: ${process.env.DB_PATH}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 資料庫初始化失敗:', error);
    process.exit(1);
  }
}

/**
 * 重設資料庫（警告：會刪除所有資料）
 */
async function resetDatabase() {
  try {
    console.log('⚠️ 警告：即將重設資料庫，所有資料將被刪除!');

    // 在生產環境中需要確認
    if (process.env.NODE_ENV === 'production') {
      console.log('❌ 生產環境中無法重設資料庫');
      process.exit(1);
    }

    // 刪除現有資料庫檔案
    if (await fs.pathExists(process.env.DB_PATH)) {
      await fs.remove(process.env.DB_PATH);
      console.log('🗑️ 舊資料庫已刪除');
    }

    // 重新初始化
    await initDatabase();

  } catch (error) {
    console.error('❌ 資料庫重設失敗:', error);
    process.exit(1);
  }
}

// 檢查命令列參數
const args = process.argv.slice(2);

if (args.includes('--reset')) {
  resetDatabase();
} else {
  initDatabase();
}