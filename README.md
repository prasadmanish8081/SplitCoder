# SplitCoder

SplitCoder is a full-stack learning platform that teaches Python via structured topics, practice problems, and tutorials. It includes progress tracking and an AI-assisted Python helper powered by Hugging Face models.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)

## Project Structure
- `frontend/` React app
- `backend/` Express API

## Key Features
- Structured Python learning path (topics + problems)
- Tutorials with quiz data
- Progress tracking for users and tutorials
- AI-assisted Python/code helper via Hugging Face
- Separate student/admin APIs

## API Overview
- `GET /` health check
- `/api/topics` topics CRUD
- `/api/problems` problem bank
- `/api/tutorials` tutorials
- `/api/tutorial-progress` tutorial progress
- `/api/progress` overall progress
- `/api/students` student auth/profile
- `/admin` admin APIs
- `/api/python` AI Python helper
- `/api/instructions` instructions endpoints

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
   - `CLIENT_URLS` = optional, comma-separated list of allowed frontend URLs
   - `HF_API_TOKEN` = Hugging Face access token (required for code generation)
   - `HF_MODEL` = Hugging Face model id (default: `Qwen/Qwen2.5-Coder-1.5B-Instruct`)
   - `PORT` = backend port (default: `5000`)
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

## Seed Data
Seed scripts live in `backend/src/seed/`. Run them from the `backend/` folder.

1. Ensure `backend/.env` has a valid `MONGO_URI`.
2. Run the seed/update scripts you need:
   ```bash
   node src/seed/python_dsa_seed.js
   node src/seed/tutorial_quiz_seed.js
   node src/seed/update_topic_concepts.js
   node src/seed/update_topic_concepts_detailed.js
   node src/seed/update_topic_examples.js
   ```
Notes:
- `python_dsa_seed.js` inserts topics and problems.
- `tutorial_quiz_seed.js` inserts tutorial quiz data.
- `update_topic_concepts.js` updates topic concepts.
- `update_topic_concepts_detailed.js` updates detailed concepts.
- `update_topic_examples.js` updates topic examples.
- The scripts are idempotent and skip records that already exist.
- Run seeds only once per database (or after clearing collections).

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
  - `HF_API_TOKEN`
  - `HF_MODEL`
