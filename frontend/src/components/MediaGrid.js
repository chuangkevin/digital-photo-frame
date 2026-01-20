import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mediaAPI, getApiBaseUrl } from '../services/api';
import { useApp } from '../contexts/AppContext';

/**
 * 媒體項目組件
 */
function MediaItem({ media, onSelect, onDelete, isSelected, showDetails = false }) {
  const [imageError, setImageError] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const thumbnailUrl = `${getApiBaseUrl()}/api/thumbnails/${media.filename}`;

  const handleDelete = useCallback(async () => {
    try {
      await onDelete(media.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('刪除失敗:', error);
    }
  }, [media.id, onDelete]);

  // 格式化檔案大小
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // 格式化上傳時間
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`media-item ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
      onClick={() => onSelect && onSelect(media)}
    >
      {/* 縮圖 */}
      <div className="relative w-full h-full">
        {!imageError ? (
          <img
            src={thumbnailUrl}
            alt={media.originalName}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            {media.fileType === 'image' && (
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
              </svg>
            )}
            {media.fileType === 'video' && (
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
            )}
            {media.fileType === 'audio' && (
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            )}
          </div>
        )}

        {/* 檔案類型標籤 */}
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 bg-black/70 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 rounded">
          {media.fileType.toUpperCase()}
        </div>

        {/* 選擇指示器 */}
        {isSelected && (
          <div className="absolute top-1 right-1 sm:top-2 sm:right-2 bg-blue-500 text-white rounded-full p-1">
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
          </div>
        )}

        {/* 懸浮操作按鈕 */}
        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelect && onSelect(media);
              }}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 媒體資訊 */}
      {showDetails && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 sm:p-2">
          <p className="text-white text-xs font-medium truncate">
            {media.originalName}
          </p>
          <p className="text-white/70 text-xs hidden sm:block">
            {formatFileSize(media.fileSize)} • {formatDate(media.uploadTime)}
          </p>
          <p className="text-white/70 text-xs sm:hidden">
            {formatFileSize(media.fileSize)}
          </p>
        </div>
      )}

      {/* 刪除確認對話框 */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4 z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-4 text-center max-w-xs"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm text-gray-900 mb-4">
                確定要刪除這個檔案嗎？<br/>
                <span className="font-medium">{media.originalName}</span>
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-3 py-2 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  刪除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * 媒體網格組件
 */
function MediaGrid({
  mediaList = [],
  loading = false,
  selectedItems = [],
  onItemSelect,
  onItemDelete,
  onBatchDelete,
  showDetails = false,
  className = '',
}) {
  const { dispatch, ActionTypes } = useApp();
  const [filter, setFilter] = useState('all'); // 'all', 'image', 'video', 'audio'
  const [sortBy, setSortBy] = useState('uploadTime'); // 'uploadTime', 'name', 'size'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'

  // 篩選和排序媒體列表
  const filteredAndSortedMedia = useMemo(() => {
    let filtered = mediaList;

    // 類型篩選
    if (filter !== 'all') {
      filtered = filtered.filter(media => media.fileType === filter);
    }

    // 排序
    filtered = [...filtered].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'name':
          aValue = a.originalName.toLowerCase();
          bValue = b.originalName.toLowerCase();
          break;
        case 'size':
          aValue = a.fileSize;
          bValue = b.fileSize;
          break;
        case 'uploadTime':
        default:
          aValue = new Date(a.uploadTime);
          bValue = new Date(b.uploadTime);
          break;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [mediaList, filter, sortBy, sortOrder]);

  // 處理項目選擇
  const handleItemSelect = useCallback((media) => {
    if (onItemSelect) {
      onItemSelect(media);
    }
  }, [onItemSelect]);

  // 處理項目刪除
  const handleItemDelete = useCallback(async (mediaId) => {
    try {
      await mediaAPI.delete(mediaId);

      // 更新全域狀態
      dispatch({
        type: ActionTypes.REMOVE_MEDIA,
        payload: mediaId,
      });

      onItemDelete && onItemDelete(mediaId);
    } catch (error) {
      console.error('刪除媒體失敗:', error);
      throw error;
    }
  }, [dispatch, ActionTypes, onItemDelete]);

  // 批次刪除
  const handleBatchDelete = useCallback(async () => {
    if (selectedItems.length === 0) return;

    try {
      await Promise.all(
        selectedItems.map(mediaId => mediaAPI.delete(mediaId))
      );

      // 更新全域狀態
      selectedItems.forEach(mediaId => {
        dispatch({
          type: ActionTypes.REMOVE_MEDIA,
          payload: mediaId,
        });
      });

      onBatchDelete && onBatchDelete(selectedItems);
    } catch (error) {
      console.error('批次刪除失敗:', error);
    }
  }, [selectedItems, dispatch, ActionTypes, onBatchDelete]);

  // 統計資訊
  const stats = useMemo(() => {
    const total = mediaList.length;
    const images = mediaList.filter(m => m.fileType === 'image').length;
    const videos = mediaList.filter(m => m.fileType === 'video').length;
    const audios = mediaList.filter(m => m.fileType === 'audio').length;
    const totalSize = mediaList.reduce((sum, m) => sum + m.fileSize, 0);

    return { total, images, videos, audios, totalSize };
  }, [mediaList]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
        <div className="loading-spinner w-8 h-8 mb-4"></div>
        <p className="text-gray-500">載入媒體檔案...</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 工具列 */}
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center sm:justify-between">
        {/* 篩選器 */}
        <div className="flex flex-col sm:flex-row gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="touch-input text-sm flex-1 sm:flex-initial"
          >
            <option value="all">所有檔案 ({stats.total})</option>
            <option value="image">圖片 ({stats.images})</option>
            <option value="video">影片 ({stats.videos})</option>
            <option value="audio">音訊 ({stats.audios})</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
            }}
            className="touch-input text-sm flex-1 sm:flex-initial"
          >
            <option value="uploadTime-desc">最新上傳</option>
            <option value="uploadTime-asc">最舊上傳</option>
            <option value="name-asc">名稱 A-Z</option>
            <option value="name-desc">名稱 Z-A</option>
            <option value="size-desc">檔案大小 (大→小)</option>
            <option value="size-asc">檔案大小 (小→大)</option>
          </select>
        </div>

        {/* 批次操作 */}
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center justify-between sm:justify-start space-x-2"
          >
            <span className="text-xs sm:text-sm text-gray-600">
              已選擇 {selectedItems.length} 個
            </span>
            <button
              onClick={handleBatchDelete}
              className="touch-button-danger text-xs sm:text-sm px-3 sm:px-4 py-2"
            >
              批次刪除
            </button>
          </motion.div>
        )}
      </div>

      {/* 統計資訊 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">媒體庫統計</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">總數量</span>
            <div className="font-semibold">{stats.total}</div>
          </div>
          <div>
            <span className="text-gray-500">圖片</span>
            <div className="font-semibold text-blue-600">{stats.images}</div>
          </div>
          <div>
            <span className="text-gray-500">影片</span>
            <div className="font-semibold text-green-600">{stats.videos}</div>
          </div>
          <div>
            <span className="text-gray-500">音訊</span>
            <div className="font-semibold text-purple-600">{stats.audios}</div>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          總容量: {(stats.totalSize / 1024 / 1024).toFixed(1)} MB
        </div>
      </div>

      {/* 媒體網格 */}
      {filteredAndSortedMedia.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {filter === 'all' ? '沒有媒體檔案' : `沒有${filter === 'image' ? '圖片' : filter === 'video' ? '影片' : '音訊'}檔案`}
          </h3>
          <p className="text-gray-500">
            {filter === 'all' ? '開始上傳一些照片、影片或音樂吧！' : '嘗試上傳其他類型的檔案或更改篩選條件'}
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="media-grid"
        >
          <AnimatePresence>
            {filteredAndSortedMedia.map((media) => (
              <MediaItem
                key={media.id}
                media={media}
                onSelect={handleItemSelect}
                onDelete={handleItemDelete}
                isSelected={selectedItems.includes(media.id)}
                showDetails={showDetails}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

export default MediaGrid;