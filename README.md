# 數位相框服務 (Digital Photo Frame Service)

一個基於容器化的數位相框系統，專為觸控設備和內網環境設計，提供媒體管理和展示功能。

## 📋 專案概述

本專案實作一個數位相框服務，主要功能包含：

### 核心功能
1. **媒體管理介面** - 上傳、刪除、分類圖庫多媒體檔案
2. **播放模式設定** - 設定播放清單和播放方式
3. **展示介面** - 全螢幕媒體展示，支援觸控操作

### 支援的媒體格式
- 圖片：JPG, PNG, GIF, WebP
- 影片：MP4, WebM, AVI, MOV
- 音訊：MP3, WAV, OGG, M4A

## 🏗️ 系統架構

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │────│  後端 (Express)  │────│  資料庫 (SQLite) │
│   Port: 3000    │    │   Port: 3001    │    │                │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   檔案儲存系統   │
                       │   (本地目錄)     │
                       └─────────────────┘
```

## 🛠️ 技術選型

### 前端技術
- **React.js** - 主要框架，組件化開發
- **React Router** - 路由管理
- **Tailwind CSS** - 響應式設計框架
- **Framer Motion** - 動畫和觸控手勢
- **Axios** - HTTP 請求處理
- **Socket.io-client** - WebSocket 通訊

### 後端技術
- **Node.js + Express** - 伺服器框架
- **Multer** - 檔案上傳處理
- **Sharp** - 圖片處理和縮圖生成
- **Sequelize** - ORM 資料庫操作
- **Socket.io** - WebSocket 通訊

### 資料庫
- **SQLite** - 嵌入式資料庫

### 容器化
- **Docker + Docker Compose** - 容器編排

## 🚀 快速開始

### 環境需求
- **本地開發**: Node.js (v16+), npm
- **容器化部署**: Docker 和 Docker Compose

### 安裝步驟

1. **複製專案**
   ```bash
   git clone <repository-url>
   cd digital-photo-frame
   ```

2. **設定環境變數 (可選)**
   ```bash
   # 複製環境變數範本
   cp .env.example .env
   ```

### 啟動方式

#### 方式一：本地開發 (建議)
執行此模式以進行程式碼修改和除錯。它會分別啟動前端和後端的開發伺服器，並提供熱重載功能。

```bash
# Windows
local-dev-start.bat

# Linux/macOS
chmod +x local-dev-start.sh
./local-dev-start.sh
```

#### 方式二：容器化部署
執行此模式以啟動一個與生產環境一致的整合環境。所有服務將在 Docker 容器內運行。

```bash
# Windows
start.bat

# Linux/macOS
chmod +x start.sh
./start.sh
```

### 存取應用
- 展示頁面：http://localhost:3000
- 管理介面：http://localhost:3000/admin
- API 端點：http://localhost:3001/api

## 🔧 開發指南

### 專案結構
```
digital-photo-frame/
├── README.md
├── local-dev-start.bat / .sh   # 本地開發啟動腳本
├── start.bat / .sh             # Docker 啟動腳本
├── docker-compose.yml
├── backend/
└── frontend/
```

### 手動開發流程
如果您不使用 `local-dev-start` 腳本，也可以手動啟動：

1. **後端開發**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

2. **前端開發**
   ```bash
   cd frontend
   npm install
   npm start
   ```

### 資料庫初始化
在首次啟動後端服務時，資料庫和資料表會自動建立。如果需要手動初始化，可以執行：
```bash
cd backend
npm run db:init
```

## 🗄️ 資料庫設計

### 媒體檔案表 (media_files)
```sql
CREATE TABLE media_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  thumbnail_path VARCHAR(500),
  file_type ENUM('image', 'video', 'audio') NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  file_size INTEGER NOT NULL,
  duration INTEGER, -- 影片/音訊長度(秒)
  upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  tags VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE
);
```

### 播放模式配置表 (playback_config)
```sql
CREATE TABLE playback_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mode_type ENUM('fixed_media', 'library_sequence') NOT NULL,
  name VARCHAR(100) NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  image_display_duration INTEGER DEFAULT 5,
  video_loop BOOLEAN DEFAULT TRUE,
  audio_loop BOOLEAN DEFAULT TRUE,
  sequence_random BOOLEAN DEFAULT FALSE,
  created_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 播放清單表 (playlist_items)
```sql
CREATE TABLE playlist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  play_order INTEGER NOT NULL,
  FOREIGN KEY (config_id) REFERENCES playback_config(id),
  FOREIGN KEY (media_id) REFERENCES media_files(id)
);
```

## 🔌 API 設計

### 媒體管理 API
- `POST /api/media/upload` - 上傳媒體檔案
- `GET /api/media` - 取得媒體列表
- `DELETE /api/media/:id` - 刪除媒體檔案

### 播放模式 API
- `GET /api/playback/configs` - 取得播放配置列表
- `POST /api/playback/configs` - 建立播放配置
- `PUT /api/playback/configs/:id/activate` - 啟用播放配置

### 展示功能 API
- `GET /api/display/playlist` - 取得展示播放清單
- `GET /api/display/status` - 取得系統狀態

## 故障排除

**常見問題：**

1. **本地開發前端無法連接後端**
   - 確認後端伺服器 (`npm run dev`) 已在 `localhost:3001` 正常運行。
   - 檢查 `frontend/package.json` 中的 `proxy` 是否設定為 `http://localhost:3001`。
   - 修改 `proxy` 後需要重啟前端伺服器。

2. **Docker 啟動失敗**
   - 檢查 Docker 服務是否運行。
   - 確認端口 3000 和 3001 未被本地開發伺服器或其他應用占用。

3. **檔案上傳失敗**
   - 檢查 `uploads` 目錄權限。
   - 確認檔案大小未超過限制 (預設 100MB)。

## 📄 授權

本專案採用 MIT 授權條款。
