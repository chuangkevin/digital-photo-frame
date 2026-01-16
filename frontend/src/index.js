import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 載入全域樣式
import './index.css';

// PWA 服務工作者註冊（可選）
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// 設定錯誤處理
window.addEventListener('error', (event) => {
  console.error('全域錯誤:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未處理的 Promise 拒絕:', event.reason);
});

// 設定全域觸控事件（防止縮放）
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

document.addEventListener('gesturechange', (e) => {
  e.preventDefault();
});

document.addEventListener('gestureend', (e) => {
  e.preventDefault();
});

// 防止雙擊縮放
let lastTouchEnd = 0;
document.addEventListener('touchend', (event) => {
  const now = Date.now();
  if (now - lastTouchEnd <= 300) {
    event.preventDefault();
  }
  lastTouchEnd = now;
}, false);

// 創建根元素並渲染應用
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 開發模式下的額外調試工具
if (process.env.NODE_ENV === 'development') {
  // 顯示渲染性能
  import('react-dom/client').then(() => {
    console.log('React 應用已在開發模式下啟動');
  });

  // 全域調試助手
  window.debugApp = {
    clearLocalStorage: () => {
      localStorage.clear();
      console.log('LocalStorage 已清除');
    },
    reloadApp: () => {
      window.location.reload();
    },
    apiUrl: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  };
}