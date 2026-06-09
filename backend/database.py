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
def get_mongo():
    client = MongoClient(os.getenv("MONGO_URI"))
    return client[os.getenv("MONGO_DB")]
