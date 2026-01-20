import { io } from 'socket.io-client';

let socket = null;
let initialServerStartTime = null; // 記錄初始伺服器啟動時間
let hasShownRestartNotification = false; // 防止重複顯示通知

// Socket 事件類型（需與後端一致）
export const SocketEvents = {
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

/**
 * 取得 Socket.IO URL
 */
const getSocketUrl = () => {
  // 在生產環境使用相對路徑，開發環境使用 localhost
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin.replace(':4123', ':3001');
  }
  return 'http://localhost:3001';
};

/**
 * 初始化 Socket 連接
 */
export const initSocket = () => {
  if (socket) {
    return socket;
  }

  const socketUrl = getSocketUrl();
  console.log('📡 連接 WebSocket:', socketUrl);

  socket = io(socketUrl, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
  });

  socket.on('connect', () => {
    console.log('✅ WebSocket 已連接:', socket.id);
  });

  // 監聽伺服器資訊（用於檢測重啟）
  socket.on('server-info', (data) => {
    console.log('📊 收到伺服器資訊:', data);

    if (initialServerStartTime === null) {
      // 首次連接，記錄啟動時間
      initialServerStartTime = data.startTime;
      console.log('📝 記錄初始伺服器啟動時間:', new Date(data.startTime).toLocaleString());
    } else if (data.startTime !== initialServerStartTime && !hasShownRestartNotification) {
      // 啟動時間改變，表示後端重啟了
      console.warn('🔄 檢測到後端重啟，建議重新載入頁面');
      hasShownRestartNotification = true;

      // 顯示通知並詢問是否重新載入
      const shouldReload = window.confirm(
        '偵測到後端服務已重新啟動\n\n建議重新載入頁面以確保功能正常運作。\n\n是否立即重新載入？'
      );

      if (shouldReload) {
        window.location.reload();
      } else {
        // 如果用戶選擇不重新載入，更新記錄的啟動時間（避免重複提示）
        initialServerStartTime = data.startTime;
        hasShownRestartNotification = false;
      }
    }
  });

  socket.on('disconnect', (reason) => {
    console.log('❌ WebSocket 已斷開:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('⚠️ WebSocket 連接錯誤:', error.message);
  });

  return socket;
};

/**
 * 取得 Socket 實例
 */
export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

/**
 * 加入展示頁面房間
 */
export const joinDisplayRoom = () => {
  const s = getSocket();
  s.emit('join-display');
  console.log('🖥️ 已加入展示頁面房間');
};

/**
 * 加入管理頁面房間
 */
export const joinAdminRoom = () => {
  const s = getSocket();
  s.emit('join-admin');
  console.log('⚙️ 已加入管理頁面房間');
};

/**
 * 監聽事件
 */
export const onSocketEvent = (event, callback) => {
  const s = getSocket();
  s.on(event, callback);
  return () => s.off(event, callback);
};

/**
 * 斷開 Socket 連接
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('📴 WebSocket 已斷開');
  }
  // 注意：不重置 initialServerStartTime，以便下次連接時能檢測到重啟
};
