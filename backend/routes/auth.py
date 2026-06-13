from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
import hashlib

from database import get_db

router = APIRouter()

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


class LoginData(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(data: LoginData, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, is_admin, password_hash FROM users WHERE email = %s",
        (data.email,)
    )
    user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    stored = user[4]
    hashed_input = hash_password(data.password)

    # Migration douce : si l'ancien mdp est en clair, on le re-hashe
    if stored != hashed_input and stored == data.password:
        cur.execute("UPDATE users SET password_hash = %s WHERE id = %s", (hashed_input, user[0]))
        conn.commit()
    elif stored != hashed_input:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {"id": user[0], "name": user[1], "email": user[2], "is_admin": bool(user[3])}
