import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import MediaGrid from '../components/MediaGrid';
import PlaybackConfig from '../components/PlaybackConfig';
import { useApp } from '../contexts/AppContext';
import { displayAPI } from '../services/api';

/**
 * 系統狀態組件
 */
function SystemStatus() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatus = async () => {
      try {
        const response = await displayAPI.getSystemStatus();
        setStatus(response.data);
      } catch (error) {
        console.error('載入系統狀態失敗:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 30000); // 每30秒更新

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="admin-card">
        <div className="flex items-center justify-center py-4">
          <div className="loading-spinner w-5 h-5 mr-2"></div>
          <span className="text-gray-500">載入系統狀態...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">系統狀態</h3>

      {status ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-2">
            <div className="text-xl sm:text-2xl font-bold text-blue-600">
              {status.mediaCount}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">總檔案數</div>
          </div>

          <div className="text-center p-2">
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {status.breakdown.images}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">圖片</div>
          </div>

          <div className="text-center p-2">
            <div className="text-xl sm:text-2xl font-bold text-purple-600">
              {status.breakdown.videos}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">影片</div>
          </div>

          <div className="text-center p-2">
            <div className="text-xl sm:text-2xl font-bold text-orange-600">
              {status.breakdown.audios}
            </div>
            <div className="text-xs sm:text-sm text-gray-500">音訊</div>
          </div>
        </div>
      ) : (
        <p className="text-red-500 text-center">無法載入系統狀態</p>
      )}

      {status?.activeConfig && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <div>
              <div className="font-medium text-green-800">
                目前播放模式：{status.activeConfig.name}
              </div>
              <div className="text-sm text-green-600">
                {status.activeConfig.modeType === 'library_sequence' ? '媒體庫循序播放' : '固定媒體播放'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 管理頁面主組件
 */
function AdminPage() {
  const navigate = useNavigate();
  const { state, actions } = useApp();
  const [activeTab, setActiveTab] = useState('media'); // 'media', 'upload', 'playback', 'status'
  const [selectedMedia, setSelectedMedia] = useState([]);

  // 載入媒體列表 (只在組件掛載時執行一次)
  useEffect(() => {
    actions.loadMediaList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 處理檔案上傳完成
  const handleUploadComplete = useCallback((uploadedFile) => {
    // 媒體列表會自動更新（在 FileUpload 組件中處理）
    console.log('檔案上傳完成:', uploadedFile);
  }, []);

  // 處理媒體項目選擇
  const handleMediaSelect = useCallback((media) => {
    setSelectedMedia(prev => {
      const isSelected = prev.includes(media.id);
      if (isSelected) {
        return prev.filter(id => id !== media.id);
      } else {
        return [...prev, media.id];
      }
    });
  }, []);

  // 處理媒體項目刪除
  const handleMediaDelete = useCallback((mediaId) => {
    setSelectedMedia(prev => prev.filter(id => id !== mediaId));
  }, []);

  // 處理批次刪除
  const handleBatchDelete = useCallback((deletedIds) => {
    setSelectedMedia([]);
  }, []);

  // 返回展示頁面
  const goToDisplay = useCallback(() => {
    navigate('/');
  }, [navigate]);

  // 標籤配置
  const tabs = [
    {
      id: 'media',
      name: '媒體管理',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
        </svg>
      ),
    },
    {
      id: 'upload',
      name: '檔案上傳',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
        </svg>
      ),
    },
    {
      id: 'playback',
      name: '播放設定',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
        </svg>
      ),
    },
    {
      id: 'status',
      name: '系統狀態',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 頁首 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={goToDisplay}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
                </svg>
              </button>
              <h1 className="text-base sm:text-xl font-semibold text-gray-900">
                數位相框管理
              </h1>
            </div>

            <button
              onClick={goToDisplay}
              className="touch-button-primary text-sm sm:text-base px-3 sm:px-4 py-2"
            >
              <span className="hidden sm:inline">返回展示</span>
              <span className="sm:hidden">返回</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 側邊欄 - 桌面版 */}
        <nav className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-gray-200">
          <div className="flex-1 pt-8 pb-4 px-4 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </nav>

        {/* 主要內容區域 */}
        <main className="flex-1 p-4 sm:p-6">
          {/* 行動版標籤切換 */}
          <div className="lg:hidden mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto pb-px">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {tab.icon}
                      <span>{tab.name}</span>
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 內容區域 */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">媒體管理</h2>
                  <MediaGrid
                    mediaList={state.media.list}
                    loading={state.media.loading}
                    selectedItems={selectedMedia}
                    onItemSelect={handleMediaSelect}
                    onItemDelete={handleMediaDelete}
                    onBatchDelete={handleBatchDelete}
                    showDetails={true}
                  />
                </div>
              )}

              {activeTab === 'upload' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">檔案上傳</h2>
                  <FileUpload onUploadComplete={handleUploadComplete} />
                </div>
              )}

              {activeTab === 'playback' && (
                <PlaybackConfig />
              )}

              {activeTab === 'status' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">系統狀態</h2>
                  <SystemStatus />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* 錯誤提示 */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">錯誤</p>
                <p className="text-sm">{state.error}</p>
              </div>
              <button
                onClick={actions.clearError}
                className="ml-4 p-1 hover:bg-red-600 rounded"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminPage;