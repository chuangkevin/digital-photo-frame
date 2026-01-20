import { useState, useEffect, useCallback } from 'react';

/**
 * 亮度控制自訂 Hook
 *
 * 功能：
 * 1. 自動根據時間範圍調整亮度（夜間/日間）
 * 2. 支援手動切換模式
 * 3. 使用 sessionStorage 持久化使用者選擇
 * 4. 手動模式會持續有效，直到使用者再次切換（覆蓋自動設定）
 */
export const useBrightnessControl = (playbackConfig) => {
  // 從 sessionStorage 讀取上次的模式設定
  const [brightnessMode, setBrightnessMode] = useState(() => {
    return sessionStorage.getItem('brightnessMode') || 'auto';
  });

  const [currentBrightness, setCurrentBrightness] = useState(100);
  const [isNightTime, setIsNightTime] = useState(false);

  /**
   * 檢查當前是否在夜間時間範圍
   */
  const checkIsNightTime = useCallback((config) => {
    if (!config?.nightModeEnabled) return false;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = config.nightModeStartTime.split(':').map(Number);
    const [endHour, endMin] = config.nightModeEndTime.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // 處理跨午夜情況（例如 22:00 - 07:00）
    if (startTime > endTime) {
      return currentTime >= startTime || currentTime < endTime;
    } else {
      return currentTime >= startTime && currentTime < endTime;
    }
  }, []);

  /**
   * 計算應該使用的亮度
   */
  const calculateBrightness = useCallback(() => {
    if (!playbackConfig?.nightModeEnabled) {
      return 100;
    }

    const nightTime = checkIsNightTime(playbackConfig);
    setIsNightTime(nightTime);

    // 手動模式優先
    if (brightnessMode === 'manual-day') {
      return playbackConfig.dayBrightness || 100;
    }
    if (brightnessMode === 'manual-night') {
      return playbackConfig.nightModeBrightness || 30;
    }

    // 自動模式
    if (brightnessMode === 'auto') {
      return nightTime
        ? (playbackConfig.nightModeBrightness || 30)
        : (playbackConfig.dayBrightness || 100);
    }

    return 100;
  }, [playbackConfig, brightnessMode, checkIsNightTime]);

  /**
   * 切換亮度模式
   *
   * 邏輯：
   * - 自動夜間 → 手動日間（取消夜間降亮度，持續有效）
   * - 自動日間 → 手動夜間（啟用夜間降亮度，持續有效）
   * - 手動日間 → 手動夜間
   * - 手動夜間 → 自動模式（回到根據時間自動調整）
   *
   * 注意：手動模式會一直保持，不會因為時間變化而自動重置
   */
  const toggleBrightnessMode = useCallback(() => {
    let newMode;

    if (brightnessMode === 'auto' && isNightTime) {
      // 夜間模式 → 手動日間模式（取消夜間）
      newMode = 'manual-day';
    } else if (brightnessMode === 'auto' && !isNightTime) {
      // 日間模式 → 手動夜間模式
      newMode = 'manual-night';
    } else if (brightnessMode === 'manual-day') {
      // 手動日間 → 手動夜間
      newMode = 'manual-night';
    } else if (brightnessMode === 'manual-night') {
      // 手動夜間 → 自動模式
      newMode = 'auto';
    }

    setBrightnessMode(newMode);
    sessionStorage.setItem('brightnessMode', newMode);
  }, [brightnessMode, isNightTime]);

  /**
   * 更新夜間時間狀態
   * 只更新 isNightTime 狀態，不會影響手動模式
   */
  const updateNightTimeStatus = useCallback(() => {
    if (!playbackConfig?.nightModeEnabled) {
      setIsNightTime(false);
      return;
    }

    const nightTime = checkIsNightTime(playbackConfig);
    setIsNightTime(nightTime);
  }, [playbackConfig, checkIsNightTime]);

  /**
   * 定期檢查時間和亮度
   * 手動模式會持續有效，不會自動重置
   */
  useEffect(() => {
    // 初始計算
    updateNightTimeStatus();
    const initialBrightness = calculateBrightness();
    setCurrentBrightness(initialBrightness);

    // 每分鐘更新一次夜間時間狀態和亮度
    // 注意：手動模式會一直保持，直到使用者再次切換
    const interval = setInterval(() => {
      updateNightTimeStatus();
      const newBrightness = calculateBrightness();
      setCurrentBrightness(newBrightness);
    }, 60000); // 60 秒

    return () => clearInterval(interval);
  }, [calculateBrightness, updateNightTimeStatus]);

  /**
   * 當 playbackConfig 或 brightnessMode 改變時，立即重新計算亮度
   */
  useEffect(() => {
    const newBrightness = calculateBrightness();
    setCurrentBrightness(newBrightness);
  }, [calculateBrightness]);

  return {
    currentBrightness,
    brightnessMode,
    isNightTime,
    toggleBrightnessMode,
    showIcon: playbackConfig?.nightModeEnabled || false,
  };
};
