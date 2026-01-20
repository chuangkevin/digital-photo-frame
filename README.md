# 數位相框服務 (Digital Photo Frame Service)

一個基於容器化的數位相框系統，專為觸控設備和內網環境設計，提供媒體管理和展示功能，支援自動化 CI/CD 部署。

## 📋 專案概述

本專案實作一個功能完整的數位相框服務，主要功能包含：

### 核心功能
1. **媒體管理介面** - 上傳、批量刪除、預覽圖庫多媒體檔案
2. **播放模式設定** - 設定播放清單和播放方式
3. **展示介面** - 全螢幕媒體展示，支援觸控操作
4. **夜間模式** - 時間範圍自動亮度控制，手動覆寫支援
5. **實時同步** - WebSocket 推送配置更新
6. **自動化部署** - GitHub Actions + Tailscale CI/CD

### 支援的媒體格式
- **圖片**：JPG, PNG, GIF, WebP
- **影片**：MP4, WebM, AVI, MOV
- **音訊**：MP3, WAV, OGG, M4A

## 🏗️ 系統架構

```
┌─────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline                          │
│  GitHub Actions → Docker Hub → Tailscale → Deploy Server   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端 (React)   │────│  後端 (Express)  │────│  資料庫 (SQLite) │
│   Nginx:80      │    │   Port: 3001    │    │  (持久化儲存)    │
│   對外: 4123    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                      │
         │                      ▼
         │              ┌─────────────────┐
         │              │   檔案儲存系統   │
         └──────────────│ uploads/        │
                        │ thumbnails/     │
                        └─────────────────┘
```

## 🛠️ 技術選型

### 前端技術
- **React.js** - 主要框架，組件化開發
- **React Router** - 路由管理
- **Tailwind CSS** - 響應式設計框架
- **Framer Motion** - 動畫和觸控手勢
- **Axios** - HTTP 請求處理
- **Socket.io-client** - WebSocket 實時通訊

### 後端技術
- **Node.js + Express** - 伺服器框架
- **Multer** - 檔案上傳處理
- **Sharp** - 圖片處理和縮圖生成
- **FFmpeg** - 影片縮圖生成
- **Sequelize** - ORM 資料庫操作
- **Socket.io** - WebSocket 實時推送

### 資料庫
- **SQLite** - 嵌入式資料庫，支援自動 schema 遷移

### 容器化與部署
- **Docker + Docker Compose** - 容器編排
- **GitHub Actions** - CI/CD 自動化
- **Tailscale** - 零信任網路，安全部署通道
- **Docker Hub** - 映像儲存庫

## 🚀 快速開始

### 環境需求
- **本地開發**: Node.js (v16+), npm
- **容器化部署**: Docker 和 Docker Compose
- **自動部署**: Tailscale 帳號, GitHub Repository

### 安裝步驟

#### 方式一：本地開發

1. **複製專案**
   ```bash
   git clone https://github.com/YOUR_USERNAME/digital-photo-frame.git
   cd digital-photo-frame
   ```

2. **啟動開發環境**
   ```bash
   # Windows
   local-dev-start.bat

   # Linux/macOS
   chmod +x local-dev-start.sh
   ./local-dev-start.sh
   ```

3. **存取應用**
   - 展示頁面：http://localhost:3000
   - 管理介面：http://localhost:3000/admin
   - API 端點：http://localhost:3001/api

#### 方式二：Docker 本地部署

```bash
# Windows
start.bat

# Linux/macOS
chmod +x start.sh
./start.sh
```

#### 方式三：自動化部署到伺服器

完整的自動化部署設定請參考：
- **[Tailscale 部署指南](DEPLOYMENT-TAILSCALE.md)** - 完整的 CI/CD 設定步驟
- **[Tailscale OAuth 設定](docs/TAILSCALE-OAUTH-SETUP.md)** - OAuth Client 設定教學
- **[權限說明](docs/TAILSCALE-PERMISSIONS-EXPLAINED.md)** - OAuth 權限詳細解析

**快速開始**：
1. 設定 Tailscale OAuth Client
2. 在 GitHub 設定 Secrets (詳見部署指南)
3. 推送代碼到 `main` 分支，自動觸發部署

## ✨ 主要功能

### 1. 媒體管理
- ✅ 拖拽上傳多媒體檔案
- ✅ 自動生成縮略圖（圖片、影片）
- ✅ 批量選擇和刪除
- ✅ 媒體預覽（圖片、影片全螢幕檢視）
- ✅ 檔案資訊顯示（大小、類型、上傳時間）

### 2. 播放設定
- ✅ 順序播放 / 隨機播放
- ✅ 圖片顯示時長設定（1-60 秒）
- ✅ 影片/音訊循環播放
- ✅ 播放清單自訂順序

