"""SQLite database using aiosqlite async driver (replaces MongoDB)."""
import os
import json
from pathlib import Path
import aiosqlite
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

DB_PATH = os.getenv("DATABASE_PATH", str(Path(__file__).resolve().parent / "career_coach.db"))

_db: aiosqlite.Connection = None


async def connect_db():
    global _db
    _db = await aiosqlite.connect(DB_PATH)
    _db.row_factory = aiosqlite.Row
    await _db.execute("PRAGMA journal_mode=WAL")
    await _db.execute("PRAGMA foreign_keys=ON")

    # Create tables
    await _db.executescript("""
        CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            createdAt TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS resumes (
            resumeId TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            rawText TEXT,
            extractedSkills TEXT DEFAULT '[]',
            projects TEXT DEFAULT '[]',
            domain TEXT DEFAULT 'Software Engineering',
            experienceLevel TEXT DEFAULT 'fresher',
            analyzedAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(userId)
        );

        CREATE TABLE IF NOT EXISTS pathways (
            pathwayId TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            resumeId TEXT NOT NULL,
            pathways TEXT DEFAULT '[]',
            selectedRoleIndex INTEGER,
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(userId),
            FOREIGN KEY (resumeId) REFERENCES resumes(resumeId)
        );

        CREATE TABLE IF NOT EXISTS progress (
            progressId TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            pathwayId TEXT NOT NULL,
            roleTitle TEXT,
            systemTasks TEXT DEFAULT '[]',
            systemGoals TEXT DEFAULT '[]',
            customGoals TEXT DEFAULT '[]',
            achievements TEXT DEFAULT '[]',
            streak TEXT DEFAULT '{"current":0,"longest":0,"lastActiveDate":null}',
            createdAt TEXT NOT NULL,
            FOREIGN KEY (userId) REFERENCES users(userId),
            FOREIGN KEY (pathwayId) REFERENCES pathways(pathwayId)
        );
    """)
    await _db.commit()
    print(f"[OK] Connected to SQLite database at {DB_PATH}")


async def close_db():
    if _db:
        await _db.close()


def get_db() -> "SQLiteDB":
    """Return a helper wrapper that provides a MongoDB-like interface."""
    return SQLiteDB(_db)


class SQLiteDB:
    """Thin wrapper over aiosqlite that mimics the subset of MongoDB operations
    used throughout the Career Coach backend so that main.py needs minimal changes."""

    def __init__(self, conn: aiosqlite.Connection):
        self._conn = conn
        # Collection-like accessors
        self.users = _Collection(conn, "users",
            columns=["userId", "name", "email", "createdAt"],
            json_columns=[])
        self.resumes = _Collection(conn, "resumes",
            columns=["resumeId", "userId", "rawText", "extractedSkills", "projects", "domain", "experienceLevel", "analyzedAt"],
            json_columns=["extractedSkills", "projects"])
        self.pathways = _Collection(conn, "pathways",
            columns=["pathwayId", "userId", "resumeId", "pathways", "selectedRoleIndex", "createdAt"],
            json_columns=["pathways"])
        self.progress = _Collection(conn, "progress",
            columns=["progressId", "userId", "pathwayId", "roleTitle", "systemTasks", "systemGoals", "customGoals", "achievements", "streak", "createdAt"],
            json_columns=["systemTasks", "systemGoals", "customGoals", "achievements", "streak"])


class _UpdateResult:
    def __init__(self, matched: int, modified: int):
        self.matched_count = matched
        self.modified_count = modified


