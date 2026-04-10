# 🚀 Agentic AI Career Coach

An intelligent, agentic career coaching platform that analyzes your resume, generates personalized career pathways, and tracks your learning progress with daily tasks, streaks, and achievements.

---

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS + React Router
- **Backend**: FastAPI (Python 3.10+)
- **Database**: SQLite (aiosqlite async driver — zero setup, no external server needed)
- **AI**: Groq Cloud API (llama-3.3-70b-versatile)

---

## Quick Setup

### 1. Clone & Configure Environment

```bash
cp .env.example .env
# Edit .env and fill in your GROQ_API_KEY
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173  
API runs at: http://localhost:8000

---

## Environment Variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Your Groq Cloud API key (https://console.groq.com) |
| `DATABASE_PATH` | SQLite database file path (default: `./career_coach.db`) |

---

## Features

- 📄 **Resume Upload** — PDF parsing with skill/project extraction
- 🛤️ **Career Pathways** — SDE, Web Dev, Data Scientist with match % and roadmaps
- ✅ **Progress Dashboard** — Daily task checklist with streak tracking
- 🏆 **Achievements** — Auto-unlocked badges as you progress
- 🤖 **Agentic Next Action** — Rule-based + LLM recommendation engine
