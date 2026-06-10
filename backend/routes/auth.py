from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from database import get_db

router = APIRouter()


class LoginData(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(data: LoginData, conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute(
        "SELECT id, name, email, is_admin FROM users WHERE email = %s AND password_hash = %s",
        (data.email, data.password)
    )
    user = cur.fetchone()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"id": user[0], 
            "name": user[1], 
            "email": user[2], 
            "is_admin": bool(user[3])}
