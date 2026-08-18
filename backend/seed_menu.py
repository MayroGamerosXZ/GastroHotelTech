import sys
import os

# Asegurar que el entorno importa desde el backend actual
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
import models

def poblar_menu():
    db = SessionLocal()
    
    # Eliminar artículos viejos (Limpieza)
    db.query(models.Articulo).delete()
    db.commit()

    # Artículos extraídos de las imágenes
    nuevos_articulos = [
        # DESAYUNOS
        models.Articulo(nombre="4 Pecados", categoria="Desayunos", precio=105.0),
        models.Articulo(nombre="Delicado Omelett Francés", categoria="Desayunos", precio=105.0),
        models.Articulo(nombre="Huevos en el Purgatorio", categoria="Desayunos", precio=105.0),
        models.Articulo(nombre="Mazateco", categoria="Desayunos", precio=80.0),
        models.Articulo(nombre="Chicharronero", categoria="Desayunos", precio=95.0),
        models.Articulo(nombre="Tostadas a la Francesa", categoria="Desayunos", precio=85.0),
        models.Articulo(nombre="Omelet de Claras", categoria="Desayunos", precio=100.0),
        models.Articulo(nombre="Granjero", categoria="Desayunos", precio=95.0),
        
        # ENTREMÉS (Entradas)
        models.Articulo(nombre="Tacos de Pescado o Camarón", categoria="Entremés", precio=75.0),
        models.Articulo(nombre="Carpacho de Res", categoria="Entremés", precio=110.0),
        models.Articulo(nombre="Mejillones al Ajo", categoria="Entremés", precio=145.0),
        models.Articulo(nombre="Ensalada del Chef", categoria="Entremés", precio=95.0),
        
        # PLATOS FUERTES
        models.Articulo(nombre="Trucha Caribeña", categoria="Platos Fuertes", precio=190.0),
        models.Articulo(nombre="Salmón a la Naranja", categoria="Platos Fuertes", precio=195.0),
        models.Articulo(nombre="Lomito al Zacapa", categoria="Platos Fuertes", precio=220.0),
        models.Articulo(nombre="Mar y Tierra, Solo Carnes", categoria="Platos Fuertes", precio=230.0),
        models.Articulo(nombre="Camarones Don Carlos La Especialidad", categoria="Platos Fuertes", precio=210.0),
        models.Articulo(nombre="Pechugas de Pollo al Parmesano", categoria="Platos Fuertes", precio=125.0),
        models.Articulo(nombre="Espagueti Primavera de Pollo", categoria="Platos Fuertes", precio=115.0),
        
        # POSTRES
        models.Articulo(nombre="Pie de Queso Maracuyá", categoria="Postres", precio=55.0),
        models.Articulo(nombre="Pie Queso Pistacho", categoria="Postres", precio=60.0),
        models.Articulo(nombre="Crème Brûlée", categoria="Postres", precio=55.0),
        models.Articulo(nombre="Gelato 1 Bola", categoria="Postres", precio=30.0),
        
        # BEBIDAS
        models.Articulo(nombre="Mojito Orange", categoria="Bebidas", precio=60.0),
        models.Articulo(nombre="Margarita Salvaje (Fresa)", categoria="Bebidas", precio=60.0),
        models.Articulo(nombre="Café por Libra", categoria="Bebidas", precio=95.0),
        models.Articulo(nombre="Café Negro", categoria="Bebidas", precio=30.0),
        models.Articulo(nombre="Café Capuchino", categoria="Bebidas", precio=35.0),
        models.Articulo(nombre="Naranjada 100% Natural", categoria="Bebidas", precio=33.0),
        
        # INFANTIL Y REFACCIONES
        models.Articulo(nombre="Hamburguesa Infantil", categoria="Infantil", precio=65.0),
        models.Articulo(nombre="Espagueti de Pollo", categoria="Infantil", precio=70.0),
        models.Articulo(nombre="Hamburguesa de la Casa", categoria="Infantil", precio=80.0),
        models.Articulo(nombre="Baguet Artesanal de Masa Madre", categoria="Infantil", precio=90.0),
    ]
    
    db.add_all(nuevos_articulos)
    db.commit()
    print(f"Éxito: Se han insertado {len(nuevos_articulos)} artículos en la base de datos.")
    db.close()

if __name__ == "__main__":
    poblar_menu()
