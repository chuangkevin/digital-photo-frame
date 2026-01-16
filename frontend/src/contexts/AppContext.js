import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { displayAPI, mediaAPI, playbackAPI } from '../services/api';

// 初始狀態
const initialState = {
  // 展示狀態
  display: {
    currentConfig: null,
    mediaFiles: [],
    currentMediaIndex: 0,
    isPlaying: false,
    showControls: false,
    hideControlsTimer: null,
  },

  // 媒體狀態
  media: {
    list: [],
    loading: false,
    uploadProgress: {},
  },

  // 播放配置狀態
  playback: {
    configs: [],
    activeConfig: null,
    loading: false,
  },

  // UI 狀態
  ui: {
    currentPage: 'display', // 'display' | 'admin'
    isFullscreen: true,
    isMobile: false,
    isTablet: false,
  },

  // 錯誤狀態
  error: null,
};

// Action 類型
const ActionTypes = {
  // 展示相關
  SET_DISPLAY_CONFIG: 'SET_DISPLAY_CONFIG',
  SET_MEDIA_FILES: 'SET_MEDIA_FILES',
  SET_CURRENT_MEDIA_INDEX: 'SET_CURRENT_MEDIA_INDEX',
  SET_PLAYING: 'SET_PLAYING',
  SET_SHOW_CONTROLS: 'SET_SHOW_CONTROLS',
  SET_HIDE_CONTROLS_TIMER: 'SET_HIDE_CONTROLS_TIMER',

  // 媒體相關
  SET_MEDIA_LIST: 'SET_MEDIA_LIST',
  SET_MEDIA_LOADING: 'SET_MEDIA_LOADING',
  SET_UPLOAD_PROGRESS: 'SET_UPLOAD_PROGRESS',
  ADD_MEDIA: 'ADD_MEDIA',
  UPDATE_MEDIA: 'UPDATE_MEDIA',
  REMOVE_MEDIA: 'REMOVE_MEDIA',

  // 播放配置相關
  SET_PLAYBACK_CONFIGS: 'SET_PLAYBACK_CONFIGS',
  SET_ACTIVE_CONFIG: 'SET_ACTIVE_CONFIG',
  SET_PLAYBACK_LOADING: 'SET_PLAYBACK_LOADING',
  ADD_CONFIG: 'ADD_CONFIG',
  UPDATE_CONFIG: 'UPDATE_CONFIG',
  REMOVE_CONFIG: 'REMOVE_CONFIG',

  // UI 相關
  SET_CURRENT_PAGE: 'SET_CURRENT_PAGE',
  SET_FULLSCREEN: 'SET_FULLSCREEN',
  SET_DEVICE_TYPE: 'SET_DEVICE_TYPE',

  // 錯誤處理
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    // 展示相關
    case ActionTypes.SET_DISPLAY_CONFIG:
      return {
        ...state,
        display: { ...state.display, currentConfig: action.payload },
      };

    case ActionTypes.SET_MEDIA_FILES:
      return {
        ...state,
        display: { ...state.display, mediaFiles: action.payload },
      };

    case ActionTypes.SET_CURRENT_MEDIA_INDEX:
      return {
        ...state,
        display: { ...state.display, currentMediaIndex: action.payload },
      };

    case ActionTypes.SET_PLAYING:
      return {
        ...state,
        display: { ...state.display, isPlaying: action.payload },
      };

    case ActionTypes.SET_SHOW_CONTROLS:
      return {
        ...state,
        display: { ...state.display, showControls: action.payload },
      };

    case ActionTypes.SET_HIDE_CONTROLS_TIMER:
      return {
        ...state,
        display: { ...state.display, hideControlsTimer: action.payload },
      };

    // 媒體相關
    case ActionTypes.SET_MEDIA_LIST:
      return {
        ...state,
        media: { ...state.media, list: action.payload },
      };

    case ActionTypes.SET_MEDIA_LOADING:
      return {
        ...state,
        media: { ...state.media, loading: action.payload },
      };

    case ActionTypes.SET_UPLOAD_PROGRESS:
      return {
        ...state,
        media: {
          ...state.media,
          uploadProgress: { ...state.media.uploadProgress, ...action.payload },
        },
      };

    case ActionTypes.ADD_MEDIA:
      return {
        ...state,
        media: { ...state.media, list: [action.payload, ...state.media.list] },
      };

    case ActionTypes.UPDATE_MEDIA:
      return {
        ...state,
        media: {
          ...state.media,
          list: state.media.list.map((item) =>
            item.id === action.payload.id ? action.payload : item
          ),
        },
      };

    case ActionTypes.REMOVE_MEDIA:
      return {
        ...state,
        media: {
          ...state.media,
          list: state.media.list.filter((item) => item.id !== action.payload),
        },
      };

    // 播放配置相關
    case ActionTypes.SET_PLAYBACK_CONFIGS:
      return {
        ...state,
        playback: { ...state.playback, configs: action.payload },
      };

    case ActionTypes.SET_ACTIVE_CONFIG:
      return {
        ...state,
        playback: { ...state.playback, activeConfig: action.payload },
      };

    case ActionTypes.SET_PLAYBACK_LOADING:
      return {
        ...state,
        playback: { ...state.playback, loading: action.payload },
      };

    // UI 相關
    case ActionTypes.SET_CURRENT_PAGE:
      return {
        ...state,
        ui: { ...state.ui, currentPage: action.payload },
      };

    case ActionTypes.SET_FULLSCREEN:
      return {
        ...state,
        ui: { ...state.ui, isFullscreen: action.payload },
      };

    case ActionTypes.SET_DEVICE_TYPE:
      return {
        ...state,
        ui: { ...state.ui, ...action.payload },
      };

    // 錯誤處理
    case ActionTypes.SET_ERROR:
      return { ...state, error: action.payload };

    case ActionTypes.CLEAR_ERROR:
      return { ...state, error: null };

    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 檢測設備類型
  const detectDeviceType = useCallback(() => {
    const width = window.innerWidth;
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    dispatch({
      type: ActionTypes.SET_DEVICE_TYPE,
      payload: { isMobile, isTablet },
    });
  }, []);

  // 載入展示配置和媒體
  const loadDisplayData = useCallback(async () => {
    try {
      const displayData = await displayAPI.getDisplayPlaylist();

      dispatch({
        type: ActionTypes.SET_DISPLAY_CONFIG,
        payload: displayData.data.config,
      });

      dispatch({
        type: ActionTypes.SET_MEDIA_FILES,
        payload: displayData.data.mediaFiles,
      });

    } catch (error) {
      console.error('載入展示資料失敗:', error);
      dispatch({
        type: ActionTypes.SET_ERROR,
        payload: '載入展示資料失敗',
      });
    }
  }, []);

  // 載入媒體列表
  const loadMediaList = useCallback(async (params = {}) => {
    dispatch({ type: ActionTypes.SET_MEDIA_LOADING, payload: true });

    try {
      const response = await mediaAPI.getList(params);
      dispatch({ type: ActionTypes.SET_MEDIA_LIST, payload: response.data });
    } catch (error) {
      console.error('載入媒體列表失敗:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: '載入媒體列表失敗' });
    } finally {
      dispatch({ type: ActionTypes.SET_MEDIA_LOADING, payload: false });
    }
  }, []);

  // 載入播放配置
  const loadPlaybackConfigs = useCallback(async () => {
    dispatch({ type: ActionTypes.SET_PLAYBACK_LOADING, payload: true });

    try {
      const response = await playbackAPI.getConfigs();
      dispatch({ type: ActionTypes.SET_PLAYBACK_CONFIGS, payload: response.data });

      // 取得啟用的配置
      try {
        const activeResponse = await playbackAPI.getActiveConfig();
        dispatch({ type: ActionTypes.SET_ACTIVE_CONFIG, payload: activeResponse.data });
      } catch (error) {
        // 沒有啟用的配置也是正常的
        dispatch({ type: ActionTypes.SET_ACTIVE_CONFIG, payload: null });
      }
    } catch (error) {
      console.error('載入播放配置失敗:', error);
      dispatch({ type: ActionTypes.SET_ERROR, payload: '載入播放配置失敗' });
    } finally {
      dispatch({ type: ActionTypes.SET_PLAYBACK_LOADING, payload: false });
    }
  }, []);

  // 控制顯示/隱藏
  const showControls = useCallback(() => {
    // 清除現有計時器
    if (state.display.hideControlsTimer) {
      clearTimeout(state.display.hideControlsTimer);
    }

    dispatch({ type: ActionTypes.SET_SHOW_CONTROLS, payload: true });

    // 設定新的隱藏計時器
    const timer = setTimeout(() => {
      dispatch({ type: ActionTypes.SET_SHOW_CONTROLS, payload: false });
      dispatch({ type: ActionTypes.SET_HIDE_CONTROLS_TIMER, payload: null });
    }, 3000);

    dispatch({ type: ActionTypes.SET_HIDE_CONTROLS_TIMER, payload: timer });
  }, [state.display.hideControlsTimer]);

  const hideControls = useCallback(() => {
    if (state.display.hideControlsTimer) {
      clearTimeout(state.display.hideControlsTimer);
      dispatch({ type: ActionTypes.SET_HIDE_CONTROLS_TIMER, payload: null });
    }
    dispatch({ type: ActionTypes.SET_SHOW_CONTROLS, payload: false });
  }, [state.display.hideControlsTimer]);

  // 切換到下一個媒體
  const nextMedia = useCallback(() => {
    const { mediaFiles, currentMediaIndex } = state.display;
    if (mediaFiles.length > 0) {
      const nextIndex = (currentMediaIndex + 1) % mediaFiles.length;
      dispatch({ type: ActionTypes.SET_CURRENT_MEDIA_INDEX, payload: nextIndex });
    }
  }, [state.display.mediaFiles, state.display.currentMediaIndex]);

  // 切換到上一個媒體
  const previousMedia = useCallback(() => {
    const { mediaFiles, currentMediaIndex } = state.display;
    if (mediaFiles.length > 0) {
      const prevIndex = currentMediaIndex === 0 ? mediaFiles.length - 1 : currentMediaIndex - 1;
      dispatch({ type: ActionTypes.SET_CURRENT_MEDIA_INDEX, payload: prevIndex });
    }
  }, [state.display.mediaFiles, state.display.currentMediaIndex]);

  // 清除錯誤
  const clearError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  // 初始化
  useEffect(() => {
    detectDeviceType();
    window.addEventListener('resize', detectDeviceType);

    return () => {
      window.removeEventListener('resize', detectDeviceType);
    };
  }, [detectDeviceType]);

  const contextValue = {
    state,
    dispatch,
    actions: {
      loadDisplayData,
      loadMediaList,
      loadPlaybackConfigs,
      showControls,
      hideControls,
      nextMedia,
      previousMedia,
      clearError,
    },
    ActionTypes,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

export { ActionTypes };
export default AppContext;