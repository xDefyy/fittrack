from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
import hashlib

from database import get_db

router = APIRouter()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


class UserCreate(BaseModel):
    name: str
    email: str
    password_hash: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


@router.get("/users")
def get_users(conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, name, email FROM users")
    rows = cur.fetchall()
    return [{"id": r[0], "name": r[1], "email": r[2]} for r in rows]


@router.get("/users/{user_id}")
def get_user(user_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, name, email FROM users WHERE id = %s", (user_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="User not found")
    return {"id": row[0], "name": row[1], "email": row[2]}


@router.post("/users", status_code=201)
def create_user(user_data: UserCreate, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="Email already in use")

    hashed = hash_password(user_data.password_hash)
    cur.execute(
        "INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)",
        (user_data.name, user_data.email, hashed)
    )
    conn.commit()
    return {"id": cur.lastrowid, "name": user_data.name, "email": user_data.email}


@router.put("/users/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    if user_data.name:
        cur.execute("UPDATE users SET name = %s WHERE id = %s", (user_data.name, user_id))
    if user_data.email:
        cur.execute("UPDATE users SET email = %s WHERE id = %s", (user_data.email, user_id))

    conn.commit()
    return {"message": "User updated"}


@router.delete("/users/{user_id}")
def delete_user(user_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="User not found")

    cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()
    return {"message": "User deleted"}
