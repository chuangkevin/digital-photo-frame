const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/database.sqlite');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: false,
    freezeTableName: true,
  },
});

// 測試資料庫連接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 資料庫連接成功');
  } catch (error) {
    console.error('❌ 資料庫連接失敗:', error);
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  testConnection,
};