"""FastAPI backend for Agentic AI Career Coach."""
import os
import uuid
from datetime import datetime, timedelta
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from database import connect_db, close_db, get_db
from groq_client import analyze_resume, generate_pathways, get_agent_explanation
from agent import make_decision
from achievements import check_achievements

load_dotenv()

app = FastAPI(title="AI Career Coach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await connect_db()


@app.on_event("shutdown")
async def shutdown():
    await close_db()


# ─── Pydantic Models ───────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    name: str
    email: str

class ResumeRequest(BaseModel):
    userId: str
    rawText: str

class SelectPathwayRequest(BaseModel):
    userId: str
    pathwayId: str
    selectedRoleIndex: int

class CustomGoalRequest(BaseModel):
    pathwayId: str
    title: str
    deadline: Optional[str] = None

class UpdateGoalRequest(BaseModel):
    completed: bool


# ─── Auth ──────────────────────────────────────────────────────────────────────

@app.post("/api/auth/login")
async def login(req: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": req.email})
    if not user:
        user_doc = {
            "userId": str(uuid.uuid4()),
            "name": req.name,
            "email": req.email,
            "createdAt": datetime.utcnow().isoformat(),
        }
        await db.users.insert_one(user_doc)
        user = user_doc
    return {"userId": user["userId"], "name": user["name"], "email": user["email"]}


# ─── Resume Analysis ───────────────────────────────────────────────────────────

@app.post("/api/resume/analyze")
async def analyze(req: ResumeRequest):
    db = get_db()

    # Extract skills/projects/domain via Groq
    extracted = analyze_resume(req.rawText)

    resume_doc = {
        "resumeId": str(uuid.uuid4()),
        "userId": req.userId,
        "rawText": req.rawText[:5000],
        "extractedSkills": extracted.get("skills", []),
        "projects": extracted.get("projects", []),
        "domain": extracted.get("domain", "Software Engineering"),
        "experienceLevel": extracted.get("experience_level", "fresher"),
        "analyzedAt": datetime.utcnow().isoformat(),
    }
    await db.resumes.insert_one(resume_doc)

    # Generate pathways via Groq
    pathways_data = generate_pathways(
        resume_doc["extractedSkills"],
        resume_doc["domain"],
        resume_doc["experienceLevel"],
    )

    pathway_doc = {
        "pathwayId": str(uuid.uuid4()),
        "userId": req.userId,
        "resumeId": resume_doc["resumeId"],
        "pathways": pathways_data.get("pathways", []),
        "selectedRoleIndex": None,
        "createdAt": datetime.utcnow().isoformat(),
    }
    await db.pathways.insert_one(pathway_doc)

    return {
        "resumeId": resume_doc["resumeId"],
        "pathwayId": pathway_doc["pathwayId"],
        "extractedSkills": resume_doc["extractedSkills"],
        "projects": resume_doc["projects"],
        "domain": resume_doc["domain"],
        "pathways": pathway_doc["pathways"],
    }


# ─── Pathway Selection & Progress Init ────────────────────────────────────────

@app.post("/api/pathways/select")
async def select_pathway(req: SelectPathwayRequest):
    db = get_db()
    pathway_doc = await db.pathways.find_one({"pathwayId": req.pathwayId})
    if not pathway_doc:
        raise HTTPException(404, "Pathway not found")

    # Update selected index
    await db.pathways.update_one(
        {"pathwayId": req.pathwayId},
        {"$set": {"selectedRoleIndex": req.selectedRoleIndex}},
    )

    selected = pathway_doc["pathways"][req.selectedRoleIndex]

    # Build system tasks from roadmap
    system_tasks = []
    for week_data in selected["roadmap"]["weeklyPlan"]:
        for task in week_data["tasks"]:
            system_tasks.append({
                "taskId": str(uuid.uuid4()),
                "title": task["title"],
                "week": week_data["week"],
                "day": task["day"],
                "completed": False,
                "completedAt": None,
            })

    # Build system goals (one per week)
    system_goals = [
        {
            "goalId": str(uuid.uuid4()),
            "title": f"Complete Week {w['week']}: {w['focus']}",
            "targetWeek": w["week"],
            "achieved": False,
        }
        for w in selected["roadmap"]["weeklyPlan"]
    ]

    # Check if progress already exists
    existing = await db.progress.find_one({"pathwayId": req.pathwayId, "userId": req.userId})
    if existing:
        return {"progressId": existing["progressId"], "roleTitle": selected["roleTitle"]}

    progress_doc = {
        "progressId": str(uuid.uuid4()),
        "userId": req.userId,
        "pathwayId": req.pathwayId,
        "roleTitle": selected["roleTitle"],
        "systemTasks": system_tasks,
        "systemGoals": system_goals,
        "customGoals": [],
        "achievements": [],
        "streak": {
            "current": 0,
            "longest": 0,
            "lastActiveDate": None,
        },
        "createdAt": datetime.utcnow().isoformat(),
    }
    await db.progress.insert_one(progress_doc)

    return {"progressId": progress_doc["progressId"], "roleTitle": selected["roleTitle"]}


# ─── Progress ─────────────────────────────────────────────────────────────────

def _clean(doc: dict) -> dict:
    """Passthrough — kept for compatibility after MongoDB removal."""
    return doc


@app.get("/api/progress/{pathwayId}")
async def get_progress(pathwayId: str):
    db = get_db()
    doc = await db.progress.find_one({"pathwayId": pathwayId})
    if not doc:
        raise HTTPException(404, "Progress not found")
    return _clean(doc)


@app.patch("/api/progress/task/{taskId}")
async def toggle_task(taskId: str, body: dict):
    db = get_db()
    completed = body.get("completed", False)
    now = datetime.utcnow()

    # Find the progress document containing this task
    progress = await db.progress.find_one({"systemTasks.taskId": taskId})
    if not progress:
        raise HTTPException(404, "Task not found")

    # Update task completion
    await db.progress.update_one(
        {"progressId": progress["progressId"], "systemTasks.taskId": taskId},
        {"$set": {
            "systemTasks.$.completed": completed,
            "systemTasks.$.completedAt": now.isoformat() if completed else None,
        }},
    )

    # Update streak if completing a task
    if completed:
        streak = progress.get("streak", {"current": 0, "longest": 0, "lastActiveDate": None})
        last = streak.get("lastActiveDate")
        if last:
            last_dt = datetime.fromisoformat(last).date()
            today = now.date()
            if last_dt == today:
                pass  # Same day, no streak change
            elif last_dt == today - timedelta(days=1):
                streak["current"] += 1
            else:
                streak["current"] = 1  # Broke streak
        else:
            streak["current"] = 1

        streak["longest"] = max(streak["current"], streak.get("longest", 0))
        streak["lastActiveDate"] = now.isoformat()
        await db.progress.update_one(
            {"progressId": progress["progressId"]},
            {"$set": {"streak": streak}},
        )

    # Reload and check achievements
    updated = await db.progress.find_one({"progressId": progress["progressId"]})
    new_achv = check_achievements(updated)
    if new_achv:
        await db.progress.update_one(
            {"progressId": progress["progressId"]},
            {"$push": {"achievements": {"$each": new_achv}}},
        )

    # Check system goals
    tasks = updated.get("systemTasks", [])
    for goal in updated.get("systemGoals", []):
        if not goal["achieved"]:
            week_tasks = [t for t in tasks if t.get("week") == goal["targetWeek"]]
            if week_tasks and all(t.get("completed") for t in week_tasks):
                await db.progress.update_one(
                    {"progressId": updated["progressId"], "systemGoals.goalId": goal["goalId"]},
                    {"$set": {"systemGoals.$.achieved": True}},
                )

    final = await db.progress.find_one({"progressId": progress["progressId"]})
    return _clean(final)


# ─── Custom Goals ─────────────────────────────────────────────────────────────

@app.post("/api/progress/goal/custom")
async def add_custom_goal(req: CustomGoalRequest):
    db = get_db()
    goal = {
        "goalId": str(uuid.uuid4()),
        "title": req.title,
        "completed": False,
        "deadline": req.deadline,
        "createdAt": datetime.utcnow().isoformat(),
    }
    result = await db.progress.update_one(
        {"pathwayId": req.pathwayId},
        {"$push": {"customGoals": goal}},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Progress not found")

    # Check custom_goal achievement
    progress = await db.progress.find_one({"pathwayId": req.pathwayId})
    new_achv = check_achievements(progress)
    if new_achv:
        await db.progress.update_one(
            {"progressId": progress["progressId"]},
            {"$push": {"achievements": {"$each": new_achv}}},
        )

    updated = await db.progress.find_one({"pathwayId": req.pathwayId})
    return _clean(updated)


@app.patch("/api/progress/goal/custom/{goalId}")
async def update_custom_goal(goalId: str, req: UpdateGoalRequest):
    db = get_db()
    result = await db.progress.update_one(
        {"customGoals.goalId": goalId},
        {"$set": {"customGoals.$.completed": req.completed}},
    )
    if result.matched_count == 0:
        raise HTTPException(404, "Goal not found")
    progress = await db.progress.find_one({"customGoals.goalId": goalId})
    return _clean(progress)


# ─── Agent Decision ────────────────────────────────────────────────────────────

@app.get("/api/agent/decision")
async def agent_decision(pathwayId: str):
    db = get_db()
    progress = await db.progress.find_one({"pathwayId": pathwayId})
    if not progress:
        raise HTTPException(404, "Progress not found")

    decision = make_decision(progress)

    # Try to enhance with LLM explanation
    try:
        explanation = get_agent_explanation(decision, {
            **decision.get("stats", {}),
            "roleTitle": progress.get("roleTitle", ""),
        })
        decision["llmExplanation"] = explanation
    except Exception:
        decision["llmExplanation"] = None

    return decision


@app.get("/")
async def root():
    return {"status": "AI Career Coach API running"}
