# DOCUMENTACIÓN DEL PROYECTO
## GastroHotel Tech
**Producto mínimo de software Backend–Frontend**

**Estudiante:** Mayro Barrios  
**Carné:** `[Escribe tu carné aquí]`  
**Catedrático:** Ing. Erick Eduardo Perez Aguilar  
**Curso:** Análisis de Sistemas II  
**Guatemala, agosto de 2026**

---

### 1. Información general del proyecto
**GastroHotel Tech** es un prototipo funcional para el control integral de un hotel y su restaurante. La solución integra un backend desarrollado con FastAPI, una base de datos relacional, un frontend robusto en Angular empaquetado para web y Android mediante Capacitor, control de versiones con Git/GitHub, despliegue automatizado con GitHub Actions y análisis de disponibilidad en la nube con UptimeRobot.

| **Proyecto** | GastroHotel Tech |
| :--- | :--- |
| **Repositorio GitHub** | `[Pegar link de tu GitHub]` |
| **Video explicativo (Drive)** | `[Pegar link de tu video]` |
| **Versión final** | v1.0.0 |

**Objetivo**
Desarrollar un software mínimo Backend–Frontend multiplataforma que permita gestionar reservaciones, procesar comandas de restaurante, visualizar indicadores de ocupación, y mantener evidencia del proceso de desarrollo y despliegue automatizado en la nube (AWS) mediante herramientas de DevOps.

**Tecnologías utilizadas**
* **Backend:** FastAPI y SQLAlchemy.
* **Base de datos:** SQLite / PostgreSQL.
* **Contenedores:** Docker y Docker Compose (Nginx).
* **Frontend y UI:** Angular (Web) y HTML/CSS con Glassmorphism.
* **Móvil:** Ionic Capacitor y Android Studio.
* **Control de versiones:** Git y GitHub.
* **CI/CD (DevOps):** GitHub Actions.
* **Infraestructura y Monitoreo:** AWS EC2 y UptimeRobot.

---

### 2. Funcionalidades implementadas

| **Módulo** | **Descripción** |
| :--- | :--- |
| **Recepción y Dashboard** | Indicadores de ocupación total, habitaciones libres y limpiezas pendientes. Rack interactivo por colores según el estado de la habitación. |
| **Restaurante (POS)** | Catálogo de combustibles adaptado a menú gastronómico (Desayunos, Bebidas, etc.) con cálculo de subtotales, propinas y comandos a cocina. |
| **Facturación de Folios** | Registro de ventas, unificación de consumos (Room Charge), y validación de cobros totales por hospedaje y restaurante. |
| **AWS y Nginx** | Consulta y alojamiento de archivos estáticos súper optimizados en un contenedor Linux para evadir los límites de memoria de la capa gratuita. |
| **App Móvil (Android)** | Sincronización del código de Angular nativamente hacia el celular usando Capacitor. |
| **CI/CD y Monitoreo** | Pipeline de despliegue directo a AWS en cada "Push" (GitHub Actions) y vigilancia del servidor 24/7 (UptimeRobot). |

**Flujo general:** 
El frontend en Angular (Web/Móvil) consume la API construida en FastAPI; FastAPI procesa las reservaciones y comandas, aplicando la persistencia de datos. GitHub Actions obtiene el código más reciente y ejecuta comandos remotos por SSH hacia Amazon AWS para actualizar los contenedores Docker en vivo. Simultáneamente, UptimeRobot hace peticiones al servidor para garantizar que la plataforma nunca caiga.

---

### 3. Evidencias del desarrollo y pruebas
Las siguientes evidencias corresponden a las capturas proporcionadas durante el desarrollo del proyecto. Se presentan en orden técnico para mostrar configuración, pruebas del backend, frontend y herramientas de gestión y DevOps.

