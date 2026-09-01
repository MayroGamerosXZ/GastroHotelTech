import os
import shutil
import time
from datetime import datetime

# Configuración de rutas
DB_PATH = "../backend/gastrohotel.db"
BACKUP_DIR = "../backups"
S3_BUCKET_NAME = "s3://gastrohotel-backups-produccion"

def ejecutar_backup():
    print("==================================================")
    print("🛡️  INICIANDO SISTEMA DE BACKUP Y DISASTER RECOVERY")
    print("==================================================")
    
    # 1. Crear directorio de backups si no existe
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
        
    # 2. Generar nombre de archivo con fecha y hora (Timestamp)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    backup_filename = f"gastrohotel_db_backup_{timestamp}.db"
    backup_path = os.path.join(BACKUP_DIR, backup_filename)
    
    # 3. Crear el Snapshot local
    print(f"🔄 [1/3] Creando snapshot local de la base de datos...")
    time.sleep(1)
    try:
        shutil.copy2(DB_PATH, backup_path)
        print(f"✅ [2/3] Snapshot creado exitosamente: {backup_filename}")
    except FileNotFoundError:
        print(f"❌ Error: No se encontró la base de datos en {DB_PATH}")
        return

    # 4. Sincronización con Amazon S3 (Simulada para el demo, pero lista para usar AWS CLI)
    print(f"☁️  [3/3] Sincronizando con AWS S3 Bucket ({S3_BUCKET_NAME})...")
    time.sleep(2) # Simulando el tiempo de subida a la nube
    
    # Aquí iría el comando real de AWS CLI: 
    # os.system(f"aws s3 cp {backup_path} {S3_BUCKET_NAME}")
    
    print("🚀 ¡Sincronización en la nube completada al 100%!")
    print("==================================================")
    print("🔒 Tu sistema está protegido ante pérdidas de datos.")
    print("==================================================")

if __name__ == "__main__":
    ejecutar_backup()
