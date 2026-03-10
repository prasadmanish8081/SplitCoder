# SplitCoder

SplitCoder is a full-stack learning platform with a React (Vite) frontend and a Node/Express + MongoDB backend.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)

## Project Structure
- `frontend/` React app
- `backend/` Express API

## Getting Started

### Prerequisites
- Node.js 18+ recommended
- MongoDB (local) or MongoDB Atlas

### Backend
1. Install dependencies
   ```bash
   cd backend
   npm install
   ```
2. Create `.env` from the example
   ```bash
   copy .env.example .env
   ```
3. Update `backend/.env`
   - `MONGO_URI` = MongoDB connection string
   - `JWT_SECRET` = any strong secret
   - `CLIENT_URL` = frontend URL (local dev: `http://localhost:5173`)
4. Run the server
   ```bash
   npm run dev
   ```

### Frontend
1. Install dependencies
   ```bash
   cd frontend
   npm install
   ```
2. Create `.env` from the example
   ```bash
   copy .env.example .env
   ```
3. Update `frontend/.env`
   - `VITE_API_URL` = backend URL (local dev: `http://localhost:5000`)
4. Run the dev server
   ```bash
   npm run dev
   ```

## Scripts

### Backend
- `npm run dev` — start with nodemon
- `npm start` — start with node

### Frontend
- `npm run dev` — start Vite dev server
- `npm run build` — build for production
- `npm run preview` — preview production build

## Notes
- Ensure the backend URL used by the frontend matches your API host/port.
- Add any additional environment variables required by your project.

## Deployment (Vercel + Render)

### Frontend on Vercel
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Env: `VITE_API_URL = https://<your-render-backend-domain>`

### Backend on Render
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Env:
  - `MONGO_URI`
  - `JWT_SECRET`
  - `CLIENT_URLS` = `https://<your-vercel-domain>` (comma-separated if multiple)