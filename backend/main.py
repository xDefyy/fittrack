from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import users, muscle, program

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(muscle.router)
app.include_router(program.router)
