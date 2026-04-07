# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**digital-photo-frame** 是數位相框 Web App，支援照片/影片輪播、即時同步、上傳管理。
設計用於樹莓派或任何 Docker 環境部署。

## Architecture

- **Frontend** (`frontend/`): React 18 (CRA / react-scripts) + Tailwind CSS + Socket.io-client
  - Framer Motion 動畫、react-dropzone 上傳、react-use-gesture 手勢
  - Port: 3000 (dev) / nginx (prod)
- **Backend** (`backend/`): Express.js (JS) + Sequelize + SQLite/PostgreSQL
  - ffmpeg (video processing), multer (upload), Socket.io
  - Port: 5000
- **Deployment**: Docker Compose (frontend nginx + backend)

## Development Commands

```bash
# Frontend
cd frontend && npm start       # CRA dev server (port 3000)
cd frontend && npm run build   # Production build

# Backend
cd backend && npm run dev      # nodemon (port 5000)
cd backend && npm start        # Production

# Full stack
./local-dev-start.sh           # Start both services
docker compose up -d           # Docker production

# Database init
cd backend && npm run db:init  # Initialize SQLite schema
```

## Key Features

- Photo/video upload via drag-and-drop (`react-dropzone`)
- Slideshow with configurable interval and transitions (Framer Motion)
- Real-time sync across devices via Socket.io
- Video thumbnail generation (ffprobe)
- ffmpeg for video transcoding
- Sequelize ORM for media metadata

## Ports

| Port | Service |
|------|---------|
| 3000 | Frontend (CRA dev) |
| 5000 | Backend API |

## Docker

```bash
docker compose up -d
./push-to-dockerhub.sh   # Build & push images
```
