import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getApiBaseUrl } from '../services/api';

/**
 * 媒體預覽對話框
 */
function MediaPreview({ media, onClose }) {
  const videoRef = useRef(null);

  // ESC 鍵關閉
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // 暫停背景滾動
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!media) return null;

  const mediaUrl = `${getApiBaseUrl()}/api/media/${media.filename}`;

  // 格式化檔案大小
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        onClick={onClose}
      >
        <div className="w-full h-full flex flex-col">
          {/* 頂部工具列 */}
          <div className="flex items-center justify-between p-4 bg-black/50">
            <div className="flex-1">
              <h3 className="text-white font-medium truncate max-w-md">
                {media.originalName}
              </h3>
              <p className="text-white/70 text-sm">
                {media.fileType.toUpperCase()} • {formatFileSize(media.fileSize)}
              </p>
            </div>

            <button
              onClick={onClose}
              className="ml-4 p-2 text-white active:bg-white/20 rounded-lg transition-colors touch-manipulation"
              aria-label="關閉預覽"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>

          {/* 媒體內容 */}
          <div
            className="flex-1 flex items-center justify-center p-4 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {media.fileType === 'image' && (
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={mediaUrl}
                alt={media.originalName}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {media.fileType === 'video' && (
              <motion.video
                ref={videoRef}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={mediaUrl}
                controls
                autoPlay
                className="max-w-full max-h-full"
              />
            )}

            {media.fileType === 'audio' && (
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 mb-6 text-white/50">
                  <svg fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <audio
                  src={mediaUrl}
                  controls
                  autoPlay
                  className="w-full max-w-md"
                />
              </div>
            )}
          </div>

          {/* 底部資訊 */}
          <div className="p-4 bg-black/50">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm max-w-4xl mx-auto">
              <div>
                <span className="text-white/70">檔案名稱</span>
                <div className="text-white font-medium truncate">{media.filename}</div>
              </div>
              <div>
                <span className="text-white/70">原始名稱</span>
                <div className="text-white font-medium truncate">{media.originalName}</div>
              </div>
              <div>
                <span className="text-white/70">上傳時間</span>
                <div className="text-white font-medium">{formatDate(media.uploadTime)}</div>
              </div>
              <div>
                <span className="text-white/70">檔案大小</span>
                <div className="text-white font-medium">{formatFileSize(media.fileSize)}</div>
              </div>
            </div>

            {media.tags && media.tags.length > 0 && (
              <div className="mt-4 max-w-4xl mx-auto">
                <span className="text-white/70 text-sm">標籤</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {media.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-white/20 text-white text-sm rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default MediaPreview;
