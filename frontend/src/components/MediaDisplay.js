import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '../services/api';

/**
 * 媒體顯示組件
 */
function MediaDisplay({
  media,
  config,
  onLoad,
  onError,
  onEnded,
  onTimeUpdate,
  mediaRef,
  className = '',
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setHasError(false);

    // 處理已快取圖片（特別是行動裝置）
    // 有時快取圖片不會觸發 onLoad 事件
    if (media?.fileType === 'image') {
      const checkImageLoaded = setTimeout(() => {
        const img = document.querySelector(`img[alt="${media.originalName}"]`);
        if (img && img.complete && img.naturalHeight !== 0) {
          setImageLoaded(true);
        }
      }, 100);
      return () => clearTimeout(checkImageLoaded);
    }
  }, [media]);

  if (!media) {
    return (
      <div className={`media-container ${className}`}>
        <div className="flex flex-col items-center justify-center text-white/70">
          <div className="w-16 h-16 mb-4">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <p className="text-xl">沒有媒體檔案</p>
          <p className="text-sm mt-2">請上傳媒體檔案或檢查播放配置</p>
        </div>
      </div>
    );
  }

  // 添加時間戳避免行動裝置快取問題
  const mediaUrl = `${getApiBaseUrl()}/api/files/${media.filename}?t=${media.id}`;

  // 圖片顯示
  if (media.fileType === 'image') {
    return (
      <div className={`media-container ${className}`}>
        <AnimatePresence mode="wait">
          {hasError ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-white/70"
            >
              <div className="w-16 h-16 mb-4">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <p className="text-lg">圖片載入失敗</p>
              <p className="text-sm">{media.originalName}</p>
            </motion.div>
          ) : (
            <motion.img
              key={media.id}
              ref={mediaRef}
              src={mediaUrl}
              alt={media.originalName}
              className="media-element"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: imageLoaded ? 1 : 0,
                scale: imageLoaded ? 1 : 0.95,
              }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onLoad={() => {
                setImageLoaded(true);
                onLoad && onLoad();
              }}
              onError={(e) => {
                setHasError(true);
                onError && onError(e);
              }}
              draggable={false}
            />
          )}
        </AnimatePresence>

        {!imageLoaded && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="loading-spinner w-8 h-8"></div>
          </div>
        )}
      </div>
    );
  }

  // 影片顯示
  if (media.fileType === 'video') {
    return (
      <div className={`media-container ${className}`}>
        <motion.video
          key={media.id}
          ref={mediaRef}
          src={mediaUrl}
          className="media-element"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          autoPlay
          muted
          playsInline
          onLoadedData={onLoad}
          onError={onError}
          onEnded={onEnded}
          onTimeUpdate={onTimeUpdate}
          controls={false} // 我們會自己處理控制界面
        >
          您的瀏覽器不支援影片播放。
        </motion.video>
      </div>
    );
  }

  // 音訊顯示
  if (media.fileType === 'audio') {
    return (
      <div className={`media-container ${className}`}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center justify-center text-white"
        >
          {/* 音訊視覺化 */}
          <div className="w-32 h-32 mb-8 relative">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 opacity-20 animate-pulse"></div>
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-30 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <div className="absolute inset-8 rounded-full bg-gradient-to-br from-blue-300 to-purple-400 opacity-40 animate-pulse" style={{animationDelay: '1s'}}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
          </div>

          {/* 音訊資訊 */}
          <h3 className="text-2xl font-bold text-center mb-2 text-shadow">
            {media.originalName.replace(/\.[^/.]+$/, "")}
          </h3>
          <p className="text-white/70 text-center">正在播放音訊</p>

          {/* 隱藏的音訊元素 */}
          <audio
            ref={mediaRef}
            src={mediaUrl}
            autoPlay
            onLoadedData={onLoad}
            onError={onError}
            onEnded={onEnded}
            onTimeUpdate={onTimeUpdate}
            className="hidden"
          >
            您的瀏覽器不支援音訊播放。
          </audio>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`media-container ${className}`}>
      <div className="flex flex-col items-center justify-center text-white/70">
        <div className="w-16 h-16 mb-4">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </div>
        <p className="text-lg">不支援的媒體格式</p>
        <p className="text-sm">{media.originalName}</p>
      </div>
    </div>
  );
}

/**
 * 載入指示器組件
 */
export function LoadingIndicator({ className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="loading-spinner w-8 h-8"></div>
    </div>
  );
}

/**
 * 錯誤顯示組件
 */
export function ErrorDisplay({ message, onRetry, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center text-white/70 ${className}`}>
      <div className="w-16 h-16 mb-4">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
      </div>
      <p className="text-lg mb-4">{message || '發生錯誤'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="touch-button-primary"
        >
          重試
        </button>
      )}
    </div>
  );
}

export default MediaDisplay;