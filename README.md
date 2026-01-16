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
- 影片：MP4, WebM, AVI
- 音訊：MP3, WAV, OGG

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
- **PWA** - 支援離線使用和應用安裝

**選擇理由：** React 生態系統完整，Tailwind 提供快速響應式開發，Framer Motion 優化觸控體驗。

### 後端技術
- **Node.js + Express** - 伺服器框架
- **Multer** - 檔案上傳處理
- **Sharp** - 圖片處理和縮圖生成
- **Sequelize** - ORM 資料庫操作
- **CORS** - 跨域請求支援

**選擇理由：** JavaScript 全端統一，Express 輕量快速，Sharp 高效能圖片處理。

### 資料庫
- **SQLite** - 嵌入式資料庫

**選擇理由：** 無需額外配置，適合內網單機部署，檔案小巧易備份。

### 容器化
- **Docker + Docker Compose** - 容器編排

**選擇理由：** 簡化部署，環境一致性，易於維護。

## 🎯 功能需求

### 播放模式

#### 1. 固定媒體模式 (`fixed_media`)
- 管理員手動選擇特定媒體檔案
- 支援混合播放（圖片+影片+音訊）
- 圖片顯示時間可設定（預設5秒）
- 影片和音訊可選擇循環播放

#### 2. 媒體庫循序模式 (`library_sequence`)
- 自動播放媒體庫中所有檔案
- 支援順序播放或隨機播放
- 遵循循環播放設定

### 頁面功能

#### 展示頁面 (`/display`)
- **預設首頁**，全螢幕媒體展示
- **觸控互動**：
  - 點擊任意處：顯示管理入口 icon
  - 影片播放時：點擊顯示播放控制
  - 滑動：切換媒體（未來功能）
- **自動隱藏 UI**（3秒後）
- 支援 Windows 平板觸控操作

#### 管理介面 (`/admin`)
- **手機友善設計**
- **媒體管理**：上傳、刪除、預覽
- **播放設定**：模式切換、播放清單編輯
- **系統狀態**：儲存空間、播放狀態
- **一鍵返回展示**

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
- `POST /api/upload` - 上傳媒體檔案
- `GET /api/media` - 取得媒體列表
- `DELETE /api/media/:id` - 刪除媒體檔案
- `PUT /api/media/:id` - 更新媒體資訊
- `GET /api/files/:filename` - 取得媒體檔案
- `GET /api/thumbnails/:filename` - 取得縮圖

### 播放模式 API
- `GET /api/playback/configs` - 取得播放配置列表
- `POST /api/playback/config` - 建立播放配置
- `PUT /api/playback/config/:id` - 更新播放配置
- `PUT /api/playback/config/:id/activate` - 啟用播放配置
- `DELETE /api/playback/config/:id` - 刪除播放配置

### 播放清單 API
- `GET /api/playlist/:configId` - 取得播放清單
- `POST /api/playlist/:configId/items` - 新增至播放清單
- `DELETE /api/playlist/:configId/items/:itemId` - 從播放清單移除
- `PUT /api/playlist/:configId/reorder` - 重新排序

### 展示播放 API
- `GET /api/display/current-config` - 取得目前播放配置
- `GET /api/display/playlist` - 取得目前播放清單
- `GET /api/display/next-media` - 取得下一個媒體

## 🎨 UI/UX 設計

### 響應式設計
- **手機版** (< 768px)：垂直堆疊，大按鈕設計
- **平板版** (768px - 1024px)：側邊欄 + 主內容
- **大螢幕** (> 1024px)：展示模式優化

### 觸控優化
- 最小觸控目標：44px × 44px
- 支援手勢操作：滑動、長按、雙擊
- 大按鈕、清晰圖標設計
- 即時視覺回饋

### 頁面路由
```
/ → 自動重定向到 /display
/display → 展示頁面（全螢幕）
/admin → 管理主頁
/admin/media → 媒體管理
/admin/playback → 播放設定
```

## 🚀 部署方式

### 方式一：本機開發部署
```bash
# 啟動服務
docker-compose up -d

# 停止服務
docker-compose down

# 查看日誌
docker-compose logs -f
```

### 方式二：Docker Hub 部署
如果您想要分享或部署預建好的映像檔：

#### 推送至 Docker Hub
1. 編輯推送腳本，將 `your-username` 替換為您的 Docker Hub 用戶名：
   ```bash
   # Windows
   notepad push-to-dockerhub.bat

   # Linux/Mac
   nano push-to-dockerhub.sh
   ```

2. 執行推送腳本：
   ```bash
   # Windows
   push-to-dockerhub.bat

   # Linux/Mac
   chmod +x push-to-dockerhub.sh
   ./push-to-dockerhub.sh
   ```

#### 從 Docker Hub 部署
其他用戶可以使用您的映像檔快速部署：

1. 下載 docker-compose.hub.yml 檔案
2. 將檔案中的 `your-username` 替換為實際的 Docker Hub 用戶名
3. 建立必要目錄：
   ```bash
   mkdir -p database uploads/media uploads/thumbnails
   ```
