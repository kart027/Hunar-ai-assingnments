# Hunar AI Assignment — Full Stack Platform

This repository contains the Full Stack web application built for the Hunar AI assignment. The application integrates Hunar.AI's Voice Agents API to create a complete hiring and HR automation dashboard.

## What This Project Does

The platform solves three distinct HR and recruitment challenges:

1. **AI Hiring Assistant**
   - Automatically schedules and initiates screening interviews using Voice AI Agents.
   - Provides a comprehensive dashboard to view call statuses, durations, recordings, and structured AI-extracted interview results.
   
2. **People Search & Reachout (Automated Campaigns)**
   - Allows HR to search for candidates based on Job Descriptions (simulated via API integration).
   - Enables one-click "Bulk Reachout" where the Voice AI Agent instantly calls all matched candidates to gauge interest, collect basic details, and pitch the job role.
   - Tracks campaign analytics (total candidates, calls initiated) in real time.

3. **Smart Attendance (Conceptual Architecture)**
   - Demonstrates a system architecture for tracking the attendance of 1000 employees across 100 locations *without* smartphones or apps.
   - Proposes an IVRS + Voice AI system combined with location-specific landlines and voice biometrics.

## Tech Stack
- **Frontend**: Next.js 15, React 19, Tailwind CSS (v4), shadcn/ui, Lucide Icons
- **Backend**: Python, FastAPI, SQLAlchemy (Async), SQLite (local dev) / PostgreSQL (production ready)
- **Voice AI**: Hunar Voice AI APIs

---

## Local Setup Instructions

### Prerequisites
- Python 3.9+
- Node.js 20+
- A valid `HUNAR_API_KEY`

### 1. Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` directory and add your API keys:
   ```env
   HUNAR_API_KEY=your_hunar_api_key_here
   HUNAR_BASE_URL=https://api.voice.hunar.ai/external/v1
   FRONTEND_ORIGIN=http://localhost:3001
   DATABASE_URL=sqlite+aiosqlite:///./hunar.db
   ```
5. Start the backend server:
   ```bash
   python -m uvicorn app.main:app --port 8001 --reload
   ```

### 2. Frontend Setup (Next.js)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev -- --port 3001
   ```

### 3. Usage
- Open your browser and navigate to `http://localhost:3001`
- The frontend proxy will automatically route API requests to the FastAPI backend running on port 8001.

---

## Deployment (Render)

This repository includes a `render.yaml` Blueprint for easy deployment.
1. Connect this repository to your Render account.
2. Render will automatically spin up the FastAPI web service, Next.js web service, and a managed PostgreSQL database.
3. Add your `HUNAR_API_KEY` in the Render environment variables for the backend service.
