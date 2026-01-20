import { useState, useEffect, useCallback } from 'react';

/**
 * 亮度控制自訂 Hook
 *
 * 功能：
 * 1. 自動根據時間範圍調整亮度（夜間/日間）
 * 2. 支援手動切換模式
 * 3. 使用 sessionStorage 持久化使用者選擇
 * 4. 自動恢復機制：下次排程時間到來時重置為自動模式
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
   * - 自動夜間 → 手動日間（取消夜間降亮度）
   * - 自動日間 → 手動夜間（啟用夜間降亮度）
   * - 手動日間 → 手動夜間
   * - 手動夜間 → 自動模式
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
   * 重置為自動模式（當下次排程時間到來時調用）
   *
   * 規則：
   * - 如果之前是手動日間，現在進入夜間時段 → 重置為自動
   * - 如果之前是手動夜間，現在進入日間時段 → 重置為自動
   */
  const resetToAutoMode = useCallback(() => {
    if (!playbackConfig?.nightModeEnabled) return;

    const storedMode = sessionStorage.getItem('brightnessMode');

    // 只有在手動模式時才檢查是否需要重置
    if (storedMode && storedMode.startsWith('manual-')) {
      const nightTime = checkIsNightTime(playbackConfig);
      const wasManualDay = storedMode === 'manual-day';
      const wasManualNight = storedMode === 'manual-night';

      // 如果之前是手動日間，現在進入夜間時段，重置為自動
      if (wasManualDay && nightTime) {
        setBrightnessMode('auto');
        sessionStorage.setItem('brightnessMode', 'auto');
      }
      // 如果之前是手動夜間，現在進入日間時段，重置為自動
      else if (wasManualNight && !nightTime) {
        setBrightnessMode('auto');
        sessionStorage.setItem('brightnessMode', 'auto');
      }
    }
  }, [playbackConfig, checkIsNightTime]);

  /**
   * 定期檢查時間和亮度
   */
  useEffect(() => {
    // 初始計算
    const initialBrightness = calculateBrightness();
    setCurrentBrightness(initialBrightness);

    // 每分鐘檢查一次
    const interval = setInterval(() => {
      resetToAutoMode();
      const newBrightness = calculateBrightness();
      setCurrentBrightness(newBrightness);
    }, 60000); // 60 秒

    return () => clearInterval(interval);
  }, [calculateBrightness, resetToAutoMode]);

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
