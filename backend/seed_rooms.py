import sys
import os

# Asegurar que el entorno importa desde el backend actual
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

def poblar_habitaciones():
    db = SessionLocal()
    
    # Eliminar habitaciones antiguas si las hay, pero manteniendo las que tienen reservas (por si acaso).
    # Mejor: Añadimos solo las que faltan.
    existentes = [h.id_habitacion for h in db.query(models.Habitacion).all()]
    nuevas_habitaciones = []
    
    for piso in range(1, 5):
        for num in range(1, 11):
            id_hab = (piso * 100) + num
            if id_hab not in existentes:
                tipo = "Sencilla"
                precio = 300.0
                if num in [8, 9]:
                    tipo = "Doble"
                    precio = 500.0
                elif num == 10:
                    tipo = "Suite"
                    precio = 900.0
                    
                nuevas_habitaciones.append(
                    models.Habitacion(id_habitacion=id_hab, tipo=tipo, precio_base=precio, estado="Limpia")
                )
    
    if nuevas_habitaciones:
        db.add_all(nuevas_habitaciones)
        db.commit()
        print(f"Éxito: Se han insertado {len(nuevas_habitaciones)} habitaciones nuevas.")
    else:
        print("Las 40 habitaciones ya estaban creadas.")
        
    db.close()

if __name__ == "__main__":
    poblar_habitaciones()
