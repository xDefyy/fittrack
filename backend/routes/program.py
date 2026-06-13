from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from database import get_db

router = APIRouter()


class ProgramCreate(BaseModel):
    user_id: int
    name: str
    description: Optional[str] = None


class ProgramUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    active: Optional[bool] = None


@router.get("/programs")
def get_programs(conn=Depends(get_db)):
    # TODO: add user_id filter
    cur = conn.cursor()
    cur.execute("SELECT id, user_id, name, description, active FROM program")
    rows = cur.fetchall()
    return [{"id": r[0], "user_id": r[1], "name": r[2], "description": r[3], "active": r[4]} for r in rows]


@router.get("/programs/{program_id}/workout")
def get_program_workout(program_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, name, description FROM program WHERE id = %s", (program_id,))
    prog = cur.fetchone()
    if not prog:
        raise HTTPException(status_code=404, detail="Program not found")
    cur.execute("""
        SELECT wt.id, wt.name, wt.week_day,
               e.name, we.target_sets, we.target_reps, we.target_weight
        FROM workout_type wt
        JOIN workout_exercise we ON we.workout_type_id = wt.id
        JOIN exercise e ON e.id = we.exercise_id
        WHERE wt.program_id = %s
        ORDER BY wt.order_index, we.order_index
    """, (program_id,))
    rows = cur.fetchall()
    workout_types: dict = {}
    for wt_id, wt_name, week_day, ex_name, sets, reps, weight in rows:
        if wt_id not in workout_types:
            workout_types[wt_id] = {"id": wt_id, "name": wt_name, "week_day": week_day, "exercises": []}
        workout_types[wt_id]["exercises"].append({
            "exercise_name": ex_name,
            "sets": sets,
            "reps": reps,
            "weight_kg": weight
        })
    return {"id": prog[0], "name": prog[1], "description": prog[2], "workout_types": list(workout_types.values())}


@router.get("/programs/{program_id}")
def get_program(program_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, user_id, name, description, active FROM program WHERE id = %s", (program_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Program not found")
    return {"id": row[0], "user_id": row[1], "name": row[2], "description": row[3], "active": row[4]}


@router.post("/programs", status_code=201)
def create_program(program_data: ProgramCreate, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO program (user_id, name, description) VALUES (%s, %s, %s)",
        (program_data.user_id, program_data.name, program_data.description)
    )
    conn.commit()
    return {"id": cur.lastrowid, "name": program_data.name}


@router.put("/programs/{program_id}")
def update_program(program_id: int, program_data: ProgramUpdate, conn=Depends(get_db)):
    cur = conn.cursor()
    if program_data.name:
        cur.execute("UPDATE program SET name = %s WHERE id = %s", (program_data.name, program_id))
    if program_data.description:
        cur.execute("UPDATE program SET description = %s WHERE id = %s", (program_data.description, program_id))
    if program_data.active is not None:
        cur.execute("UPDATE program SET active = %s WHERE id = %s", (program_data.active, program_id))
    conn.commit()
    return {"message": "Program updated"}


@router.delete("/programs/{program_id}", status_code=204)
def delete_program(program_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("DELETE FROM program WHERE id = %s", (program_id,))
    conn.commit()


@router.post("/programs/{program_id}/join", status_code=201)
def join_program(program_id: int, user_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.callproc("join_program", (user_id, program_id))
    conn.commit()
    return {"message": "Joined program"}


@router.post("/programs/{program_id}/deactivate")
def deactivate_program(program_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.callproc("deactivate_program", (program_id,))
    conn.commit()
    return {"message": "Program deactivated"}


@router.get("/programs/user/{user_id}/count")
def count_programs(user_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.callproc("count_programs", (user_id,))
    for result in cur.stored_results():
        row = result.fetchone()
        return {"user_id": user_id, "total": row[0] if row else 0}
    return {"user_id": user_id, "total": 0}