4. 啟動服務：
   ```bash
   docker-compose -f docker-compose.hub.yml up -d
   ```

### 系統需求
- Docker 和 Docker Compose
- 至少 2GB 可用儲存空間
- 支援觸控的 Windows 平板（推薦）

## 📱 使用場景

### 主要使用方式
1. **Windows 平板**作為展示設備
2. **手機**作為管理端進行遠端管理
3. **內網環境**部署，安全可靠

### 典型工作流程
1. 使用手機連接管理介面上傳媒體
2. 設定播放模式和播放清單
3. 平板自動展示設定的內容
4. 需要時觸控平板進入管理模式

## 🚦 快速開始

### 環境需求
- Docker 和 Docker Compose
- 至少 2GB 可用儲存空間
- 網路瀏覽器（支援現代瀏覽器）

### 安裝步驟

1. **複製專案**
```bash
git clone <repository-url>
cd digital-photo-frame
```

2. **設定環境變數**
```bash
# 複製環境變數範本
cp .env.example .env

# 編輯環境變數（可選）
nano .env
```

3. **啟動服務**
```bash
# Windows
start.bat

# Linux/macOS
./start.sh

# 或手動啟動
docker-compose up -d
```

4. **存取應用**
- 展示頁面：http://localhost:3000
- 管理介面：http://localhost:3000/admin
- API 端點：http://localhost:3001/api

### 基本使用

1. **上傳媒體檔案**
   - 前往管理介面 → 檔案上傳
   - 拖拽或點擊上傳圖片、影片、音訊

2. **設定播放模式**
   - 前往管理介面 → 播放設定
   - 建立新的播放配置
   - 選擇播放模式和參數

3. **開始展示**
   - 回到展示頁面
   - 觸控螢幕進行互動
   - 享受數位相框體驗

## 🔧 開發指南

### 專案結構
```
digital-photo-frame/
├── README.md                    # 專案說明
├── docker-compose.yml          # Docker 服務編排
├── start.sh / start.bat        # 啟動腳本
├── backend/                    # 後端服務
│   ├── src/
│   │   ├── models/             # 資料庫模型
│   │   ├── controllers/        # 控制器
│   │   ├── routes/            # 路由
│   │   ├── middleware/        # 中介軟體
│   │   └── utils/             # 工具函數
│   ├── scripts/               # 腳本
│   ├── package.json
│   └── server.js              # 入口檔案
├── frontend/                  # 前端應用
│   ├── src/
│   │   ├── components/        # React 組件
│   │   ├── pages/            # 頁面組件
│   │   ├── contexts/         # React Context
│   │   ├── hooks/            # 自定義 Hook
│   │   ├── services/         # API 服務
│   │   └── utils/            # 工具函數
│   ├── public/
│   └── package.json
└── uploads/                   # 媒體檔案儲存
    ├── media/
    └── thumbnails/
```

### 開發環境設定

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

3. **資料庫初始化**
```bash
cd backend
npm run db:init
```

### API 文件

#### 媒體管理
- `POST /api/media/upload` - 上傳媒體檔案
- `GET /api/media` - 取得媒體列表
- `GET /api/media/:id` - 取得單一媒體
- `PUT /api/media/:id` - 更新媒體資訊
- `DELETE /api/media/:id` - 刪除媒體

#### 播放配置
- `GET /api/playback/configs` - 取得播放配置列表
- `POST /api/playback/configs` - 建立播放配置
- `PUT /api/playback/configs/:id/activate` - 啟用配置

#### 展示功能
- `GET /api/display/playlist` - 取得展示播放清單
- `GET /api/display/status` - 取得系統狀態

### 故障排除

**常見問題：**

1. **Docker 啟動失敗**
   - 檢查 Docker 服務是否運行
   - 確認端口 3000 和 3001 未被占用

2. **檔案上傳失敗**
   - 檢查 uploads 目錄權限
   - 確認檔案大小未超過限制 (100MB)

3. **媒體無法顯示**
   - 檢查檔案格式是否支援
   - 確認縮圖生成成功

4. **觸控不響應**
   - 確認瀏覽器支援觸控事件
   - 檢查是否在全螢幕模式

**日誌查看：**
```bash
# 查看所有服務日誌
docker-compose logs -f

# 查看特定服務日誌
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 🤝 貢獻指南

1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📄 授權

本專案採用 MIT 授權條款 - 詳見 [LICENSE](LICENSE) 檔案

## 🙏 致謝

- [React](https://reactjs.org/) - 前端框架
- [Express.js](https://expressjs.com/) - 後端框架
- [Tailwind CSS](https://tailwindcss.com/) - 樣式框架
- [Framer Motion](https://www.framer.com/motion/) - 動畫庫
- [Sharp](https://sharp.pixelplumbing.com/) - 圖片處理

---

**專案狀態：** 開發完成 🎉 | 可部署使用 ✅

**版本：** v1.0.0 | **最後更新：** 2026-01-16