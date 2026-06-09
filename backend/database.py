import os
import mysql.connector
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# --- MySQL ---
def get_db():
    conn = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "141.227.152.96"),
        port=int(os.getenv("MYSQL_PORT", "3307")),
        user=os.getenv("MYSQL_USER", "fittrack"),
        password=os.getenv("MYSQL_PASSWORD", "PSTBADMIN"),
        database=os.getenv("MYSQL_DB", "fittrack"),
        connection_timeout=10
    )
    try:
        yield conn
    finally:
        conn.close()


# --- MongoDB ---
def get_mongo():
    client = MongoClient(os.getenv(
        "MONGO_URI",
        "mongodb://fittrack:fittrack_pass@141.227.152.96:27017/?authSource=admin"
    ))
    return client[os.getenv("MONGO_DB", "fittrack")]
