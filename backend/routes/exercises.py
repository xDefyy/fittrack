from fastapi import APIRouter, Depends

from database import get_db

router = APIRouter()


@router.get("/exercises")
def get_exercises(conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, name, type FROM exercise ORDER BY name")
    rows = cur.fetchall()
    return [{"id": r[0], "name": r[1], "type": r[2]} for r in rows]
