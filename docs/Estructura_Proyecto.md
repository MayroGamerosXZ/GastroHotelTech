# Arquitectura y Estructura del Código
**Proyecto:** GastroHotel Tech

A continuación, se documenta la estructura de directorios del proyecto y se comenta la función principal de cada uno de sus componentes clave.

---

## 📁 1. Estructura Raíz del Proyecto
Ubicación: `D:\HotelTech`

* 📄 **`docker-compose.yml`**: Archivo de orquestación de Docker utilizado en el servidor AWS. Su función es levantar un contenedor basado en `nginx:alpine` súper ligero, mapeando los archivos pre-compilados del Frontend hacia internet por el puerto 80.
* 📄 **`.gitignore`**: Excluye carpetas pesadas (como `node_modules`, `venv`, `dist.zip`) y archivos sensibles de seguridad (`gastrohotel-key.pem`) para evitar subirlos accidentalmente a GitHub.
* 📁 **`.github/workflows/deploy.yml`**: Archivo núcleo de DevOps (CI/CD). Contiene las instrucciones que le dicen a GitHub Actions cómo conectarse por SSH al servidor de AWS cada vez que hay un nuevo cambio en la rama `main`, para así reiniciar los servicios automáticamente.

---

## 📁 2. Backend (Servidor de Datos y API)
Ubicación: `D:\HotelTech\backend`

Construido en Python utilizando **FastAPI**. Es el cerebro lógico que gestiona la base de datos de habitaciones y el menú.

* 📄 **`main.py`**: El archivo principal (entrypoint). Inicializa la API, configura los permisos CORS (para evitar bloqueos de seguridad del navegador) y declara todos los *endpoints* (rutas web como `/login`, `/habitaciones`, `/comandas`).
* 📄 **`models.py`**: Utiliza SQLAlchemy (ORM) para definir cómo serán las tablas en la Base de Datos (ej. la tabla Usuarios, la tabla Productos y la tabla Habitaciones) sin necesidad de escribir SQL puro.
* 📄 **`schemas.py`**: Define mediante `Pydantic` la forma exacta que deben tener los datos de entrada y de salida. Valida que un pago sea numérico, o que el registro de usuario tenga un email válido.
* 📄 **`database.py`**: Se encarga de abrir y mantener la conexión entre Python y el archivo de base de datos (`gastrohotel.db`).
* 📄 **`seed_menu.py` y `seed_rooms.py`**: Son "semillas" de datos. Su función es poblar la base de datos automáticamente con productos del restaurante y números de habitaciones iniciales para no tener una base de datos vacía.
* 📄 **`requirements.txt`**: Listado de todas las librerías necesarias (como `fastapi`, `uvicorn`, `sqlalchemy`) para que el backend funcione en cualquier otra computadora mediante `pip install`.

---

## 📁 3. Frontend (Interfaz Web y Aplicación Móvil)
Ubicación: `D:\HotelTech\frontend`

Construido en TypeScript utilizando **Angular**, con un enfoque fuertemente orientado a componentes reutilizables.

* 📁 **`src/app/`**: Corazón del código visual. Contiene los módulos que el usuario interactúa en la pantalla:
  * 📄 **`app.component.ts / .html`**: Es el componente principal (Layout). Se encarga de mostrar la barra lateral de navegación (Sidebar) y decidir si debe mostrar la vista de Reservas, Recepción o Restaurante según la URL actual.
  * 📄 **`guest-portal.component.ts`**: Lógica de la pantalla de bienvenida, los modales de Iniciar Sesión (Login) y Registro. Controla el acceso inicial.
  * 📄 **`pos.component.ts`**: Es la terminal táctil del Punto de Venta. Maneja el listado de comidas, el filtro por categorías, el carrito (comanda lateral) y el cálculo de subtotales para restaurantes.
  * 📄 **`api.service.ts`**: Es el puente de comunicación. Contiene todas las peticiones `HttpClient` (GET, POST) que se envían desde Angular hacia `main.py` de FastAPI.
* 📄 **`src/styles.css`**: Hoja de estilos global. Aquí se definen todas las variables del "Modo Oscuro" (Dark Mode), la responsividad para móviles (Media Queries) y la solución de corrección de Scroll (CSS `transform` y `position: fixed`).
* 📁 **`src/assets/`**: Almacena de forma estática las imágenes de fondo de alta resolución, logos e íconos utilizados en la interfaz gráfica sin sobrecargar la Base de Datos.
* 📁 **`android/`**: Carpeta generada por Capacitor. Contiene la estructura nativa en lenguaje Java/Kotlin requerida por **Android Studio** para compilar la aplicación web y transformarla en un instalable `.apk` para teléfonos.
* 📄 **`capacitor.config.ts`**: Archivo de configuración que le indica al entorno móvil dónde encontrar el código fuente de Angular (típicamente en la carpeta `dist/`) y qué nombre de App debe llevar.
