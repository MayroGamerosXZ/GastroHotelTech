from database import engine
from models import Base, Insumo, Receta

def run_migration():
    print("Iniciando migración v3...")
    # Crear las tablas nuevas si no existen
    Base.metadata.create_all(bind=engine, tables=[Insumo.__table__, Receta.__table__])
    print("Migración v3 completada. Tablas 'insumos' y 'recetas' aseguradas.")

if __name__ == "__main__":
    run_migration()
