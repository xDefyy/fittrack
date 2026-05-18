from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from database import get_db

app = FastAPI()


class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None


@app.get("/users")
def get_users(conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, username, email FROM users")
    rows = cur.fetchall()
    return [{"id": r[0], "username": r[1], "email": r[2]} for r in rows]


@app.get("/users/{user_id}")
def get_user(user_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, username, email FROM users WHERE id = %s", (user_id,))
    row = cur.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return {"id": row[0], "username": row[1], "email": row[2]}


@app.post("/users", status_code=201)
def create_user(user_data: UserCreate, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE email = %s", (user_data.email,))
    if cur.fetchone():
        raise HTTPException(status_code=400, detail="El email ya está en uso")

    cur.execute(
        "INSERT INTO users (username, email, password) VALUES (%s, %s, %s) RETURNING id",
        (user_data.username, user_data.email, user_data.password)
    )
    new_id = cur.fetchone()[0]
    conn.commit()
    return {"id": new_id, "username": user_data.username, "email": user_data.email}


@app.put("/users/{user_id}")
def update_user(user_id: int, user_data: UserUpdate, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    if user_data.username:
        cur.execute("UPDATE users SET username = %s WHERE id = %s", (user_data.username, user_id))
    if user_data.email:
        cur.execute("UPDATE users SET email = %s WHERE id = %s", (user_data.email, user_id))

    conn.commit()
    return {"message": "Usuario actualizado"}


@app.delete("/users/{user_id}")
def delete_user(user_id: int, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE id = %s", (user_id,))
    if not cur.fetchone():
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    cur.execute("DELETE FROM users WHERE id = %s", (user_id,))
    conn.commit()
    return {"message": "Usuario eliminado"}
