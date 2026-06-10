from fastapi import APIRouter
from database import get_mongo

router = APIRouter()


# Progression du poids sur un exercice donné
@router.get("/stats/progression")
def get_progression(user_id: int, exercise: str):
    mongo = get_mongo()

    result = mongo["workout_logs"].aggregate([
        { "$match": { "user_id": user_id } },
        { "$unwind": "$exercises" },
        { "$match": { "exercises.exercise_name": exercise } },
        { "$group": {
            "_id": "$date",
            "max_weight": { "$max": "$exercises.weight_kg" }
        }},
        { "$sort": { "_id": 1 } }
    ])

    return [{"date": r["_id"], "max_weight": r["max_weight"]} for r in result]


# Volume total soulevé par séance
@router.get("/stats/volume")
def get_volume(user_id: int):
    mongo = get_mongo()

    result = mongo["workout_logs"].aggregate([
        { "$match": { "user_id": user_id } },
        { "$unwind": "$exercises" },
        { "$group": {
            "_id": "$date",
            "total_volume": {
                "$sum": {
                    "$multiply": [
                        "$exercises.sets",
                        { "$ifNull": ["$exercises.reps", 1] },
                        { "$ifNull": ["$exercises.weight_kg", 0] }
                    ]
                }
            }
        }},
        { "$sort": { "_id": 1 } }
    ])

    return [{"date": r["_id"], "total_volume": round(r["total_volume"], 1)} for r in result]
