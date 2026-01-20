/**
 * 快取管理服務
 * 使用 Cache API 管理媒體檔案快取
 */

const CACHE_NAME = 'digital-photo-frame-media-v1';

/**
 * 取得快取實例
 */
const getCache = async () => {
  if ('caches' in window) {
    return await caches.open(CACHE_NAME);
  }
  return null;
};

/**
 * 清除特定 URL 的快取
 */
export const clearUrlCache = async (url) => {
  try {
    const cache = await getCache();
    if (cache) {
      const deleted = await cache.delete(url);
      console.log(`清除快取: ${url} - ${deleted ? '成功' : '未找到'}`);
      return deleted;
    }
  } catch (error) {
    console.error('清除快取失敗:', error);
  }
  return false;
};

/**
 * 清除多個 URL 的快取
 */
export const clearMultipleUrlsCache = async (urls) => {
  try {
    const cache = await getCache();
    if (cache) {
      const results = await Promise.all(
        urls.map(url => cache.delete(url))
      );
      const deletedCount = results.filter(r => r).length;
      console.log(`批次清除快取: ${deletedCount}/${urls.length} 個成功`);
      return deletedCount;
    }
  } catch (error) {
    console.error('批次清除快取失敗:', error);
  }
  return 0;
};

/**
 * 清除所有媒體快取
 */
export const clearAllMediaCache = async () => {
  try {
    const cache = await getCache();
    if (cache) {
      const keys = await cache.keys();

      // 篩選出媒體和縮略圖的快取
      const mediaKeys = keys.filter(request =>
        request.url.includes('/api/media/') ||
        request.url.includes('/api/thumbnails/')
      );

      const results = await Promise.all(
        mediaKeys.map(request => cache.delete(request))
      );

      const deletedCount = results.filter(r => r).length;
      console.log(`清除所有媒體快取: ${deletedCount} 個檔案`);
      return deletedCount;
    }
  } catch (error) {
    console.error('清除所有媒體快取失敗:', error);
  }
  return 0;
};

/**
 * 清除無效的快取（沒有對應資料庫記錄的媒體）
 */
export const clearOrphanedCache = async (validMediaList) => {
  try {
    const cache = await getCache();
    if (!cache) return 0;

    const keys = await cache.keys();

    // 建立有效媒體 URL 集合
    const validUrls = new Set();
    validMediaList.forEach(media => {
      // 媒體檔案 URL
      validUrls.add(`${window.location.origin}/api/media/${media.filename}`);
      // 縮略圖 URL
      validUrls.add(`${window.location.origin}/api/thumbnails/${media.filename}`);
    });

    // 找出無效的快取
    const orphanedKeys = keys.filter(request => {
      const url = request.url;
      if (!url.includes('/api/media/') && !url.includes('/api/thumbnails/')) {
        return false; // 不是媒體相關的快取，保留
      }
      return !validUrls.has(url); // 如果不在有效 URL 集合中，就是無效快取
    });

    // 刪除無效快取
    const results = await Promise.all(
      orphanedKeys.map(request => cache.delete(request))
    );

    const deletedCount = results.filter(r => r).length;
    console.log(`清除無效快取: ${deletedCount} 個檔案`);
    return deletedCount;
  } catch (error) {
    console.error('清除無效快取失敗:', error);
  }
  return 0;
};

/**
 * 取得快取統計資訊
 */
export const getCacheStats = async () => {
  try {
    const cache = await getCache();
    if (!cache) {
      return {
        supported: false,
        totalCached: 0,
        mediaCached: 0,
        thumbnailsCached: 0
      };
    }

    const keys = await cache.keys();
    const mediaKeys = keys.filter(r => r.url.includes('/api/media/'));
    const thumbnailKeys = keys.filter(r => r.url.includes('/api/thumbnails/'));

    return {
      supported: true,
      totalCached: keys.length,
      mediaCached: mediaKeys.length,
      thumbnailsCached: thumbnailKeys.length
    };
  } catch (error) {
    console.error('取得快取統計失敗:', error);
    return {
      supported: false,
      totalCached: 0,
      mediaCached: 0,
      thumbnailsCached: 0
    };
  }
};

/**
 * 清除媒體及其縮略圖的快取
 */
export const clearMediaCache = async (filename) => {
  const baseUrl = window.location.origin;
  const urls = [
    `${baseUrl}/api/media/${filename}`,
    `${baseUrl}/api/thumbnails/${filename}`
  ];
  return await clearMultipleUrlsCache(urls);
};

export default {
  clearUrlCache,
  clearMultipleUrlsCache,
  clearAllMediaCache,
  clearOrphanedCache,
  getCacheStats,
  clearMediaCache
};
