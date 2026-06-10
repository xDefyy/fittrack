from fastapi import APIRouter, Depends

from database import get_db

router = APIRouter()


@router.get("/exercises")
def get_exercises(conn=Depends(get_db)):
    cur = conn.cursor()
    cur.execute("SELECT id, name, type, description FROM exercise ORDER BY name")
    exercises = cur.fetchall()

    result = []
    for ex in exercises:
        cur.execute(
            """
            SELECT m.name, em.role
            FROM exercise_muscle em
            JOIN muscle m ON m.id = em.muscle_id
            WHERE em.exercise_id = %s
            ORDER BY em.role
            """,
            (ex[0],)
        )
        muscles = [{"name": r[0], "role": r[1]} for r in cur.fetchall()]

        result.append({
            "id": ex[0],
            "name": ex[1],
            "type": ex[2],
            "description": ex[3],
            "muscles": muscles
        })

    return result
