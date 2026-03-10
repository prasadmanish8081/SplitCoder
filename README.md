# SplitCoder

SplitCoder is a full-stack learning platform with a React (Vite) frontend and a Node/Express + MongoDB backend.

## Tech Stack
- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, MongoDB (Mongoose)

## Project Structure
- `frontend/` React app
- `backend/` Express API

## Getting Started

### Backend
1. Install dependencies
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in `backend/` (example keys — update as needed):
   ```bash
   MONGO_URI=your_mongo_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
3. Run the server
   ```bash
   npm run dev
   ```

### Frontend
1. Install dependencies
   ```bash
   cd frontend
   npm install
   ```
2. Run the dev server
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