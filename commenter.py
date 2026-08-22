import os

comments = {
    r"backend\main.py": '"""\nArchivo Principal (Entrypoint) de la API FastAPI.\nContiene todos los endpoints (rutas) para el manejo de usuarios, comandas, habitaciones e inventario.\n"""\n',
    r"backend\models.py": '"""\nDefinición de Modelos de Base de Datos (SQLAlchemy).\nAquí se mapean las clases de Python a las tablas de la base de datos relacional.\n"""\n',
    r"backend\schemas.py": '"""\nEsquemas de Validación (Pydantic).\nSe utiliza para validar y tipar fuertemente los datos de entrada (Payloads) y salida (Responses) de la API.\n"""\n',
    r"backend\database.py": '"""\nConfiguración de la conexión a la Base de Datos.\nDefine el motor (Engine) y la sesión para ejecutar consultas SQL.\n"""\n',
    r"frontend\src\app\app.component.ts": '/**\n * Componente Principal (Layout) de Angular.\n * Controla el enrutamiento visual, el panel lateral (Sidebar) y el estado global de la sesión del usuario.\n */\n',
    r"frontend\src\app\pos.component.ts": '/**\n * Componente de Punto de Venta (POS).\n * Maneja la lógica del restaurante, el carrito de compras (comanda), el cálculo de propinas y el envío a cocina.\n */\n',
    r"frontend\src\app\guest-portal.component.ts": '/**\n * Componente de Portal de Huéspedes.\n * Controla la pantalla de bienvenida, registro de nuevos clientes y modales de inicio de sesión.\n */\n',
    r"frontend\src\app\api.service.ts": '/**\n * Servicio de Conexión HTTP.\n * Centraliza todas las llamadas a la API de FastAPI (GET, POST, PUT, DELETE) desde el frontend.\n */\n'
}

for filepath, comment in comments.items():
    full_path = os.path.join(r"D:\HotelTech", filepath)
    if os.path.exists(full_path):
        with open(full_path, "r", encoding="utf-8") as f:
            content = f.read()
        if "Archivo Principal" not in content and "Componente Principal" not in content:
            with open(full_path, "w", encoding="utf-8") as f:
                f.write(comment + content)
        print("Comentado:", filepath)