**Resumen de evidencias**
* 3.1 Configuración inicial, Git y Docker
* 3.2 Backend FastAPI y Endpoints (Swagger 8000/docs)
* 3.3 Dashboard y módulos funcionales del Frontend
* 3.4 Adaptación Móvil (Android Studio y Capacitor)
* 3.5 Despliegue en AWS EC2 (Servidor y Consola)
* 3.6 Automatización con GitHub Actions (CI/CD)
* 3.7 Monitorización y alertas con UptimeRobot

> **Nota:** Sustituye los textos indicados por tus propias capturas de pantalla tomadas de tu proyecto y entorno real.

<br>

#### 3.1 Configuración inicial, Git y Docker
Se evidencia la creación del repositorio, el uso de control de versiones y el contenedor ejecutándose localmente.

*( 📸 CAPTURA: Terminal mostrando git status / git log, o Docker Desktop corriendo )*

#### 3.2 Backend FastAPI y Endpoints (Swagger 8000/docs)
La API documenta los endpoints de habitaciones, comandas y usuarios, junto con respuestas de base de datos correctas. (Pruebas del entorno Backend).

*( 📸 CAPTURA: Navegador en http://localhost:8000/docs mostrando la lista de endpoints de FastAPI )*
*( 📸 CAPTURA: Prueba de un endpoint ejecutado en Swagger devolviendo código 200 OK )*

#### 3.3 Dashboard y módulos funcionales del Frontend
Se evidencian las pantallas principales del sistema Angular interactuando con los datos en vivo, mostrando los colores dinámicos y la estructura del Punto de Venta (POS).

*( 📸 CAPTURA: Pantalla de "Recepción" o el Rack de Habitaciones )*
*( 📸 CAPTURA: Pantalla del POS de Restaurante cobrando una mesa )*

#### 3.4 Adaptación Móvil (Android Studio y Capacitor)
El entorno Angular fue empaquetado exitosamente y renderizado en un dispositivo Android.

*( 📸 CAPTURA: Entorno de Android Studio con el proyecto abierto, y/o el emulador de Android mostrando tu app )*

#### 3.5 Despliegue en AWS EC2 (Servidor y Consola)
Se configuró una instancia en Amazon Web Services, utilizando contenedores Nginx sumamente ligeros para solucionar problemas de disco ("No space left on device").

*( 📸 CAPTURA: Consola web de AWS mostrando tu instancia EC2 en verde "Running" y su IP )*

#### 3.6 Automatización con GitHub Actions (CI/CD)
El sistema detecta automáticamente los cambios en el código y los despliega al servidor sin necesidad de comandos manuales.

*( 📸 CAPTURA: Panel "Actions" de tu repositorio de GitHub mostrando el pipeline `Deploy to AWS EC2` en color verde ✔️ )*

#### 3.7 Monitorización y alertas con UptimeRobot
Se controla la salud del servidor en la nube con "pings" cada 5 minutos. Se validaron las notificaciones automáticas tras simular caídas de Docker.

*( 📸 CAPTURA: Panel de UptimeRobot mostrando la IP de tu hotel en estado "UP" verde )*

---

### 4. Conclusiones

* El proyecto integra de forma funcional un frontend Angular con una API construida en FastAPI, demostrando dominio de comunicaciones asíncronas e interfaces modernas.
* Las operaciones de Punto de Venta y Hospedaje están relacionadas lógicamente, permitiendo calcular cuentas finales ("Room Charges") y validar inventario.
* El uso de herramientas DevOps como GitHub Actions aportó trazabilidad e inmediatez al proceso de desarrollo, ahorrando horas de mantenimiento y mitigando el riesgo de errores en despliegues.
* La integración de UptimeRobot permite analizar los indicadores principales de la operación (SLA) y prevenir pérdidas en el negocio mediante alertas por correo electrónico ante caídas de Nginx.
* Las evidencias muestran pruebas satisfactorias de UI, resolución de fallos estructurales de CSS (`transform` vs `position fixed`) y el correcto empaquetado del software hacia dispositivos nativos Android.

<br>
<br>
<center><b>FIN DE LA DOCUMENTACIÓN</b></center>
