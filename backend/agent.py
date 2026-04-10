"""Rule-based agentic decision engine for 'Next Best Action'."""
from datetime import datetime, timedelta


def make_decision(progress: dict) -> dict:
    """
    Analyze progress and return a rule-based recommendation.
    Falls back gracefully if data is missing.
    """
    tasks = progress.get("systemTasks", [])
    streak = progress.get("streak", {}).get("current", 0)
    role = progress.get("roleTitle", "your goal")

    if not tasks:
        return {
            "action": "start",
            "priority": "high",
            "message": "Start your first task today to begin your journey!",
            "reasoning": "No tasks found. Kickoff day!",
        }

    total = len(tasks)
    completed = sum(1 for t in tasks if t.get("completed"))
    rate = completed / total if total > 0 else 0

    # Find current week (first incomplete task's week)
    incomplete = [t for t in tasks if not t.get("completed")]
    current_week = incomplete[0].get("week", 1) if incomplete else 4
    week_tasks = [t for t in tasks if t.get("week") == current_week]
    week_done = sum(1 for t in week_tasks if t.get("completed"))
    week_rate = week_done / len(week_tasks) if week_tasks else 1.0

    # Check last active date for inactivity
    last_active = progress.get("streak", {}).get("lastActiveDate")
    days_inactive = 0
    if last_active:
        try:
            last_dt = datetime.fromisoformat(last_active)
            days_inactive = (datetime.utcnow() - last_dt).days
        except Exception:
            pass

    # --- Decision Rules ---
    if days_inactive >= 3:
        return {
            "action": "re-engage",
            "priority": "urgent",
            "message": f"You've been away for {days_inactive} days. Pick one small task right now to restart your streak!",
            "reasoning": f"Inactive for {days_inactive} days. Re-engagement needed.",
            "stats": {"completionRate": rate, "streak": streak, "currentWeek": current_week},
        }

    if rate < 0.25:
        next_task = incomplete[0].get("title", "your next task") if incomplete else "a task"
        return {
            "action": "focus",
            "priority": "urgent",
            "message": f"You're at {rate:.0%} completion. Focus on: '{next_task}' today — even 30 minutes counts.",
            "reasoning": "Completion rate critically low (<25%). Immediate action required.",
            "stats": {"completionRate": rate, "streak": streak, "currentWeek": current_week},
        }

    if week_rate < 0.4:
        week_focus = week_tasks[0].get("week", current_week)
        return {
            "action": "catch_up",
            "priority": "high",
            "message": f"Week {current_week} is only {week_rate:.0%} done. Try to complete 2 tasks today to get back on track.",
            "reasoning": "Current week completion below 40%. Needs catch-up.",
            "stats": {"completionRate": rate, "streak": streak, "currentWeek": current_week},
        }

    if rate > 0.9 and streak >= 5:
        return {
            "action": "accelerate",
            "priority": "low",
            "message": f"Incredible! {streak}-day streak and {rate:.0%} done. You're ahead — explore advanced topics or mock interviews.",
            "reasoning": "High completion + streak. Ready to accelerate.",
            "stats": {"completionRate": rate, "streak": streak, "currentWeek": current_week},
        }

    if streak == 0:
        return {
            "action": "streak_start",
            "priority": "medium",
            "message": "Complete one task today to start your streak! Consistency beats intensity.",
            "reasoning": "No active streak. Encourage streak initiation.",
            "stats": {"completionRate": rate, "streak": streak, "currentWeek": current_week},
        }

    # Default: on track
    next_task = incomplete[0].get("title", "next task") if incomplete else "review"
    return {
        "action": "continue",
        "priority": "normal",
        "message": f"You're on track ({rate:.0%} done, {streak}-day streak). Next up: '{next_task}'.",
        "reasoning": "Progress is healthy. Steady continuation recommended.",
        "stats": {"completionRate": rate, "streak": streak, "currentWeek": current_week},
    }
