"""
Configuración de la conexión a la Base de Datos.
Define el motor (Engine) y la sesión para ejecutar consultas SQL.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite is used for this MVP/University project mock
SQLALCHEMY_DATABASE_URL = "sqlite:///./gastrohotel.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
