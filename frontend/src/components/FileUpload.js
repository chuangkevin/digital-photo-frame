import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { mediaAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';

/**
 * 檔案上傳組件
 */
function FileUpload({ onUploadComplete, className = '' }) {
  const { actions, ActionTypes, dispatch } = useApp();
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isDragActive, setIsDragActive] = useState(false);

  // 支援的檔案類型
  const acceptedFileTypes = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    'video/*': ['.mp4', '.webm', '.avi'],
    'audio/*': ['.mp3', '.wav', '.ogg'],
  };

  // 處理檔案上傳
  const uploadFile = useCallback(async (file) => {
    const uploadId = `upload_${Date.now()}_${file.name}`;

    // 新增到上傳佇列
    setUploadQueue(prev => [...prev, {
      id: uploadId,
      file,
      progress: 0,
      status: 'uploading',
      error: null,
    }]);

    try {
      const formData = new FormData();
      formData.append('media', file);

      // 上傳檔案
      const response = await mediaAPI.upload(formData, (progress) => {
        setUploadQueue(prev => prev.map(item =>
          item.id === uploadId
            ? { ...item, progress }
            : item
        ));
      });

      // 更新上傳狀態為成功
      setUploadQueue(prev => prev.map(item =>
        item.id === uploadId
          ? { ...item, status: 'completed', progress: 100 }
          : item
      ));

      // 更新全域媒體列表
      dispatch({
        type: ActionTypes.ADD_MEDIA,
        payload: response.data,
      });

      // 回調通知
      onUploadComplete && onUploadComplete(response.data);

      // 3秒後移除完成的項目
      setTimeout(() => {
        setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
      }, 3000);

    } catch (error) {
      console.error('上傳失敗:', error);

      // 更新上傳狀態為失敗
      setUploadQueue(prev => prev.map(item =>
        item.id === uploadId
          ? {
              ...item,
              status: 'error',
              error: error.response?.data?.message || '上傳失敗',
            }
          : item
      ));
    }
  }, [dispatch, ActionTypes, onUploadComplete]);

  // 處理檔案拖放
  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setIsDragActive(false);

    // 處理被拒絕的檔案
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(rejection =>
        `${rejection.file.name}: ${rejection.errors.map(e => e.message).join(', ')}`
      ).join('\n');

      alert(`以下檔案無法上傳:\n${errors}`);
    }

    // 上傳接受的檔案
    for (const file of acceptedFiles) {
      await uploadFile(file);
    }
  }, [uploadFile]);

  const onDragEnter = useCallback(() => {
    setIsDragActive(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragActive(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive: dropzoneActive } = useDropzone({
    onDrop,
    onDragEnter,
    onDragLeave,
    accept: acceptedFileTypes,
    multiple: true,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  // 移除上傳項目
  const removeUploadItem = useCallback((uploadId) => {
    setUploadQueue(prev => prev.filter(item => item.id !== uploadId));
  }, []);

  // 重試上傳
  const retryUpload = useCallback((uploadItem) => {
    removeUploadItem(uploadItem.id);
    uploadFile(uploadItem.file);
  }, [removeUploadItem, uploadFile]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 上傳區域 */}
      <div
        {...getRootProps()}
        className={`upload-zone ${dropzoneActive || isDragActive ? 'drag-active' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
            </svg>
          </div>

          <h3 className="text-lg font-medium mb-2">
            {dropzoneActive || isDragActive ? '放開以上傳檔案' : '拖放檔案到這裡'}
          </h3>

          <p className="text-gray-500 mb-4 text-center">
            或點擊選擇檔案<br/>
            支援圖片、影片、音訊格式 (最大 100MB)
          </p>

          <button className="touch-button-primary">
            選擇檔案
          </button>
        </div>
      </div>

      {/* 上傳進度列表 */}
      <AnimatePresence>
        {uploadQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium text-gray-700">上傳進度</h4>

            {uploadQueue.map((upload) => (
              <motion.div
                key={upload.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-gray-50 rounded-lg p-3 border"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {upload.file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(upload.file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>

                  {/* 狀態指示器 */}
                  <div className="ml-3 flex items-center">
                    {upload.status === 'uploading' && (
                      <div className="flex items-center">
                        <div className="loading-spinner w-4 h-4 mr-2"></div>
                        <span className="text-sm text-blue-600">
                          {upload.progress}%
                        </span>
                      </div>
                    )}

                    {upload.status === 'completed' && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        <span className="text-sm text-green-600">完成</span>
                      </div>
                    )}

                    {upload.status === 'error' && (
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-red-500 mr-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <button
                          onClick={() => retryUpload(upload)}
                          className="text-sm text-red-600 underline"
                        >
                          重試
                        </button>
                      </div>
                    )}

                    {/* 關閉按鈕 */}
                    {upload.status !== 'uploading' && (
                      <button
                        onClick={() => removeUploadItem(upload.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* 進度條 */}
                {upload.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${upload.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* 錯誤訊息 */}
                {upload.status === 'error' && upload.error && (
                  <p className="text-xs text-red-600 mt-1">
                    {upload.error}
                  </p>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FileUpload;