### 3. 夜間模式
- ✅ 時間範圍設定（例如：22:00 - 07:00）
- ✅ 日間/夜間亮度調整（10-100%）
- ✅ 自動模式：根據時間自動切換
- ✅ 手動模式：使用者可覆寫自動設定
- ✅ 跨午夜時間範圍支援

### 4. 展示介面
- ✅ 全螢幕展示模式
- ✅ 觸控手勢控制（滑動切換、長按選單）
- ✅ 即時 WebSocket 更新
- ✅ 平滑過場動畫
- ✅ 日/夜模式手動切換圖示

### 5. CI/CD 自動化
- ✅ 推送代碼自動構建 Docker 映像
- ✅ 多平台支援（AMD64, ARM64）
- ✅ 透過 Tailscale 安全部署
- ✅ 自動健康檢查
- ✅ 部署狀態通知

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
  duration INTEGER,
  upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  tags VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME,
  updated_at DATETIME
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
  night_mode_enabled BOOLEAN DEFAULT FALSE,        -- 夜間模式開關
  night_mode_start_time VARCHAR(5) DEFAULT '22:00', -- 開始時間 (HH:MM)
  night_mode_end_time VARCHAR(5) DEFAULT '07:00',   -- 結束時間 (HH:MM)
  night_mode_brightness INTEGER DEFAULT 30,          -- 夜間亮度 (10-100)
  day_brightness INTEGER DEFAULT 100,                -- 日間亮度 (10-100)
  created_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME,
  updated_at DATETIME
);
```

### 播放清單表 (playlist_items)
```sql
CREATE TABLE playlist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_id INTEGER NOT NULL,
  media_id INTEGER NOT NULL,
  play_order INTEGER NOT NULL,
  created_at DATETIME,
  updated_at DATETIME,
  FOREIGN KEY (config_id) REFERENCES playback_config(id),
  FOREIGN KEY (media_id) REFERENCES media_files(id)
);
```

## 🔌 API 文檔

### 媒體管理 API
- `POST /api/media/upload` - 上傳媒體檔案（支援多檔案）
- `GET /api/media` - 取得媒體列表
- `GET /api/files/:filename` - 取得媒體檔案
- `GET /api/thumbnails/:filename` - 取得縮略圖
- `DELETE /api/media/:id` - 刪除單一媒體檔案
- `POST /api/media/batch-delete` - 批量刪除媒體檔案

### 播放模式 API
- `GET /api/playback/configs` - 取得播放配置列表
- `POST /api/playback/configs` - 建立播放配置
- `PUT /api/playback/configs/:id` - 更新播放配置
- `PUT /api/playback/configs/:id/activate` - 啟用播放配置
- `DELETE /api/playback/configs/:id` - 刪除播放配置

### 展示功能 API
- `GET /api/display/playlist` - 取得展示播放清單
- `GET /api/display/status` - 取得系統狀態
- `GET /health` - 健康檢查端點

### WebSocket 事件
- `playlistUpdated` - 播放清單更新通知
- `configUpdated` - 配置更新通知

## 🔧 開發指南

### 專案結構
```
digital-photo-frame/
├── .github/
│   └── workflows/
│       ├── docker-publish.yml    # CI: 構建並推送映像
│       └── deploy.yml            # CD: 部署到伺服器
├── backend/
│   ├── src/
│   │   ├── controllers/          # API 控制器
│   │   ├── models/               # Sequelize 模型
│   │   ├── routes/               # 路由定義
│   │   └── services/             # WebSocket 服務
│   ├── uploads/                  # 媒體檔案儲存
│   ├── thumbnails/               # 縮略圖儲存
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/           # React 組件
│   │   ├── pages/                # 頁面組件
│   │   ├── hooks/                # 自訂 Hooks
│   │   └── services/             # API 和 WebSocket 服務
│   └── Dockerfile
├── docs/                         # 部署文檔
│   ├── TAILSCALE-OAUTH-SETUP.md
│   └── TAILSCALE-PERMISSIONS-EXPLAINED.md
├── docker-compose.yml            # 本地開發配置
├── DEPLOYMENT-TAILSCALE.md       # 部署指南
├── local-dev-start.bat/.sh       # 本地開發啟動腳本
└── start.bat/.sh                 # Docker 啟動腳本
```

### Docker 映像

**公開映像** (Docker Hub):
```bash
# 前端映像
docker pull kevin950805/digital-photo-frame-frontend:latest

