import axios from 'axios';

// API 基本配置 - 動態偵測後端地址
const getApiBaseUrl = () => {
  // 如果是生產環境，根據當前訪問地址動態決定 API URL
  if (process.env.NODE_ENV === 'production') {
    // 將前端 port (4123) 替換為後端 port (3001)
    return window.location.origin.replace(':4123', ':3001');
  }
  // 開發環境使用環境變數或預設值
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiBaseUrl();

// 導出給其他模組使用
export { getApiBaseUrl, API_BASE_URL };

// 建立 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 秒超時
  headers: {
    'Content-Type': 'application/json',
  },
});

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    console.log(`API 請求: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API 請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 回應攔截器
api.interceptors.response.use(
  (response) => {
    console.log(`API 回應: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API 回應錯誤:', error);

    // 處理常見錯誤
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 400:
          console.error('請求錯誤:', data.message);
          break;
        case 404:
          console.error('資源未找到:', data.message);
          break;
        case 500:
          console.error('伺服器錯誤:', data.message);
          break;
        default:
          console.error('未知錯誤:', data.message);
      }
    } else if (error.request) {
      console.error('網路錯誤: 無法連接到伺服器');
    } else {
      console.error('請求設定錯誤:', error.message);
    }

    return Promise.reject(error);
  }
);

// 媒體檔案 API
export const mediaAPI = {
  // 上傳媒體檔案
  upload: async (formData, onUploadProgress) => {
    const response = await api.post('/api/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onUploadProgress ? (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(percentCompleted);
      } : undefined,
    });
    return response.data;
  },

  // 取得媒體列表
  getList: async (params = {}) => {
    const response = await api.get('/api/media', { params });
    return response.data;
  },

  // 取得單一媒體檔案
  getById: async (id) => {
    const response = await api.get(`/api/media/${id}`);
    return response.data;
  },

  // 更新媒體檔案
  update: async (id, data) => {
    const response = await api.put(`/api/media/${id}`, data);
    return response.data;
  },

  // 刪除媒體檔案
  delete: async (id) => {
    const response = await api.delete(`/api/media/${id}`);
    return response.data;
  },

  // 取得媒體檔案 URL
  getFileUrl: (filename) => `${API_BASE_URL}/api/files/${filename}`,

  // 取得縮圖 URL
  getThumbnailUrl: (filename) => `${API_BASE_URL}/api/thumbnails/${filename}`,
};

// 播放配置 API
export const playbackAPI = {
  // 取得所有配置
  getConfigs: async () => {
    const response = await api.get('/api/playback/configs');
    return response.data;
  },

  // 取得單一配置
  getConfigById: async (id) => {
    const response = await api.get(`/api/playback/configs/${id}`);
    return response.data;
  },

  // 取得目前啟用的配置
  getActiveConfig: async () => {
    const response = await api.get('/api/playback/configs/active');
    return response.data;
  },

  // 建立新配置
  createConfig: async (data) => {
    const response = await api.post('/api/playback/configs', data);
    return response.data;
  },

  // 更新配置
  updateConfig: async (id, data) => {
    const response = await api.put(`/api/playback/configs/${id}`, data);
    return response.data;
  },

  // 啟用配置
  activateConfig: async (id) => {
    const response = await api.put(`/api/playback/configs/${id}/activate`);
    return response.data;
  },

  // 刪除配置
  deleteConfig: async (id) => {
    const response = await api.delete(`/api/playback/configs/${id}`);
    return response.data;
  },
};

// 播放清單 API
export const playlistAPI = {
  // 取得播放清單
  getPlaylist: async (configId) => {
    const response = await api.get(`/api/playlist/${configId}`);
    return response.data;
  },

  // 新增到播放清單
  addToPlaylist: async (configId, mediaIds) => {
    const response = await api.post(`/api/playlist/${configId}/items`, {
      mediaIds,
    });
    return response.data;
  },

  // 從播放清單移除
  removeFromPlaylist: async (configId, itemId) => {
    const response = await api.delete(
      `/api/playlist/${configId}/items/${itemId}`
    );
    return response.data;
  },

  // 重新排序
  reorderPlaylist: async (configId, itemOrders) => {
    const response = await api.put(`/api/playlist/${configId}/reorder`, {
      itemOrders,
    });
    return response.data;
  },

  // 清空播放清單
  clearPlaylist: async (configId) => {
    const response = await api.delete(`/api/playlist/${configId}`);
    return response.data;
  },
};

// 展示 API
export const displayAPI = {
  // 取得目前播放配置
  getCurrentConfig: async () => {
    const response = await api.get('/api/display/current-config');
    return response.data;
  },

  // 取得展示播放清單
  getDisplayPlaylist: async () => {
    const response = await api.get('/api/display/playlist');
    return response.data;
  },

  // 取得下一個媒體
  getNextMedia: async (currentMediaId) => {
    const response = await api.get('/api/display/next-media', {
      params: { currentMediaId },
    });
    return response.data;
  },

  // 取得系統狀態
  getSystemStatus: async () => {
    const response = await api.get('/api/display/status');
    return response.data;
  },
};

// 健康檢查
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api;