from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List

from database import get_db

router = APIRouter()


class ExerciseIn(BaseModel):
    exercise_name: str
    sets: int
    reps: Optional[int] = None
    weight_kg: Optional[float] = None


class SessionCreate(BaseModel):
    user_id: int
    title: str
    date: str
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None
    exercises: List[ExerciseIn] = []


class SessionUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    duration_minutes: Optional[int] = None


@router.get("/sessions")
def get_sessions(user_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        """
        SELECT s.id, s.title, s.date, s.duration_minutes, s.notes,
               COALESCE(SUM(se.sets * COALESCE(se.reps, 1) * COALESCE(se.weight_kg, 0)), 0) AS total_weight
        FROM session s
        LEFT JOIN session_exercise se ON se.session_id = s.id
        WHERE s.user_id = %s
        GROUP BY s.id, s.title, s.date, s.duration_minutes, s.notes
        ORDER BY s.date DESC
        """,
        (user_id,)
    )
    rows = cur.fetchall()
    return [
        {"id": r[0], "title": r[1], "date": str(r[2]), "duration_minutes": r[3], "notes": r[4], "total_weight": round(float(r[5]), 1)}
        for r in rows
    ]


@router.get("/sessions/{session_id}")
def get_session(session_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        """
        SELECT s.id, s.title, s.date, s.duration_minutes, s.notes, s.created_at,
               u.id, u.name, u.email
        FROM session s
        JOIN users u ON u.id = s.user_id
        WHERE s.id = %s
        """,
        (session_id,)
    )
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Session not found")

    cur.execute(
        "SELECT id, exercise_name, sets, reps, weight_kg FROM session_exercise WHERE session_id = %s",
        (session_id,)
    )
    exercises = [{"id": e[0], "exercise_name": e[1], "sets": e[2], "reps": e[3], "weight_kg": e[4]} for e in cur.fetchall()]

    return {
        "id": row[0], "title": row[1], "date": str(row[2]),
        "duration_minutes": row[3], "notes": row[4], "created_at": str(row[5]),
        "user": {"id": row[6], "name": row[7], "email": row[8]},
        "exercises": exercises
    }


@router.post("/sessions", status_code=201)
def create_session(data: SessionCreate, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO session (user_id, title, date, duration_minutes, notes) VALUES (%s, %s, %s, %s, %s)",
        (data.user_id, data.title, data.date, data.duration_minutes, data.notes)
    )
    session_id = cur.lastrowid

    for ex in data.exercises:
        cur.execute(
            "INSERT INTO session_exercise (session_id, exercise_name, sets, reps, weight_kg) VALUES (%s, %s, %s, %s, %s)",
            (session_id, ex.exercise_name, ex.sets, ex.reps, ex.weight_kg)
        )

    conn.commit()
    return {"id": session_id, "title": data.title, "date": data.date}


@router.put("/sessions/{session_id}")
def update_session(session_id: int, data: SessionUpdate, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM session WHERE id = %s", (session_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Session not found")

    if data.title:
        cur.execute("UPDATE session SET title = %s WHERE id = %s", (data.title, session_id))
    if data.notes:
        cur.execute("UPDATE session SET notes = %s WHERE id = %s", (data.notes, session_id))
    if data.duration_minutes:
        cur.execute("UPDATE session SET duration_minutes = %s WHERE id = %s", (data.duration_minutes, session_id))

    conn.commit()
    return {"message": "Session updated"}


@router.delete("/sessions/{session_id}")
def delete_session(session_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM session WHERE id = %s", (session_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Session not found")

    cur.execute("DELETE FROM session WHERE id = %s", (session_id,))
    conn.commit()
    return {"message": "Session deleted"}
