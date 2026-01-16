# Docker Hub 部署指南 (Docker Hub Deployment Guide)

本指南說明如何將數位相框服務推送到 Docker Hub 並進行分享部署。

## 📦 推送到 Docker Hub

### 前置準備

1. **建立 Docker Hub 帳號**
   - 前往 [Docker Hub](https://hub.docker.com) 註冊
   - 建立兩個公開倉庫：
     - `digital-photo-frame-frontend`
     - `digital-photo-frame-backend`

2. **本機登入 Docker Hub**
   ```bash
   docker login
   ```

### 自動推送（推薦）

#### Windows 用戶
1. 編輯 `push-to-dockerhub.bat` 檔案：
   ```bash
   notepad push-to-dockerhub.bat
   ```

2. 將 `your-username` 替換為您的 Docker Hub 用戶名：
   ```batch
   set DOCKERHUB_USERNAME=您的用戶名
   ```

3. 執行推送腳本：
   ```bash
   push-to-dockerhub.bat
   ```

#### Linux/Mac 用戶
1. 編輯 `push-to-dockerhub.sh` 檔案：
   ```bash
   nano push-to-dockerhub.sh
   ```

2. 將 `your-username` 替換為您的 Docker Hub 用戶名：
   ```bash
   DOCKERHUB_USERNAME="您的用戶名"
   ```

3. 執行推送腳本：
   ```bash
   chmod +x push-to-dockerhub.sh
   ./push-to-dockerhub.sh
   ```

### 手動推送

如果您想要手動控制每個步驟：

```bash
# 1. 確保容器已建立
docker-compose build

# 2. 標記映像檔（替換 your-username）
docker tag digital-photo-frame-frontend:latest kevin950805/digital-photo-frame-frontend:latest
docker tag digital-photo-frame-backend:latest kevin950805/digital-photo-frame-backend:latest

# 3. 推送到 Docker Hub
docker push kevin950805/digital-photo-frame-frontend:latest
docker push kevin950805/digital-photo-frame-backend:latest
```

## 🚀 從 Docker Hub 部署

### 快速開始

1. **下載部署配置檔案**
   ```bash
   # 下載 docker-compose.hub.yml
   wget https://raw.githubusercontent.com/your-repo/digital-photo-frame/main/docker-compose.hub.yml

   # 或手動建立（見下方內容）
   ```

2. **編輯配置檔案**
   ```bash
   # Windows
   notepad docker-compose.hub.yml

   # Linux/Mac
   nano docker-compose.hub.yml
   ```

   將所有 `your-username` 替換為實際的 Docker Hub 用戶名。

3. **建立必要目錄**
   ```bash
   # Windows
   mkdir database uploads\media uploads\thumbnails

   # Linux/Mac
   mkdir -p database uploads/media uploads/thumbnails
   ```

4. **啟動服務**
   ```bash
   docker-compose -f docker-compose.hub.yml up -d
   ```

5. **存取應用**
   - 展示頁面：http://localhost:3000
   - 管理介面：http://localhost:3000/admin

### docker-compose.hub.yml 範例

```yaml
services:
  frontend:
    image: your-username/digital-photo-frame-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:3001
    depends_on:
      - backend
    stdin_open: true
    tty: true

  backend:
    image: your-username/digital-photo-frame-backend:latest
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - DB_PATH=/app/data/database.sqlite
      - UPLOAD_PATH=/app/uploads
    volumes:
      - ./database:/app/data
      - ./uploads:/app/uploads
    stdin_open: true
    tty: true

volumes:
  database_data:
  uploads_data:

networks:
  default:
    name: photo-frame-network
```

## 🔧 進階配置

### 環境變數設定

建立 `.env` 檔案自訂環境變數：

```env
# 前端配置
REACT_APP_API_URL=http://localhost:3001

# 後端配置
NODE_ENV=production
DB_PATH=/app/data/database.sqlite
UPLOAD_PATH=/app/uploads
PORT=3001
MAX_FILE_SIZE=100MB

# Docker 配置
DOCKERHUB_USERNAME=your-username
VERSION=latest
```

### 版本管理

推送特定版本：

```bash
# 推送 v1.0.0 版本
docker tag digital-photo-frame-frontend:latest your-username/digital-photo-frame-frontend:v1.0.0
docker tag digital-photo-frame-backend:latest your-username/digital-photo-frame-backend:v1.0.0

docker push your-username/digital-photo-frame-frontend:v1.0.0
docker push your-username/digital-photo-frame-backend:v1.0.0
```

使用特定版本：

```yaml
services:
  frontend:
    image: your-username/digital-photo-frame-frontend:v1.0.0
  backend:
    image: your-username/digital-photo-frame-backend:v1.0.0
```

### 私有倉庫部署

如果您使用私有倉庫：

```bash
# 登入私有倉庫
docker login your-registry.com

# 推送到私有倉庫
docker tag digital-photo-frame-frontend:latest your-registry.com/your-username/digital-photo-frame-frontend:latest
docker push your-registry.com/your-username/digital-photo-frame-frontend:latest
```

## 🐛 常見問題

### 推送失敗
- **錯誤**: `unauthorized: authentication required`
- **解決**: 執行 `docker login` 重新登入

### 映像檔拉取失敗
- **錯誤**: `pull access denied`
- **解決**: 檢查倉庫名稱和權限設定

### 服務啟動失敗
- **錯誤**: `port already in use`
- **解決**: 更改端口號或停止占用的服務

```bash
# 查看端口占用
netstat -ano | findstr :3000
# 或
lsof -i :3000

# 使用不同端口
docker-compose -f docker-compose.hub.yml up -d --scale frontend=1 --scale backend=1 -p custom-port
```

### 資料持久性
確保資料持久化：

```yaml
volumes:
  - ./database:/app/data          # 資料庫檔案
  - ./uploads:/app/uploads        # 上傳檔案
```

## 📋 部署檢查清單

部署前請確認：

- [ ] Docker Hub 帳號已建立
- [ ] 倉庫已建立且設定正確
- [ ] 本機已登入 Docker Hub
- [ ] 映像檔已成功推送
- [ ] docker-compose.hub.yml 用戶名已更新
- [ ] 必要目錄已建立
- [ ] 端口未被占用
- [ ] 防火牆設定正確（如需要）

## 🌐 生產環境建議

### 安全設定
- 使用環境變數管理敏感資訊
- 設定 HTTPS（使用反向代理）
- 限制檔案上傳大小和類型
- 定期更新映像檔

### 效能最佳化
- 使用多階段建置減少映像檔大小
- 設定適當的資源限制
- 啟用 gzip 壓縮
- 使用 CDN 加速靜態資源

### 監控和維護
- 設定日誌輪換
- 監控磁碟使用量
- 定期備份資料庫
- 設定健康檢查

---

**提示**: 如果您需要協助或遇到問題，請參考主要的 [README.md](README.md) 檔案或開啟 issue 討論。