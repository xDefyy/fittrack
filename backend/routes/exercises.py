from fastapi import APIRouter, Depends

from database import get_db

router = APIRouter()


@router.get("/exercises")
def get_exercises(conn=Depends(get_db)):
    # TODO: add name search param
    cur = conn.cursor()
    cur.execute("""
        SELECT e.id, e.name, e.type, e.description,
               m.name AS muscle_name, em.role
        FROM exercise e
        LEFT JOIN exercise_muscle em ON em.exercise_id = e.id
        LEFT JOIN muscle m ON m.id = em.muscle_id
        ORDER BY e.name, em.role
    """)
    rows = cur.fetchall()

    exercises = {}
    for row in rows:
        ex_id = row[0]
        if ex_id not in exercises:
            exercises[ex_id] = {
                "id": row[0],
                "name": row[1],
                "type": row[2],
                "description": row[3],
                "muscles": []
            }
        if row[4]:
            exercises[ex_id]["muscles"].append({"name": row[4], "role": row[5]})

    return list(exercises.values())
