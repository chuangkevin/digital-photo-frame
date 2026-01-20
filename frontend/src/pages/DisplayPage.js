import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import MediaDisplay, { LoadingIndicator, ErrorDisplay } from '../components/MediaDisplay';
import MediaControls from '../components/MediaControls';
import { useApp } from '../contexts/AppContext';
import useMediaPlayer from '../hooks/useMediaPlayer';
import useTouch from '../hooks/useTouch';
import { useBrightnessControl } from '../hooks/useBrightnessControl';
import { joinDisplayRoom, onSocketEvent, SocketEvents, disconnectSocket } from '../services/socketService';

/**
 * 展示頁面 - 數位相框的主要顯示界面
 */
function DisplayPage() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [loadStats, setLoadStats] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    currentMedia,
    currentConfig,
    mediaFiles,
    currentMediaIndex,
    isLoaded,
    duration,
    currentTime,
    error,
    playNext,
    playPrevious,
    togglePlayPause,
    seekTo,
    setVolume,
    handleMediaLoaded,
    handleMediaError,
    handleMediaEnded,
    handleTimeUpdate,
    getMediaUrl,
    mediaRef,
    hasNext,
    hasPrevious,
    isPlaying,
    progress,
    isMuted,
    toggleMute,
  } = useMediaPlayer();

  // 亮度控制
  const brightnessControl = useBrightnessControl(currentConfig);

  // 處理觸控手勢
  const { touchRef } = useTouch({
    onTap: (e) => {
      // 如果點擊的目標是按鈕或在按鈕內，則不執行任何操作
      if (e.target.closest('button')) {
        return;
      }
      actions.showControls();
    },
    onSwipeLeft: () => {
      if (hasNext) playNext();
    },
    onSwipeRight: () => {
      if (hasPrevious) playPrevious();
    },
    onLongPress: () => {
      // 長按顯示/隱藏控制項
      if (state.display.showControls) {
        actions.hideControls();
      } else {
        actions.showControls();
      }
    },
  });

  // 載入展示資料
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      await actions.loadDisplayData();
      setRetryCount(0);
    } catch (error) {
      console.error('載入展示資料失敗:', error);
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 全螢幕切換功能
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // 進入全螢幕
        await document.documentElement.requestFullscreen();
      } else {
        // 退出全螢幕
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('全螢幕切換失敗:', error);
    }
  }, []);

  // 監聽全螢幕狀態變化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 初始化載入 (只在組件掛載時執行一次)
  useEffect(() => {
    // 添加 display-mode class 以禁用滾動
    document.body.classList.add('display-mode');
    loadData();

    return () => {
      // 離開時移除 class
      document.body.classList.remove('display-mode');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // WebSocket 連接 - 監聽即時更新
  useEffect(() => {
    // 加入展示頁面房間
    joinDisplayRoom();

    // 監聽刷新事件
    const unsubscribeRefresh = onSocketEvent(SocketEvents.REFRESH_DISPLAY, () => {
      console.log('📡 收到刷新通知，重新載入展示資料...');
      loadData();
    });

    // 監聽配置啟用事件
    const unsubscribeConfig = onSocketEvent(SocketEvents.CONFIG_ACTIVATED, (data) => {
      console.log('📡 收到配置啟用通知:', data);
      loadData();
    });

    // 監聽配置更新事件
    const unsubscribeConfigUpdate = onSocketEvent(SocketEvents.CONFIG_UPDATED, (data) => {
      console.log('📡 收到配置更新通知:', data);
      loadData();
    });

    // 監聯播放清單更新事件
    const unsubscribePlaylist = onSocketEvent(SocketEvents.PLAYLIST_UPDATED, (data) => {
      console.log('📡 收到播放清單更新通知:', data);
      loadData();
    });

    return () => {
      unsubscribeRefresh();
      unsubscribeConfig();
      unsubscribeConfigUpdate();
      unsubscribePlaylist();
      disconnectSocket();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 錯誤重試
  const handleRetry = useCallback(() => {
    loadData();
  }, [loadData]);

  // 媒體載入完成
  const handleMediaLoadComplete = useCallback((e, stats) => {
    handleMediaLoaded();
    if (stats) {
      setLoadStats(stats);
    }
  }, [handleMediaLoaded]);

  // 媒體載入錯誤
  const handleMediaErrorOccurred = useCallback((e) => {
    console.error('媒體載入錯誤:', e);
    handleMediaError(e);
  }, [handleMediaError]);

  // 導航到管理頁面
  const goToAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  // 處理音量變更
  const handleVolumeChange = useCallback((volume) => {
    setVolume(volume);
  }, [setVolume]);

  // 鍵盤快捷鍵
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (hasPrevious) playPrevious();
          break;
        case 'ArrowRight':
          if (hasNext) playNext();
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'Escape':
          actions.hideControls();
          break;
        case 'Enter':
          actions.showControls();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [hasNext, hasPrevious, playNext, playPrevious, togglePlayPause, actions]);

  // 如果正在載入
  if (isLoading && mediaFiles.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <LoadingIndicator className="mb-4" />
        <p className="text-lg">載入展示內容...</p>
        <p className="text-sm text-white/60 mt-2">
          {retryCount > 0 && `重試 ${retryCount} 次`}
        </p>
      </div>
    );
  }

  // 如果沒有媒體檔案
  if (!isLoading && mediaFiles.length === 0) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6">
            <svg className="w-full h-full text-white/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">歡迎使用數位相框</h2>
          <p className="text-white/70 mb-6 text-lg">
            目前沒有可顯示的媒體檔案
          </p>
          <p className="text-white/50 mb-8">
            請先上傳一些照片、影片或音樂檔案
          </p>
          <button
            onClick={goToAdmin}
            className="touch-button-primary text-lg px-8 py-4"
          >
            前往管理頁面
          </button>
        </motion.div>

        {/* 浮動管理按鈕 */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="floating-control top-4 right-4"
          onClick={goToAdmin}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
          </svg>
        </motion.button>
      </div>
    );
  }

  // 如果有載入錯誤
  if (error && retryCount >= 3) {
    return (
      <div className="w-full h-screen flex flex-col items-center justify-center bg-black">
        <ErrorDisplay
          message={`無法載入展示內容: ${error}`}
          onRetry={handleRetry}
        />
      </div>
    );
  }

  return (
    <div
      ref={touchRef}
      onClick={() => actions.showControls()}
      className="w-full h-screen bg-black relative overflow-hidden select-none cursor-pointer"
      style={{
        filter: `brightness(${brightnessControl.currentBrightness}%)`,
        transition: 'filter 1s ease-in-out',
      }}
    >
      {/* 主要媒體顯示區域 */}
      <AnimatePresence mode="wait">
        <MediaDisplay
          key={currentMedia?.id || 'no-media'}
          media={currentMedia}
          config={currentConfig}
          isMuted={isMuted}
          onLoad={handleMediaLoadComplete}
          onError={handleMediaErrorOccurred}
          onEnded={handleMediaEnded}
          onTimeUpdate={handleTimeUpdate}
          mediaRef={mediaRef}
          className="w-full h-full"
        />
      </AnimatePresence>

      {/* 媒體控制界面 */}
      <MediaControls
        show={state.display.showControls}
        media={currentMedia}
        isPlaying={isPlaying}
        isMuted={isMuted}
        currentTime={currentTime}
        duration={duration}
        progress={progress}
        onPlayPause={togglePlayPause}
        onPrevious={playPrevious}
        onNext={playNext}
        onSeek={seekTo}
        onVolumeChange={handleVolumeChange}
        onToggleMute={toggleMute}
        onAdminClick={goToAdmin}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
        brightnessControl={brightnessControl}
      />

      {/* 載入指示器 */}
      {currentMedia && !isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <LoadingIndicator />
        </div>
      )}

      {/* 媒體資訊 - 僅在顯示控制項時顯示 */}
      <AnimatePresence>
        {state.display.showControls && currentMedia && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white"
          >
            <h3 className="font-medium text-sm text-shadow">
              {currentMedia.originalName}
            </h3>
            <p className="text-xs text-white/70 mt-1">
              {currentMediaIndex + 1} / {mediaFiles.length}
              {currentConfig && (
                <span className="ml-2">• {currentConfig.name}</span>
              )}
            </p>
            {loadStats && (
              <div className="text-xs text-white/60 mt-2 pt-2 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <span>
                    {loadStats.fromCache ? '📦 快取' : '🌐 網路'}
                  </span>
                  <span>•</span>
                  <span>
                    {loadStats.loadTime < 1000
                      ? `${Math.round(loadStats.loadTime)}ms`
                      : `${(loadStats.loadTime / 1000).toFixed(2)}s`
                    }
                  </span>
                  <span>•</span>
                  <span>
                    {(loadStats.fileSize / 1024 / 1024).toFixed(2)}MB
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 全螢幕按鈕 - 右下角 */}
      <AnimatePresence>
        {state.display.showControls && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={toggleFullscreen}
            className="fixed bottom-20 right-4 z-50 bg-black/70 backdrop-blur-sm rounded-lg p-3 text-white active:bg-black/90 transition-colors touch-manipulation"
            aria-label={isFullscreen ? '退出全螢幕' : '進入全螢幕'}
          >
            {isFullscreen ? (
              // 退出全螢幕圖示
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M15 9h4.5M15 9V4.5M15 9l5.25-5.25M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
              </svg>
            ) : (
              // 進入全螢幕圖示
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* 錯誤提示 */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-20 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg p-4 text-white"
          >
            <p className="font-medium">錯誤</p>
            <p className="text-sm mt-1">{state.error}</p>
            <button
              onClick={actions.clearError}
              className="text-xs underline mt-2 opacity-80 active:opacity-100 touch-manipulation"
            >
              關閉
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DisplayPage;