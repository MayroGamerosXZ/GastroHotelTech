# 🏨 GastroHotel Tech

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Android-lightgrey.svg)

**GastroHotel Tech** es un Producto Mínimo Viable (MVP) desarrollado como solución integral para la administración hotelera y gastronómica. El sistema unifica las operaciones de recepción (hospedaje) y punto de venta (restaurante) en una plataforma rápida, responsiva y altamente disponible.

Este repositorio es la entrega oficial para la **Tarea 02** del curso de **Análisis de Sistemas II**.

---

## 👨‍🎓 Información del Estudiante
* **Nombre:** Mayro Geovanni Barrios Gameros
* **Carnet:** 2890-23-11428
* **Universidad:** Universidad Mariano Gálvez de Guatemala (Sede Retalhuleu)
* **Facultad:** Ingeniería en Sistemas - Séptimo Semestre
* **Catedrático:** Ing. Erick Eduardo Pérez Aguilar

---

## 🚀 Tecnologías y Arquitectura

El proyecto fue desarrollado bajo una arquitectura orientada a componentes, utilizando prácticas de ingeniería modernas (SRE y DevOps).

* **Backend & API:** Python, FastAPI, SQLAlchemy (ORM).
* **Frontend:** Angular (TypeScript), HTML5, CSS3 puro (Glassmorphism).
* **Móvil:** Ionic Capacitor (Empaquetado nativo para Android).
* **Base de Datos:** SQLite / PostgreSQL.
* **Infraestructura:** AWS EC2 (Ubuntu Linux).
* **Orquestación:** Docker y Docker Compose (Contenedores Nginx).
* **CI/CD (Integración Continua):** GitHub Actions.
* **Monitoreo (Observabilidad):** UptimeRobot.

> 📊 **Ver Diagrama de Arquitectura:** Haz clic [aquí para ver el diagrama de flujo y despliegue del sistema](./Diagrama_Arquitectura.md).

---

## ✨ Módulos Principales

1. **Recepción y Dashboard:** Gestión visual del estado de las habitaciones (Libre, Ocupada, Limpieza) y KPIs en tiempo real.
2. **Punto de Venta (POS):** Módulo ágil para captura de comandas de restaurante, cálculo de subtotales, propinas e impuestos.
3. **Facturación y Folios:** Consolidación automática de cobros (*Room Charge*) y emisión de comprobantes en PDF.
4. **Portal de Huéspedes:** Registro seguro y autenticación de usuarios.

---

## 🛠️ Despliegue y DevOps (CI/CD)

Este proyecto no depende de despliegues manuales. Cuenta con un flujo de **Integración y Despliegue Continuo** automatizado a través de [GitHub Actions](./.github/workflows/deploy.yml).

Cada vez que se realiza un `push` a la rama `main`:
1. El corredor (runner) de GitHub se conecta por un túnel SSH encriptado a la instancia de **Amazon EC2**.
2. Actualiza los archivos estáticos en el directorio correspondiente.
3. Reinicia los contenedores ultraligeros de **Nginx** orquestados por Docker Compose.

Además, el estado del servidor de producción es monitoreado 24/7 mediante pings automatizados cada 5 minutos usando **UptimeRobot**.

---

## 💻 Instrucciones de Ejecución Local

Si deseas ejecutar este proyecto en un entorno de desarrollo local, sigue estos pasos:

### 1. Levantar el Backend (FastAPI)
```bash
cd backend
# Activar entorno virtual (si aplica) e instalar dependencias
pip install -r requirements.txt
# Correr el servidor lógico
uvicorn main:app --reload
```
*La documentación de Swagger estará disponible en: `http://localhost:8000/docs`*

### 2. Levantar el Frontend (Angular)
```bash
cd frontend
# Instalar dependencias de Node.js
npm install
# Levantar servidor de desarrollo
ng serve
```
*La aplicación web estará disponible en: `http://localhost:4200`*

### 3. Compilación Móvil (Android)
```bash
cd frontend
npm run build
npx cap sync android
npx cap open android
```
*Esto abrirá Android Studio para generar el archivo APK ejecutable.*

---

<p align="center">
  <i>Documentación estructurada y desarrollada en agosto de 2026.</i>
</p>
