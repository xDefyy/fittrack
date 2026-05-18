import mysql.connector
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "141.227.152.96"),
        database=os.getenv("DB_NAME", "fittrack"),
        user=os.getenv("DB_USER", "fittrack"),
        password=os.getenv("DB_PASSWORD", "fittrack_pass"),
        port=int(os.getenv("DB_PORT", "3307"))
    )
    try:
        yield conn
    finally:
        conn.close()
