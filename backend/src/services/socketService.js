const { Server } = require('socket.io');

let io = null;

// 記錄伺服器啟動時間（用於檢測重啟）
const SERVER_START_TIME = Date.now();

/**
 * 初始化 Socket.IO 服務
 */
const initSocketService = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`📡 客戶端連接: ${socket.id}`);

    // 發送伺服器啟動時間給客戶端（用於檢測重啟）
    socket.emit('server-info', {
      startTime: SERVER_START_TIME,
      version: require('../../package.json').version,
    });

    // 加入展示頁面房間
    socket.on('join-display', () => {
      socket.join('display');
      console.log(`🖥️ 展示頁面加入: ${socket.id}`);
    });

    // 加入管理頁面房間
    socket.on('join-admin', () => {
      socket.join('admin');
      console.log(`⚙️ 管理頁面加入: ${socket.id}`);
    });

    socket.on('disconnect', () => {
      console.log(`📴 客戶端斷開: ${socket.id}`);
    });
  });

  console.log('🔌 WebSocket 服務已啟動');
  return io;
};

/**
 * 取得 Socket.IO 實例
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO 尚未初始化');
  }
  return io;
};

/**
 * 廣播事件到展示頁面
 */
const emitToDisplay = (event, data) => {
  if (io) {
    io.to('display').emit(event, data);
    console.log(`📤 廣播到展示頁面: ${event}`);
  }
};

/**
 * 廣播事件到所有客戶端
 */
const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`📤 廣播到所有客戶端: ${event}`);
  }
};

// 定義事件類型
const SocketEvents = {
  // 媒體相關
  MEDIA_UPLOADED: 'media:uploaded',
  MEDIA_DELETED: 'media:deleted',
  MEDIA_UPDATED: 'media:updated',

  // 播放配置相關
  CONFIG_CREATED: 'config:created',
  CONFIG_UPDATED: 'config:updated',
  CONFIG_DELETED: 'config:deleted',
  CONFIG_ACTIVATED: 'config:activated',

  // 播放清單相關
  PLAYLIST_UPDATED: 'playlist:updated',

  // 系統相關
  REFRESH_DISPLAY: 'display:refresh',
};

module.exports = {
  initSocketService,
  getIO,
  emitToDisplay,
  emitToAll,
  SocketEvents,
};
