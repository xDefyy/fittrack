from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pymongo import ASCENDING, TEXT

from database import get_mongo
from routes import users, muscle, program, auth, sessions, exercises, follow, stats

app = FastAPI(title="FitTrack API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(muscle.router)
app.include_router(program.router)
app.include_router(auth.router)
app.include_router(sessions.router)
app.include_router(exercises.router)
app.include_router(follow.router)
app.include_router(stats.router)


@app.on_event("startup")
def create_mongo_indexes():
    mongo = get_mongo()
    try:
        # Index TTL : supprime automatiquement les logs après 2 ans
        mongo["workout_logs"].create_index(
            [("date", ASCENDING)],
            expireAfterSeconds=63072000,
            name="ttl_workout_logs"
        )
    except Exception:
        pass
    try:
        # Index texte : permet la recherche full-text sur le nom de l'exercice
        mongo["workout_logs"].create_index(
            [("exercise_name", TEXT)],
            name="text_exercise_name"
        )
    except Exception:
        pass
