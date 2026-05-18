from fastapi import FastAPI

from routes import users, muscle, program

app = FastAPI()

app.include_router(users.router)
app.include_router(muscle.router)
app.include_router(program.router)
