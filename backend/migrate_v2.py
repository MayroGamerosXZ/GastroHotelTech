import sqlite3

def run_migration():
    conn = sqlite3.connect('gastrohotel.db')
    cur = conn.cursor()

    # 1. Rehacer la tabla de configuración global
    cur.execute("DROP TABLE IF EXISTS configuracion")
    cur.execute("""
    CREATE TABLE configuracion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        clave TEXT UNIQUE,
        valor TEXT
    )
    """)
    
    # Insertar valores por defecto de temporada alta
    cur.execute("INSERT INTO configuracion (clave, valor) VALUES ('temporada_alta_inicio', '12-20')")
    cur.execute("INSERT INTO configuracion (clave, valor) VALUES ('temporada_alta_fin', '01-05')")

    # Helper para agregar columnas si no existen
    def add_column_if_not_exists(table, column, definition):
        try:
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {definition}")
            print(f"Columna '{column}' agregada a tabla '{table}'.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                print(f"Columna '{column}' en '{table}' ya existe.")
            else:
                print(f"Error agregando '{column}' a '{table}':", e)

    # 2. Agregar columnas a habitaciones
    add_column_if_not_exists("habitaciones", "vista", "TEXT DEFAULT 'Ciudad'")
    add_column_if_not_exists("habitaciones", "capacidad", "INTEGER DEFAULT 2")
    add_column_if_not_exists("habitaciones", "descripcion", "TEXT DEFAULT ''")
    add_column_if_not_exists("habitaciones", "precio_temporada_alta", "FLOAT DEFAULT 0.0")
    add_column_if_not_exists("habitaciones", "incluye_desayuno", "BOOLEAN DEFAULT 0")

    # 3. Agregar columnas a huespedes (para login y sesión)
    add_column_if_not_exists("huespedes", "email", "TEXT")
    add_column_if_not_exists("huespedes", "password_hash", "TEXT")
    add_column_if_not_exists("huespedes", "telefono", "TEXT")

    # Crear índice único para el email de los huéspedes
    try:
        cur.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_huespedes_email ON huespedes(email)")
        print("Índice único para email creado exitosamente.")
    except Exception as e:
        print("Error al crear índice único:", e)

    # Poblar valores por defecto para habitaciones existentes
    cur.execute("UPDATE habitaciones SET vista = 'Ciudad' WHERE vista IS NULL")
    cur.execute("UPDATE habitaciones SET capacidad = 2 WHERE capacidad IS NULL")
    cur.execute("UPDATE habitaciones SET descripcion = 'Habitación confortable con servicios básicos' WHERE descripcion IS NULL OR descripcion = ''")
    cur.execute("UPDATE habitaciones SET precio_temporada_alta = precio_base * 1.3 WHERE precio_temporada_alta IS NULL OR precio_temporada_alta = 0.0")

    conn.commit()
    conn.close()
    print("Migración V2 completada exitosamente.")

if __name__ == '__main__':
    run_migration()
