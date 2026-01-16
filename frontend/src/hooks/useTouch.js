import { useEffect, useRef, useCallback } from 'react';

/**
 * 觸控手勢處理 Hook
 */
export function useTouch({
  onTap,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onLongPress,
  threshold = 50, // 滑動閾值 (px)
  longPressDelay = 500, // 長按延遲 (ms)
} = {}) {
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const longPressTimer = useRef(null);
  const elementRef = useRef(null);

  // 清除長按計時器
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  // 處理觸控開始
  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    touchEnd.current = null;

    // 開始長按計時
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress(e);
        longPressTimer.current = null;
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay]);

  // 處理觸控移動
  const handleTouchMove = useCallback((e) => {
    if (!touchStart.current) return;

    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
    };

    // 如果移動超過閾值，取消長按
    const deltaX = Math.abs(touchEnd.current.x - touchStart.current.x);
    const deltaY = Math.abs(touchEnd.current.y - touchStart.current.y);

    if (deltaX > threshold || deltaY > threshold) {
      clearLongPressTimer();
    }
  }, [threshold, clearLongPressTimer]);

  // 處理觸控結束
  const handleTouchEnd = useCallback((e) => {
    clearLongPressTimer();

    if (!touchStart.current) return;

    // 如果有觸控結束位置，處理滑動
    if (touchEnd.current) {
      const deltaX = touchEnd.current.x - touchStart.current.x;
      const deltaY = touchEnd.current.y - touchStart.current.y;
      const deltaTime = Date.now() - touchStart.current.time;

      // 檢查是否為有效滑動
      if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
        // 水平滑動優先
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight(e, { deltaX, deltaY, deltaTime });
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft(e, { deltaX, deltaY, deltaTime });
          }
        } else {
          // 垂直滑動
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown(e, { deltaX, deltaY, deltaTime });
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp(e, { deltaX, deltaY, deltaTime });
          }
        }
      } else if (onTap && deltaTime < 300) {
        // 快速點擊
        onTap(e);
      }
    } else if (onTap) {
      // 沒有移動的點擊
      const deltaTime = Date.now() - touchStart.current.time;
      if (deltaTime < 300) {
        onTap(e);
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [
    onTap,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold,
    clearLongPressTimer,
  ]);

  // 綁定事件監聽器
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // 添加觸控事件監聽器
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    // 防止預設行為
    element.addEventListener('touchstart', (e) => {
      e.preventDefault();
    });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearLongPressTimer]);

  return {
    touchRef: elementRef,
  };
}

/**
 * 點擊處理 Hook (滑鼠 + 觸控統一)
 */
export function useClick({ onClick, onDoubleClick, doubleClickDelay = 300 } = {}) {
  const clickTimer = useRef(null);
  const clickCount = useRef(0);

  const handleClick = useCallback((e) => {
    clickCount.current += 1;

    if (clickCount.current === 1) {
      clickTimer.current = setTimeout(() => {
        if (onClick) {
          onClick(e);
        }
        clickCount.current = 0;
      }, doubleClickDelay);
    } else if (clickCount.current === 2) {
      clearTimeout(clickTimer.current);
      if (onDoubleClick) {
        onDoubleClick(e);
      }
      clickCount.current = 0;
    }
  }, [onClick, onDoubleClick, doubleClickDelay]);

  useEffect(() => {
    return () => {
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
    };
  }, []);

  return { handleClick };
}

export default useTouch;