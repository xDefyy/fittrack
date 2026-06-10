from fastapi import APIRouter
from database import get_mongo

router = APIRouter()


# Progression du poids sur un exercice donné
@router.get("/stats/progression")
def get_progression(user_id: int, exercise: str):
    mongo = get_mongo()

    result = mongo["workout_logs"].aggregate([
        { "$match": { "user_id": user_id, "exercise_name": exercise } },
        { "$unwind": "$sets" },
        { "$group": {
            "_id": "$date",
            "max_weight": { "$max": "$sets.weight_kg" }
        }},
        { "$sort": { "_id": 1 } }
    ])

    return [{"date": str(r["_id"])[:10], "max_weight": r["max_weight"]} for r in result]


@router.get("/stats/volume")
def get_volume(user_id: int):
    mongo = get_mongo()

    result = mongo["workout_logs"].aggregate([
        { "$match": { "user_id": user_id } },
        { "$unwind": "$sets" },
        { "$group": {
            "_id": "$date",
            "total_volume": {
                "$sum": {
                    "$multiply": [
                        { "$ifNull": ["$sets.reps", 1] },
                        { "$ifNull": ["$sets.weight_kg", 0] }
                    ]
                }
            }
        }},
        { "$sort": { "_id": 1 } }
    ])

    return [{"date": str(r["_id"])[:10], "total_volume": round(r["total_volume"], 1)} for r in result]
