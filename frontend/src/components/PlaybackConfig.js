import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playbackAPI, playlistAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';

/**
 * 播放配置表單組件
 */
function PlaybackConfigForm({ config = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    modeType: 'library_sequence',
    imageDisplayDuration: 5,
    videoLoop: true,
    audioLoop: true,
    sequenceRandom: false,
    ...config,
  });

  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '請輸入配置名稱';
    }

    if (formData.imageDisplayDuration < 1 || formData.imageDisplayDuration > 60) {
      newErrors.imageDisplayDuration = '顯示時間必須在 1-60 秒之間';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setSaving(true);
    try {
      let savedConfig;
      if (config) {
        // 更新現有配置
        savedConfig = await playbackAPI.updateConfig(config.id, formData);
      } else {
        // 建立新配置
        savedConfig = await playbackAPI.createConfig(formData);
      }

      onSave && onSave(savedConfig.data);
    } catch (error) {
      console.error('儲存配置失敗:', error);
      setErrors({ submit: error.response?.data?.message || '儲存失敗' });
    } finally {
      setSaving(false);
    }
  }, [config, formData, validateForm, onSave]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本資訊 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          配置名稱 *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="例如：客廳展示模式"
          className={`touch-input ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
      </div>

      {/* 播放模式 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          播放模式 *
        </label>
        <div className="space-y-3">
          <label className="flex items-start space-x-3">
            <input
              type="radio"
              value="library_sequence"
              checked={formData.modeType === 'library_sequence'}
              onChange={(e) => handleChange('modeType', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">媒體庫循序播放</div>
              <div className="text-sm text-gray-500">
                自動播放媒體庫中的所有檔案，支援順序或隨機播放
              </div>
            </div>
          </label>

          <label className="flex items-start space-x-3">
            <input
              type="radio"
              value="fixed_media"
              checked={formData.modeType === 'fixed_media'}
              onChange={(e) => handleChange('modeType', e.target.value)}
              className="mt-1"
            />
            <div>
              <div className="font-medium">固定媒體播放</div>
              <div className="text-sm text-gray-500">
                播放手動選擇的特定媒體檔案清單
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* 圖片設定 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          圖片顯示時間 (秒)
        </label>
        <input
          type="number"
          min="1"
          max="60"
          value={formData.imageDisplayDuration}
          onChange={(e) => handleChange('imageDisplayDuration', parseInt(e.target.value))}
          className={`touch-input ${errors.imageDisplayDuration ? 'border-red-500' : ''}`}
        />
        {errors.imageDisplayDuration && (
          <p className="text-red-500 text-sm mt-1">{errors.imageDisplayDuration}</p>
        )}
        <p className="text-sm text-gray-500 mt-1">
          每張圖片顯示的時間，範圍：1-60 秒
        </p>
      </div>

      {/* 播放選項 */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-700">播放選項</h4>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.videoLoop}
            onChange={(e) => handleChange('videoLoop', e.target.checked)}
            className="rounded"
          />
          <div>
            <div className="font-medium">影片循環播放</div>
            <div className="text-sm text-gray-500">影片播放完畢後自動重新開始</div>
          </div>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.audioLoop}
            onChange={(e) => handleChange('audioLoop', e.target.checked)}
            className="rounded"
          />
          <div>
            <div className="font-medium">音訊循環播放</div>
            <div className="text-sm text-gray-500">音訊播放完畢後自動重新開始</div>
          </div>
        </label>

        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={formData.sequenceRandom}
            onChange={(e) => handleChange('sequenceRandom', e.target.checked)}
            className="rounded"
          />
          <div>
            <div className="font-medium">隨機播放順序</div>
            <div className="text-sm text-gray-500">隨機播放媒體檔案，而不是按順序</div>
          </div>
        </label>
      </div>

      {/* 提交錯誤 */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-600 text-sm">{errors.submit}</p>
        </div>
      )}

      {/* 按鈕 */}
      <div className="flex space-x-3">
        <button
          type="submit"
          disabled={saving}
          className="touch-button-primary flex-1"
        >
          {saving ? (
            <span className="flex items-center justify-center">
              <div className="loading-spinner w-4 h-4 mr-2"></div>
              {config ? '更新中...' : '建立中...'}
            </span>
          ) : (
            config ? '更新配置' : '建立配置'
          )}
        </button>

        <button
          type="button"
          onClick={onCancel}
          className="touch-button-secondary"
        >
          取消
        </button>
      </div>
    </form>
  );
}

/**
 * 播放配置項目組件
 */
function PlaybackConfigItem({ config, onEdit, onDelete, onActivate, onManagePlaylist }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActivate = useCallback(async () => {
    setLoading(true);
    try {
      await onActivate(config.id);
    } catch (error) {
      console.error('啟用配置失敗:', error);
    } finally {
      setLoading(false);
    }
  }, [config.id, onActivate]);

  const handleDelete = useCallback(async () => {
    setLoading(true);
    try {
      await onDelete(config.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('刪除配置失敗:', error);
      setLoading(false);
    }
  }, [config.id, onDelete]);

  return (
    <div className="admin-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-medium text-gray-900">
              {config.name}
            </h3>
            {config.isActive && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                啟用中
              </span>
            )}
          </div>

          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p>
              模式：
              <span className="font-medium ml-1">
                {config.modeType === 'library_sequence' ? '媒體庫循序播放' : '固定媒體播放'}
              </span>
            </p>
            <p>圖片顯示時間：{config.imageDisplayDuration} 秒</p>
            <div className="flex space-x-4">
              <span>影片循環：{config.videoLoop ? '是' : '否'}</span>
              <span>音訊循環：{config.audioLoop ? '是' : '否'}</span>
              <span>隨機播放：{config.sequenceRandom ? '是' : '否'}</span>
            </div>
          </div>

          {config.playlistItems && config.modeType === 'fixed_media' && (
            <p className="text-sm text-gray-500 mt-2">
              播放清單：{config.playlistItems.length} 個檔案
            </p>
          )}
        </div>

        <div className="flex flex-col space-y-2 ml-4">
          {!config.isActive ? (
            <button
              onClick={handleActivate}
              disabled={loading}
              className="touch-button-primary text-sm px-4 py-2"
            >
              {loading ? '啟用中...' : '啟用'}
            </button>
          ) : (
            <span className="text-sm text-green-600 font-medium px-4 py-2">
              目前啟用
            </span>
          )}

          <button
            onClick={() => onEdit(config)}
            className="touch-button-secondary text-sm px-4 py-2"
          >
            編輯
          </button>

          {config.modeType === 'fixed_media' && (
            <button
              onClick={() => onManagePlaylist(config)}
              className="text-sm px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
            >
              管理清單
            </button>
          )}

          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={config.isActive}
            className={`text-sm px-4 py-2 rounded-lg ${
              config.isActive
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            刪除
          </button>
        </div>
      </div>

      {/* 刪除確認對話框 */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                確定刪除配置？
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                將會刪除「{config.name}」配置及其播放清單，此操作無法復原。
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 touch-button-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 touch-button-danger"
                >
                  {loading ? '刪除中...' : '確定刪除'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * 播放配置管理組件
 */
function PlaybackConfig() {
  const { state, actions } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [loading, setLoading] = useState(false);

  const { configs, loading: configsLoading } = state.playback;

  // 載入配置列表 (只在組件掛載時執行一次)
  useEffect(() => {
    actions.loadPlaybackConfigs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 處理配置儲存
  const handleConfigSave = useCallback(async (savedConfig) => {
    setShowForm(false);
    setEditingConfig(null);
    await actions.loadPlaybackConfigs(); // 重新載入列表
  }, [actions]);

  // 處理配置編輯
  const handleConfigEdit = useCallback((config) => {
    setEditingConfig(config);
    setShowForm(true);
  }, []);

  // 處理配置刪除
  const handleConfigDelete = useCallback(async (configId) => {
    try {
      await playbackAPI.deleteConfig(configId);
      await actions.loadPlaybackConfigs();
    } catch (error) {
      console.error('刪除配置失敗:', error);
    }
  }, [actions]);

  // 處理配置啟用
  const handleConfigActivate = useCallback(async (configId) => {
    try {
      await playbackAPI.activateConfig(configId);
      await actions.loadPlaybackConfigs();
    } catch (error) {
      console.error('啟用配置失敗:', error);
    }
  }, [actions]);

  // 處理播放清單管理
  const handleManagePlaylist = useCallback((config) => {
    // 這裡可以開啟播放清單管理界面
    console.log('管理播放清單:', config);
  }, []);

  // 取消表單
  const handleFormCancel = useCallback(() => {
    setShowForm(false);
    setEditingConfig(null);
  }, []);

  return (
    <div className="space-y-6">
      {/* 標題和新增按鈕 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">播放配置</h2>
        <button
          onClick={() => setShowForm(true)}
          className="touch-button-primary"
        >
          新增配置
        </button>
      </div>

      {/* 配置表單 */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="admin-card"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingConfig ? '編輯播放配置' : '新增播放配置'}
            </h3>
            <PlaybackConfigForm
              config={editingConfig}
              onSave={handleConfigSave}
              onCancel={handleFormCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 配置列表 */}
      {configsLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="loading-spinner w-6 h-6 mr-3"></div>
          <span className="text-gray-500">載入配置中...</span>
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.43-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z"/>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            尚未建立播放配置
          </h3>
          <p className="text-gray-500 mb-4">
            建立第一個播放配置來開始使用數位相框
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="touch-button-primary"
          >
            建立第一個配置
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {configs.map((config) => (
              <motion.div
                key={config.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PlaybackConfigItem
                  config={config}
                  onEdit={handleConfigEdit}
                  onDelete={handleConfigDelete}
                  onActivate={handleConfigActivate}
                  onManagePlaylist={handleManagePlaylist}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

export default PlaybackConfig;