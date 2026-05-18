from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from database import get_db

router = APIRouter()


class MuscleCreate(BaseModel):
    name: str
    group_name: str

class MuscleUpdate(BaseModel):
    name: Optional[str] = None
    group_name: Optional[str] = None


@router.get("/muscles")
def get_muscles(conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, name, group_name FROM muscle")
    rows = cur.fetchall()
    return [{"id": r[0], "name": r[1], "group_name": r[2]} for r in rows]


@router.get("/muscles/{muscle_id}")
def get_muscle(muscle_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, name, group_name FROM muscle WHERE id = %s", (muscle_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Muscle not found")
    return {"id": row[0], "name": row[1], "group_name": row[2]}


@router.post("/muscles", status_code=201)
def create_muscle(muscle_data: MuscleCreate, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO muscle (name, group_name) VALUES (%s, %s)",
        (muscle_data.name, muscle_data.group_name)
    )
    conn.commit()
    return {"id": cur.lastrowid, "name": muscle_data.name, "group_name": muscle_data.group_name}


@router.put("/muscles/{muscle_id}")
def update_muscle(muscle_id: int, muscle_data: MuscleUpdate, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM muscle WHERE id = %s", (muscle_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Muscle not found")

    if muscle_data.name:
        cur.execute("UPDATE muscle SET name = %s WHERE id = %s", (muscle_data.name, muscle_id))
    if muscle_data.group_name:
        cur.execute("UPDATE muscle SET group_name = %s WHERE id = %s", (muscle_data.group_name, muscle_id))

    conn.commit()
    return {"message": "Muscle updated"}


@router.delete("/muscles/{muscle_id}")
def delete_muscle(muscle_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM muscle WHERE id = %s", (muscle_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Muscle not found")

    cur.execute("DELETE FROM muscle WHERE id = %s", (muscle_id,))
    conn.commit()
    return {"message": "Muscle deleted"}
