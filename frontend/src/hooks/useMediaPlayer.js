import { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { getApiBaseUrl } from '../services/api';

/**
 * 媒體播放器 Hook
 */
export function useMediaPlayer() {
  const { state, actions } = useApp();
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(true); // 新增: 靜音狀態，預設為 true

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
  const advanceToNext = useCallback(() => {
    clearImageTimer();
    actions.nextMedia();
    setError(null);
    setIsLoaded(false);
  }, [actions, clearImageTimer]);

  // 播放上一個媒體
  const playPrevious = useCallback(() => {
    clearImageTimer();
    actions.previousMedia();
    setError(null);
    setIsLoaded(false);
  }, [actions, clearImageTimer]);

  // 媒體播放結束處理 (給 video/audio 的 onEnded 事件使用)
  const handleMediaEnded = useCallback(() => {
    advanceToNext();
  }, [advanceToNext]);

  // 媒體載入完成處理
  const handleMediaLoaded = useCallback(() => {
    setIsLoaded(true);
    setError(null);
    if (mediaRef.current && (currentMedia?.fileType === 'video' || currentMedia?.fileType === 'audio')) {
      setDuration(mediaRef.current.duration || 0);
    }
  }, [currentMedia]);

  // 媒體載入錯誤處理
  const handleMediaError = useCallback((e) => {
    console.error('媒體載入錯誤:', e);
    setError('媒體載入失敗');
    setIsLoaded(false);

    // 1秒後自動切換到下一個媒體
    setTimeout(() => {
      advanceToNext();
    }, 1000);
  }, [advanceToNext]);

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
      advanceToNext();
      return;
    }

    if (mediaRef.current.paused) {
      mediaRef.current.play();
    } else {
      mediaRef.current.pause();
    }
  }, [currentMedia, advanceToNext]);

  // 新增: 切換靜音狀態
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);
  
  // 主要播放邏輯: 根據媒體類型設定計時器或依賴 onEnded 事件
  useEffect(() => {
    clearImageTimer();
    if (currentMedia && isLoaded) {
      if (currentMedia.fileType === 'image') {
        const displayDuration = (currentConfig?.imageDisplayDuration || 5) * 1000;
        imageTimerRef.current = setTimeout(advanceToNext, displayDuration);
      }
      // 對於 video/audio, 我們依賴 handleMediaEnded, 所以這裡不做任何事
    }
    return () => clearImageTimer();
  }, [currentMedia, isLoaded, currentConfig, advanceToNext, clearImageTimer]);

  // 預加載下一個媒體
  useEffect(() => {
    if (mediaFiles.length > 1) {
      const nextIndex = (currentMediaIndex + 1) % mediaFiles.length;
      const nextMedia = mediaFiles[nextIndex];
      if (nextMedia) {
        const mediaUrl = `${getApiBaseUrl()}/api/files/${nextMedia.filename}`;
        if (nextMedia.fileType === 'image') {
          const img = new Image();
          img.src = mediaUrl;
        } else if (nextMedia.fileType === 'video' || nextMedia.fileType === 'audio') {
          // 瀏覽器通常會自行處理 video/audio 的預加載，
          // 但我們可以透過創建一個元素來提示
          const mediaElement = document.createElement(nextMedia.fileType);
          mediaElement.preload = 'auto';
          mediaElement.src = mediaUrl;
        }
      }
    }
  }, [currentMediaIndex, mediaFiles]);


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
      if (volume > 0 && isMuted) {
        setIsMuted(false);
      }
    }
  }, [currentMedia, isMuted]);

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

  // 返回當前媒體的 URL
  const getMediaUrl = useCallback(() => {
    if (!currentMedia) return null;
    return `${getApiBaseUrl()}/api/files/${currentMedia.filename}`;
  }, [currentMedia]);

  // 返回縮圖 URL
  const getThumbnailUrl = useCallback(() => {
    if (!currentMedia) return null;
    return `${getApiBaseUrl()}/api/thumbnails/${currentMedia.filename}`;
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
    isMuted, // 導出 isMuted

    // 控制方法
    playNext: advanceToNext,
    playPrevious,
    togglePlayPause,
    toggleMute, // 導出 toggleMute
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
    hasNext: mediaFiles.length > 1,
    hasPrevious: mediaFiles.length > 1,
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