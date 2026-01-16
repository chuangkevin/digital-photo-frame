import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * 媒體控制組件
 */
function MediaControls({
  show,
  media,
  isPlaying,
  currentTime,
  duration,
  progress,
  onPlayPause,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onAdminClick,
  hasNext,
  hasPrevious,
  className = '',
}) {
  const [volume, setVolume] = useState(1);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  // 格式化時間顯示
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 處理音量變更
  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    onVolumeChange && onVolumeChange(newVolume);
  };

  // 處理進度條點擊
  const handleProgressClick = (e) => {
    if (!onSeek || !duration || media?.fileType === 'image') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = duration * percentage;

    onSeek(newTime);
  };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* 管理入口按鈕 - 右上角 */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="floating-control top-4 right-4"
            onClick={(e) => {
              e.stopPropagation();
              onAdminClick && onAdminClick();
            }}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </motion.button>

          {/* 播放控制 - 底部中央 */}
          {media && media.fileType !== 'image' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.2 }}
              className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-2xl p-4 ${className}`}
            >
              {/* 進度條 */}
              {duration > 0 && (
                <div className="mb-4 px-2">
                  <div
                    className="w-64 h-2 bg-white/20 rounded-full cursor-pointer"
                    onClick={handleProgressClick}
                  >
                    <div
                      className="h-full bg-white rounded-full transition-all duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="flex justify-between mt-1 text-xs text-white/70">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* 控制按鈕 */}
              <div className="flex items-center justify-center space-x-4">
                {/* 上一個 */}
                <button
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>

                {/* 播放/暫停 */}
                <button
                  onClick={onPlayPause}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>

                {/* 下一個 */}
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className="p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>

                {/* 音量控制 */}
                {media.fileType === 'video' || media.fileType === 'audio' ? (
                  <div className="relative">
                    <button
                      onClick={() => setShowVolumeSlider(!showVolumeSlider)}
                      className="p-2 rounded-full hover:bg-white/10 transition-all"
                    >
                      {volume > 0.5 ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                        </svg>
                      ) : volume > 0 ? (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
                        </svg>
                      )}
                    </button>

                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-black/80 rounded-lg p-2"
                        >
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                            className="w-20 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : null}
              </div>
            </motion.div>
          )}

          {/* 圖片專用控制 */}
          {media && media.fileType === 'image' && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.2 }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-2xl p-4"
            >
              <div className="flex items-center justify-center space-x-6">
                {/* 上一個 */}
                <button
                  onClick={onPrevious}
                  disabled={!hasPrevious}
                  className="p-3 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                  </svg>
                </button>

                {/* 暫停/繼續圖片輪播 */}
                <button
                  onClick={onPlayPause}
                  className="p-3 rounded-full bg-white/20 hover:bg-white/30 transition-all"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                </button>

                {/* 下一個 */}
                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className="p-3 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
}

export default MediaControls;