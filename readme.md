# 🎯 RTPG API & Frontend (Tic-Tac-Toe MVP)

A complete Express + React full-stack project, featuring authentication, multi-format REST API, and a simple React UI.

## 🚀 Overview

**RTPG** is a turn-based Tic-Tac-Toe API and interface.
Players can register, log in, create matches, join games, and make moves — all with JWT auth and SQLite persistence

## 🧠 Features

### ✅ Backend
- Express REST API (`/api/v1`)
- JWT authentication (Register / Login)
- SQLite storage (`db.sqlite`)
- Match system:
  - Create, Join, Play, View, List
- i18n support (EN / FR)
- HATEOAS + API versioning
- Multi-format responses
  (`application/json`, `application/hal+json`, `text/csv`)
- OpenAPI spec (`swagger.yaml`)

### ✅ Frontend
- React + Vite
- Pure CSS, no UI library
- Login / Register pages
- Lobby:
  - Create match
  - Join by ID
  - Refresh
- Match view:
  - 3×3 board
  - Turn display
  - Live polling
  - Simple results

## ⚙️ Quick start

At the **project root**:

```bash
# 1️⃣ Install backend + frontend
npm run install:all

# 2️⃣ Launch both servers (Express + Vite)
npm run dev:all
```

### Result
| Service | URL |
|----------|-----|
| Backend  | http://localhost:4001 |
| Frontend | http://localhost:5173 |


## 🧪 API Testing

📦 **Postman collection:**
> [🔗 Open in Postman](https://wsf777.postman.co/workspace/wsf~aa8ed000-a7a8-4330-955c-9c281e9eba62/collection/26370397-f7986a75-bb26-4613-a323-19a141b95370?action=share&creator=26370397)


## 📘 API Documentation

Preview with
➡ [Swagger hosted](https://app.swaggerhub.com/apis-docs/agse/rattrapage-api/1.0.0)

## 🕹️ Usage Flow

1. **Register** → create your account
2. **Login** → get JWT token
3. **Lobby** → create / join / view matches
4. **Match** → click cells to play

Each user only sees their own matches (creator or opponent).

## 🧰 Scripts

### 🏁 Root
| Script | Description |
|---------|--------------|
| `npm run install:all` | Install backend + frontend deps |
| `npm run dev:all` | Run both concurrently |

### ⚙️ Backend
| Script | Description |
|---------|--------------|
| `npm run dev` | Launch API (nodemon) |
| `npm start` | Run in prod mode |

### 💻 Frontend
| Script | Description |
|---------|--------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview built app |


## 🧱 Environment

Backend `.env`:
```env
PORT=4001
JWT_SECRET=supersecret
```

Frontend `.env`:
```env
VITE_API_BASE=http://localhost:4001
```
