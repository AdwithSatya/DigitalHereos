from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

import os

# Load .env file manually if it exists
def load_env():
    for env_path in [".env", "../.env"]:
        if os.path.exists(env_path):
            with open(env_path, "r") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        os.environ[key.strip()] = val.strip()
            break

load_env()

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./bills.db")

# For SQLite, we need connect_args; for other DBs (like PostgreSQL) we don't.
engine_args = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    **engine_args
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
