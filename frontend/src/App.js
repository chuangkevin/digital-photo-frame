import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import DisplayPage from './pages/DisplayPage';
import AdminPage from './pages/AdminPage';
import './index.css';

/**
 * 錯誤邊界組件
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('應用錯誤:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="w-16 h-16 mx-auto mb-4 text-red-400">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold mb-4">應用發生錯誤</h1>
            <p className="text-gray-300 mb-6">
              抱歉，應用遇到了意外錯誤。請重新整理頁面或聯繫管理員。
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg active:bg-blue-600 transition-colors touch-manipulation"
            >
              重新載入
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-gray-400 active:text-white touch-manipulation">
                  錯誤詳情 (開發模式)
                </summary>
                <pre className="mt-2 p-3 bg-gray-800 rounded text-xs overflow-auto">
                  {this.state.error?.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 應用載入組件
 */
function AppLoader({ children }) {
  useEffect(() => {
    // 隱藏載入畫面
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
      setTimeout(() => {
        loadingElement.style.display = 'none';
      }, 500);
    }

    // 設定頁面標題
    document.title = '數位相框系統';

    // 防止右鍵選單（可選）
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 防止文字選取（可選）
    const handleSelectStart = (e) => {
      e.preventDefault();
    };

    // 在生產環境中啟用這些功能
    if (process.env.NODE_ENV === 'production') {
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('selectstart', handleSelectStart);
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

  return children;
}

/**
 * 主應用組件
 */
function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <AppLoader>
          <Router>
            <div className="App">
              <Routes>
                {/* 展示頁面 - 預設路由 */}
                <Route path="/" element={<DisplayPage />} />

                {/* 管理頁面 */}
                <Route path="/admin" element={<AdminPage />} />

                {/* 重定向所有其他路徑到首頁 */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </AppLoader>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;