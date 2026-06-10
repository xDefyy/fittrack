import os
import mysql.connector
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# --- MySQL ---
def get_db():
    conn = mysql.connector.connect(
        host=os.getenv("MYSQL_HOST"),
        port=int(os.getenv("MYSQL_PORT", "3306")),
        user=os.getenv("MYSQL_USER"),
        password=os.getenv("MYSQL_PASSWORD"),
        database=os.getenv("MYSQL_DB"),
        connection_timeout=10
    )
    try:
        yield conn
    finally:
        conn.close()


# --- MongoDB ---
_mongo_client = None

def get_mongo():
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(
            os.getenv("MONGO_URI"),
            serverSelectionTimeoutMS=5000
        )
    return _mongo_client[os.getenv("MONGO_DB")]