# 後端映像
docker pull kevin950805/digital-photo-frame-backend:latest
```

**平台支援**:
- linux/amd64 (x86_64)
- linux/arm64 (ARM, 如 Raspberry Pi 4)

### 環境變數

**後端 (backend)**:
```env
NODE_ENV=production              # 運行環境
PORT=3001                        # API 端口
DB_PATH=/app/data/database.sqlite # 資料庫路徑
UPLOAD_PATH=/app/uploads         # 上傳目錄
```

**前端 (frontend)**:
```env
REACT_APP_API_URL=http://localhost:3001  # 本地開發
# 或
REACT_APP_API_URL=http://backend:3001    # Docker 環境
```

## 🐛 故障排除

### 常見問題

#### 1. 本地開發前端無法連接後端
- 確認後端伺服器已在 `localhost:3001` 運行
- 檢查 `frontend/package.json` 中的 `proxy` 設定
- 修改 proxy 後需重啟前端伺服器

#### 2. Docker 部署後資料庫錯誤
**錯誤**: `SQLITE_ERROR: no such column: PlaybackConfig.nightModeEnabled`

**解決方案**:
```bash
cd /path/to/docker-compose-directory

# 停止容器
docker compose down

# 刪除舊資料庫（會清空所有資料）
rm -rf database uploads

# 重新建立目錄
mkdir -p database uploads

# 修正權限
sudo chmod -R 777 database uploads

# 重新啟動
docker compose up -d
```

#### 3. 權限錯誤
**錯誤**: `EACCES: permission denied, mkdir '/app/uploads/media'`

**解決方案**:
```bash
# 修正 uploads 和 database 目錄權限
sudo chmod -R 777 database uploads

# 或更安全的方式（使用容器內的 UID）
sudo chown -R 1000:1000 database uploads
```

#### 4. 縮略圖加載失敗
- 確認後端 FFmpeg 已正確安裝（Docker 映像已包含）
- 檢查 thumbnails 目錄權限
- 查看後端日誌: `docker compose logs backend`

#### 5. WebSocket 連線失敗
- 確認前端和後端在相同網路（Docker 網路或本地網路）
- 檢查 CORS 設定
- 查看瀏覽器 Console 錯誤訊息

#### 6. GitHub Actions 部署失敗
- **Tailscale 403 錯誤**: 檢查 ACL 設定，確認 `tag:ci` 已授權
- **SSH 連線失敗**: 驗證 SSH key 和 authorized_keys 權限
- **路徑錯誤**: 確認 `DEPLOY_PATH` Secret 正確
- 詳見 [DEPLOYMENT-TAILSCALE.md](DEPLOYMENT-TAILSCALE.md)

## 📊 效能優化

### 已實作的優化
- ✅ 圖片/影片縮略圖快取
- ✅ CSS filter 硬體加速（GPU）
- ✅ React.memo 組件優化
- ✅ 懶加載圖片
- ✅ WebSocket 事件節流
- ✅ Docker 多階段構建減少映像大小

### 建議的伺服器配置
- **最低**: 1 CPU, 512MB RAM, 5GB 儲存空間
- **推薦**: 2 CPU, 1GB RAM, 20GB+ 儲存空間
- **適合設備**: Raspberry Pi 4 (2GB+), NUC, x86 伺服器

## 🔒 安全建議

### 生產環境部署
1. ✅ 使用 Tailscale 或 VPN 隔離內網
2. ✅ 設定防火牆規則限制訪問
3. ✅ 定期備份資料庫和媒體檔案
4. ✅ 使用強密碼保護管理介面（如需要）
5. ✅ 定期更新 Docker 映像

### 備份建議
```bash
# 備份腳本範例
#!/bin/bash
BACKUP_DIR=~/backups/digital-photo-frame
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 備份資料庫和媒體
tar -czf $BACKUP_DIR/backup-$DATE.tar.gz \
  database/ \
  uploads/

# 保留最近 7 天的備份
find $BACKUP_DIR -name "backup-*.tar.gz" -mtime +7 -delete
```

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request！

### 開發流程
1. Fork 本專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

## 📝 版本歷史

### v2.0.0 (2026-01-20)
- ✨ 新增夜間模式時間範圍亮度控制
- ✨ 新增批量選擇和刪除媒體功能
- ✨ 新增全螢幕模式按鈕
- ✨ 實作 GitHub Actions CI/CD 自動部署
- ✨ 支援 Tailscale 零信任網路部署
- 🐛 修正媒體預覽破圖問題
- 🐛 修正手動亮度控制被覆寫問題
- 📚 新增完整部署文檔

### v1.0.0 (初始版本)
- ✨ 基礎媒體管理功能
- ✨ 播放模式設定
- ✨ 展示介面和觸控操作
- ✨ WebSocket 實時更新

## 📄 授權

本專案採用 MIT 授權條款。

## 📧 聯絡資訊

如有問題或建議，請開啟 [GitHub Issue](https://github.com/YOUR_USERNAME/digital-photo-frame/issues)。

---

**享受您的數位相框體驗！** 🖼️✨
