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


@router.delete("/programs/{program_id}")
def delete_program(program_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("DELETE FROM program WHERE id = %s", (program_id,))
    conn.commit()
    return {"message": "Program deleted"}
