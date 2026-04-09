"""Auto-unlock achievement badges based on progress state."""
from datetime import datetime

ACHIEVEMENT_DEFINITIONS = [
    {"id": "first_task", "title": "First Step", "description": "Completed your first task", "icon": "🎯"},
    {"id": "day_3_streak", "title": "On a Roll", "description": "3-day streak achieved", "icon": "🔥"},
    {"id": "day_7_streak", "title": "Week Warrior", "description": "7-day streak achieved", "icon": "⚡"},
    {"id": "week1_complete", "title": "Week 1 Done", "description": "Completed all Week 1 tasks", "icon": "🏅"},
    {"id": "week2_complete", "title": "Halfway Hero", "description": "Completed all Week 2 tasks", "icon": "🥈"},
    {"id": "week3_complete", "title": "Almost There", "description": "Completed all Week 3 tasks", "icon": "🥇"},
    {"id": "all_complete", "title": "Roadmap Legend", "description": "Completed the entire 4-week roadmap", "icon": "🏆"},
    {"id": "half_tasks", "title": "Halfway Point", "description": "Completed 50% of all tasks", "icon": "⭐"},
    {"id": "custom_goal", "title": "Self-Driven", "description": "Added your first custom goal", "icon": "💡"},
]


def check_achievements(progress: dict) -> list:
    """Return list of newly unlocked achievement IDs."""
    tasks = progress.get("systemTasks", [])
    streak = progress.get("streak", {}).get("current", 0)
    existing_ids = {a["id"] for a in progress.get("achievements", [])}
    custom_goals = progress.get("customGoals", [])

    completed = [t for t in tasks if t.get("completed")]
    total = len(tasks)
    comp_count = len(completed)

    new_achievements = []

    def check(aid):
        return aid not in existing_ids

    if check("first_task") and comp_count >= 1:
        new_achievements.append("first_task")

    if check("day_3_streak") and streak >= 3:
        new_achievements.append("day_3_streak")

    if check("day_7_streak") and streak >= 7:
        new_achievements.append("day_7_streak")

    if check("half_tasks") and total > 0 and comp_count / total >= 0.5:
        new_achievements.append("half_tasks")

    if check("custom_goal") and len(custom_goals) >= 1:
        new_achievements.append("custom_goal")

    # Week completion checks
    for week in range(1, 5):
        aid = f"week{week}_complete"
        week_tasks = [t for t in tasks if t.get("week") == week]
        if check(aid) and week_tasks and all(t.get("completed") for t in week_tasks):
            new_achievements.append(aid)

    if check("all_complete") and total > 0 and comp_count == total:
        new_achievements.append("all_complete")

    # Build full achievement objects for new ones
    defs = {d["id"]: d for d in ACHIEVEMENT_DEFINITIONS}
    now = datetime.utcnow().isoformat()
    return [
        {**defs[aid], "unlockedAt": now}
        for aid in new_achievements
        if aid in defs
    ]
