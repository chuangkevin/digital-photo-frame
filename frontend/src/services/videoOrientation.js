/**
 * 影片方向檢測和旋轉工具
 */

/**
 * 檢測設備類型
 */
export function detectDeviceType() {
  // 檢測觸控設備（手機/平板）
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // 檢測螢幕寬度
  const isMobileWidth = window.innerWidth < 768;

  // 檢測用戶代理
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);

  return {
    isMobile: isTouchDevice && (isMobileWidth || isMobileUA),
    isTablet: isTouchDevice && !isMobileWidth && !isMobileUA,
    isDesktop: !isTouchDevice
  };
}

/**
 * 從影片元素檢測方向信息
 * @param {HTMLVideoElement} videoElement
 * @returns {Promise<Object>} 包含方向信息的物件
 */
export async function detectVideoOrientation(videoElement) {
  return new Promise((resolve) => {
    const handleLoadedMetadata = () => {
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;

      // 基本方向判斷
      let orientation = 'landscape';
      let aspectRatio = videoWidth / videoHeight;

      if (aspectRatio < 1) {
        orientation = 'portrait';
      }

      // 檢測可能的旋轉需求
      let suggestedRotation = 0;

      // 如果影片是豎直但寬高比異常，可能需要旋轉
      if (orientation === 'portrait' && aspectRatio < 0.6) {
        // 極窄的影片，可能是橫向影片被誤判
        suggestedRotation = 90;
      } else if (orientation === 'landscape' && aspectRatio > 2.5) {
        // 極寬的影片，可能是豎向影片被誤判
        suggestedRotation = 270;
      }

      // 檢測特殊的反向情況
      // 如果寬度明顯小於高度但畫面內容看起來是橫向的
      if (videoWidth < videoHeight && aspectRatio < 0.8) {
        // 這可能是倒置的影片
        suggestedRotation = 180;
      }

      resolve({
        width: videoWidth,
        height: videoHeight,
        aspectRatio,
        orientation,
        suggestedRotation,
        needsRotation: suggestedRotation !== 0
      });

      // 清理事件監聽器
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };

    if (videoElement.readyState >= 1) {
      // 如果metadata已經載入，直接處理
      handleLoadedMetadata();
    } else {
      // 等待metadata載入
      videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    }
  });
}

/**
 * 智能判斷是否需要旋轉影片
 * @param {HTMLVideoElement} videoElement
 * @returns {Promise<string>} 返回需要應用的CSS類名
 */
export async function getVideoRotationClass(videoElement) {
  try {
    const deviceType = detectDeviceType();

    // 如果是手機設備，讓瀏覽器自動處理
    if (deviceType.isMobile || deviceType.isTablet) {
      return '';
    }

    // 只有在電腦上才進行智能旋轉判斷
    const orientation = await detectVideoOrientation(videoElement);

    if (!orientation.needsRotation) {
      return '';
    }

    // 根據建議的旋轉角度返回對應的CSS類
    switch (orientation.suggestedRotation) {
      case 90:
        return 'auto-rotate-90';
      case 180:
        return 'auto-rotate-180';
      case 270:
        return 'auto-rotate-270';
      default:
        return '';
    }
  } catch (error) {
    console.warn('無法檢測影片方向:', error);
    return '';
  }
}

/**
 * 基於檔名和模式的智能旋轉判斷
 * @param {string} filename 檔案名稱
 * @param {HTMLVideoElement} videoElement
 * @returns {Promise<string>} 返回CSS類名
 */
export async function getSmartVideoRotationClass(filename, videoElement) {
  try {
    const deviceType = detectDeviceType();

    // 手機設備不需要額外旋轉
    if (deviceType.isMobile || deviceType.isTablet) {
      return '';
    }

    // 檢查檔名中是否包含方向提示
    const lowerFilename = filename.toLowerCase();

    if (lowerFilename.includes('rotated') || lowerFilename.includes('rotate') ||
        lowerFilename.includes('倒轉') || lowerFilename.includes('旋轉')) {
      // 如果檔名暗示已旋轉，在電腦上可能需要反向旋轉
      return 'auto-rotate-180';
    }

    // 否則使用自動檢測
    return await getVideoRotationClass(videoElement);
  } catch (error) {
    console.warn('智能旋轉判斷失敗:', error);
    return '';
  }
}