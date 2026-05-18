import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def get_db():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        database=os.getenv("DB_NAME", "fittrack"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
        port=os.getenv("DB_PORT", "5432")
    )
    try:
        yield conn
    finally:
        conn.close()
