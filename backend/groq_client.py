"""Groq Cloud API integration for resume analysis and pathway generation."""
import os
import json
from pathlib import Path
from groq import Groq
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"


def analyze_resume(raw_text: str) -> dict:
    """Extract skills, projects, and domain from resume text."""
    prompt = f"""Analyze this resume text and extract structured information.

Resume:
{raw_text[:4000]}

Return a JSON object with exactly these fields:
{{
  "skills": ["skill1", "skill2", ...],
  "projects": ["project description 1", "project description 2", ...],
  "domain": "primary domain (e.g. Software Engineering, Data Science, Web Development, etc.)",
  "experience_level": "fresher|junior|mid|senior"
}}

Extract real skills mentioned. Be comprehensive but accurate."""

    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=1000,
    )
    return json.loads(resp.choices[0].message.content)


def generate_pathways(skills: list, domain: str, experience_level: str) -> dict:
    """Generate career pathways with match %, missing skills, and 4-week roadmap."""
    skills_str = ", ".join(skills[:30])
    prompt = f"""You are a career coach. A candidate has these skills: {skills_str}
Domain: {domain}, Level: {experience_level}

Generate career pathway analysis for exactly 3 roles: "Software Engineer (SDE)", "Full Stack Web Developer", "Data Scientist".

Return a JSON object:
{{
  "pathways": [
    {{
      "roleTitle": "Software Engineer (SDE)",
      "matchPercentage": 72,
      "missingCritical": ["DSA", "System Design"],
      "missingOptional": ["Kubernetes", "Go"],
      "roadmap": {{
        "weeklyPlan": [
          {{
            "week": 1,
            "focus": "Data Structures & Algorithms",
            "tasks": [
              {{"day": 1, "title": "Arrays and Strings - LeetCode Easy x5"}},
              {{"day": 2, "title": "Linked Lists - Implement singly linked list"}},
              {{"day": 3, "title": "Stacks & Queues - Problems"}},
              {{"day": 4, "title": "Binary Search - 3 problems"}},
              {{"day": 5, "title": "Recursion fundamentals"}},
              {{"day": 6, "title": "Review & mock interview"}},
              {{"day": 7, "title": "Rest & reflection"}}
            ]
          }},
          {{"week": 2, "focus": "...", "tasks": [...]}},
          {{"week": 3, "focus": "...", "tasks": [...]}},
          {{"week": 4, "focus": "...", "tasks": [...]}}
        ]
      }}
    }},
    {{ ... }},
    {{ ... }}
  ]
}}

Make roadmap tasks specific, actionable, and tailored to the missing skills. Each week must have exactly 7 tasks (days 1-7)."""

    resp = client.chat.completions.create(
        model=MODEL,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        max_tokens=4000,
    )
    return json.loads(resp.choices[0].message.content)


def get_agent_explanation(rule_decision: dict, stats: dict) -> str:
    """Get natural language explanation for the agent decision (optional LLM layer)."""
    try:
        prompt = f"""A student is learning {stats.get('roleTitle', 'programming')}.
Stats: completion rate {stats.get('completionRate', 0):.0%}, streak {stats.get('streak', 0)} days, week {stats.get('currentWeek', 1)}.
Rule engine recommendation: {rule_decision['action']}

Write ONE encouraging, specific sentence (max 25 words) as a career coach giving this advice."""

        resp = client.chat.completions.create(
            model=MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=60,
        )
        return resp.choices[0].message.content.strip()
    except Exception:
        return rule_decision.get("reasoning", "Keep going!")