class _Collection:
    """Mimics a MongoDB collection with find_one, insert_one, update_one."""

    def __init__(self, conn: aiosqlite.Connection, table: str, columns: list, json_columns: list):
        self._conn = conn
        self._table = table
        self._columns = columns
        self._json_cols = set(json_columns)

    def _row_to_dict(self, row) -> dict:
        if row is None:
            return None
        d = dict(row)
        # Deserialize JSON columns
        for col in self._json_cols:
            if col in d and isinstance(d[col], str):
                try:
                    d[col] = json.loads(d[col])
                except (json.JSONDecodeError, TypeError):
                    pass
        return d

    def _serialize_value(self, col: str, value):
        if col in self._json_cols:
            return json.dumps(value)
        return value

    async def find_one(self, query: dict) -> dict | None:
        """Find a single document matching the query.
        Supports simple equality and dot-notation queries on JSON arrays
        (e.g. {"systemTasks.taskId": "abc"} or {"customGoals.goalId": "xyz"}).
        """
        # Separate plain column queries from nested/dot-notation queries
        plain = {}
        nested = {}
        for k, v in query.items():
            if "." in k:
                nested[k] = v
            else:
                plain[k] = v

        conditions = []
        params = []

        for k, v in plain.items():
            conditions.append(f"{k} = ?")
            params.append(v)

        for k, v in nested.items():
            # e.g. "systemTasks.taskId" -> column=systemTasks, field=taskId
            parts = k.split(".", 1)
            col, field = parts[0], parts[1]
            # Use json_each to search within the JSON array
            conditions.append(
                f"EXISTS (SELECT 1 FROM json_each({col}) WHERE json_extract(value, '$.{field}') = ?)"
            )
            params.append(v)

        where = " AND ".join(conditions) if conditions else "1=1"
        sql = f"SELECT * FROM {self._table} WHERE {where} LIMIT 1"

        async with self._conn.execute(sql, params) as cursor:
            row = await cursor.fetchone()
            return self._row_to_dict(row)

    async def insert_one(self, doc: dict):
        cols = []
        vals = []
        placeholders = []
        for col in self._columns:
            if col in doc:
                cols.append(col)
                vals.append(self._serialize_value(col, doc[col]))
                placeholders.append("?")

        sql = f"INSERT INTO {self._table} ({', '.join(cols)}) VALUES ({', '.join(placeholders)})"
        await self._conn.execute(sql, vals)
        await self._conn.commit()

    async def update_one(self, query: dict, update: dict) -> _UpdateResult:
        """Update a single document.
        Supports:
          - {"$set": {"field": value}} — set top-level or array-element fields
          - {"$push": {"field": value}} — append to a JSON array column
          - {"$push": {"field": {"$each": [...]}}} — append multiple items
        Also supports dot-notation in $set keys for updating elements inside
        JSON array columns (e.g. "systemTasks.$.completed").
        """
        # First find the row
        doc = await self.find_one(query)
        if not doc:
            return _UpdateResult(0, 0)

        # Determine PK
        pk_col = self._columns[0]
        pk_val = doc[pk_col]

        set_ops = update.get("$set", {})
        push_ops = update.get("$push", {})

        updates = {}

        # Handle $set
        for key, value in set_ops.items():
            if ".$." in key:
                # Array element update: e.g. "systemTasks.$.completed"
                parts = key.split(".$.")
                col = parts[0]  # e.g. "systemTasks"
                field = parts[1]  # e.g. "completed"

                arr = doc.get(col, [])
                # Find which element matches the query filter
                # Look for the nested query key that targets this column
                match_field = None
                match_value = None
                for qk, qv in query.items():
                    if qk.startswith(col + "."):
                        match_field = qk.split(".", 1)[1]
                        match_value = qv
                        break

                if match_field:
                    for item in arr:
                        if item.get(match_field) == match_value:
                            item[field] = value
                            break

                updates[col] = json.dumps(arr)
            elif key in self._json_cols:
                updates[key] = json.dumps(value)
            else:
                updates[key] = value

        # Handle $push
        for key, value in push_ops.items():
            arr = doc.get(key, [])
            if isinstance(arr, str):
                arr = json.loads(arr)

            if isinstance(value, dict) and "$each" in value:
                arr.extend(value["$each"])
            else:
                arr.append(value)

            updates[key] = json.dumps(arr)

        if not updates:
            return _UpdateResult(1, 0)

        set_clauses = [f"{k} = ?" for k in updates]
        vals = list(updates.values()) + [pk_val]
        sql = f"UPDATE {self._table} SET {', '.join(set_clauses)} WHERE {pk_col} = ?"

        cursor = await self._conn.execute(sql, vals)
        await self._conn.commit()
        return _UpdateResult(1, cursor.rowcount)
