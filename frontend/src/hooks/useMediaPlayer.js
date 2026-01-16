import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

/**
 * 媒體播放器 Hook
 */
export function useMediaPlayer() {
  const { state, actions } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);

  const mediaRef = useRef(null);
  const imageTimerRef = useRef(null);

  const { currentConfig, mediaFiles, currentMediaIndex } = state.display;
  const currentMedia = mediaFiles[currentMediaIndex];

  // 清除圖片計時器
  const clearImageTimer = useCallback(() => {
    if (imageTimerRef.current) {
      clearTimeout(imageTimerRef.current);
      imageTimerRef.current = null;
    }
  }, []);

  // 播放下一個媒體
  const playNext = useCallback(() => {
    clearImageTimer();
    actions.nextMedia();
    setError(null);
  }, [actions, clearImageTimer]);

  // 播放上一個媒體
  const playPrevious = useCallback(() => {
    clearImageTimer();
    actions.previousMedia();
    setError(null);
  }, [actions, clearImageTimer]);

  // 媒體載入完成處理
  const handleMediaLoaded = useCallback(() => {
    setIsLoaded(true);
    setError(null);

    if (!currentMedia) return;

    // 對於圖片，設定自動切換計時器
    if (currentMedia.fileType === 'image') {
      const displayDuration = (currentConfig?.imageDisplayDuration || 5) * 1000;

      imageTimerRef.current = setTimeout(() => {
        playNext();
      }, displayDuration);
    }

    // 對於影片和音訊，取得時長
    if (mediaRef.current && (currentMedia.fileType === 'video' || currentMedia.fileType === 'audio')) {
      setDuration(mediaRef.current.duration || 0);
    }
  }, [currentMedia, currentConfig, playNext]);

  // 媒體載入錯誤處理
  const handleMediaError = useCallback((e) => {
    console.error('媒體載入錯誤:', e);
    setError('媒體載入失敗');
    setIsLoaded(false);

    // 自動切換到下一個媒體
    setTimeout(() => {
      playNext();
    }, 1000);
  }, [playNext]);

  // 媒體播放結束處理
  const handleMediaEnded = useCallback(() => {
    if (!currentMedia) return;

    // 檢查是否需要循環播放
    const shouldLoop = currentMedia.fileType === 'video'
      ? currentConfig?.videoLoop
      : currentConfig?.audioLoop;

    if (shouldLoop && mediaRef.current) {
      mediaRef.current.currentTime = 0;
      mediaRef.current.play();
    } else {
      playNext();
    }
  }, [currentMedia, currentConfig, playNext]);

  // 時間更新處理
  const handleTimeUpdate = useCallback(() => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  }, []);

  // 播放/暫停控制
  const togglePlayPause = useCallback(() => {
    if (!mediaRef.current || !currentMedia) return;

    if (currentMedia.fileType === 'image') {
      // 圖片不支援暫停，直接切換到下一個
      playNext();
      return;
    }

    if (mediaRef.current.paused) {
      mediaRef.current.play();
    } else {
      mediaRef.current.pause();
    }
  }, [currentMedia, playNext]);

  // 跳轉到指定時間
  const seekTo = useCallback((time) => {
    if (mediaRef.current && currentMedia?.fileType !== 'image') {
      mediaRef.current.currentTime = time;
    }
  }, [currentMedia]);

  // 設定音量
  const setVolume = useCallback((volume) => {
    if (mediaRef.current && currentMedia?.fileType !== 'image') {
      mediaRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, [currentMedia]);

  // 重置播放狀態
  const resetPlayer = useCallback(() => {
    clearImageTimer();
    setIsLoaded(false);
    setDuration(0);
    setCurrentTime(0);
    setError(null);
  }, [clearImageTimer]);

  // 當媒體變更時重置狀態
  useEffect(() => {
    resetPlayer();
  }, [currentMediaIndex, resetPlayer]);

  // 清理計時器
  useEffect(() => {
    return () => {
      clearImageTimer();
    };
  }, [clearImageTimer]);

  // 返回當前媒體的 URL
  const getMediaUrl = useCallback(() => {
    if (!currentMedia) return null;

    // 這裡可以根據需要添加基礎 URL
    return `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/files/${currentMedia.filename}`;
  }, [currentMedia]);

  // 返回縮圖 URL
  const getThumbnailUrl = useCallback(() => {
    if (!currentMedia) return null;

    return `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/thumbnails/${currentMedia.filename}`;
  }, [currentMedia]);

  return {
    // 狀態
    currentMedia,
    currentConfig,
    mediaFiles,
    currentMediaIndex,
    isLoaded,
    duration,
    currentTime,
    error,

    // 控制方法
    playNext,
    playPrevious,
    togglePlayPause,
    seekTo,
    setVolume,
    resetPlayer,

    // 事件處理器
    handleMediaLoaded,
    handleMediaError,
    handleMediaEnded,
    handleTimeUpdate,

    // 工具方法
    getMediaUrl,
    getThumbnailUrl,

    // Ref
    mediaRef,

    // 輔助狀態
    hasNext: currentMediaIndex < mediaFiles.length - 1,
    hasPrevious: currentMediaIndex > 0,
    isPlaying: mediaRef.current ? !mediaRef.current.paused : false,
    progress: duration > 0 ? (currentTime / duration) * 100 : 0,
  };
}

/**
 * 全螢幕控制 Hook
 */
export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const enterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
    } catch (error) {
      console.error('進入全螢幕失敗:', error);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      console.error('退出全螢幕失敗:', error);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement)
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  return {
    isFullscreen,
    enterFullscreen,
    exitFullscreen,
    toggleFullscreen,
  };
}

export default useMediaPlayer;