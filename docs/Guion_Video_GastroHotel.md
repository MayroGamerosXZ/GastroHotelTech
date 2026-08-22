# Guion de Grabación: Presentación GastroHotel Tech
**Duración estimada:** 8 - 12 minutos
**Consejo:** Ten abiertas previamente todas tus pestañas: Tu página de AWS (IP), GitHub Actions, UptimeRobot, Swagger de FastAPI y Android Studio.

---

## Parte 1: Introducción (1 minuto)
**🗣️ Lo que debes decir:**
> "Hola a todos, mi nombre es Mayro Barrios y hoy les presento la Tarea 02 de Análisis de Sistemas II. Este es mi Producto Mínimo Viable de Software llamado **GastroHotel Tech**. Nace de la necesidad de unificar la gestión de habitaciones y las comandas de restaurante en una sola plataforma rápida, multiplataforma y alojada en la nube."

**🎬 Lo que debes mostrar en pantalla:**
* Tu cámara (opcional) y la pantalla inicial (Home / Login) de tu aplicación web corriendo en la IP de AWS.

---

## Parte 2: Flujo de Pruebas y Funcionalidad (3-4 minutos)
**🗣️ Lo que debes decir:**
> "Comencemos con la demostración funcional. El sistema permite a los clientes registrarse y acceder al portal. Voy a crear un usuario de prueba en este momento..."

**🎬 Lo que debes mostrar en pantalla:**
1. Haz clic en **Crear Cuenta** y llena los datos rápidamente.
2. Haz **Iniciar Sesión** con el usuario que acabas de crear (o uno ya existente).
3. Ingresa a la vista del personal (Staff).

**🗣️ Lo que debes decir:**
> "Una vez dentro del sistema, tenemos dos módulos principales. Primero, el **Rack de Habitaciones**, donde podemos ver de forma visual y con colores el estado actual del hotel: habitaciones libres, ocupadas o en limpieza.
> Segundo, tenemos el **Módulo de Punto de Venta (POS) del restaurante**. Si se dan cuenta, la interfaz es fluida y adaptable. Puedo agregar productos al carrito y simular el cobro de una comanda o enviarlo a cocina."

**🎬 Lo que debes mostrar en pantalla:**
1. Muestra la pestaña de "Recepción" o "Habitaciones".
2. Cambia a la pestaña de "Restaurante (POS)". 
3. Agrega un par de comidas haciendo clic en ellas y muestra el carrito a la derecha.

**🗣️ Lo que debes decir:**
> "Y algo muy importante: este mismo código web ha sido adaptado para móviles. Utilizando el motor de Ionic Capacitor, sincronizamos el frontend de Angular para crear un proyecto nativo."

**🎬 Lo que debes mostrar en pantalla:**
* Abre la ventana de **Android Studio** mostrando el emulador ejecutando la app de GastroHotel, o muestra la pantalla de tu celular si lo tienes conectado. Haz scroll para demostrar que funciona bien en móvil.

---

## Parte 3: Backend y Base de Datos (1.5 minutos)
**🗣️ Lo que debes decir:**
> "Toda esta información gráfica es alimentada por un Backend robusto que desarrollé utilizando el framework **FastAPI** en Python, conectado a una base de datos relacional mediante SQLAlchemy."

**🎬 Lo que debes mostrar en pantalla:**
* Abre una pestaña con la documentación Swagger: `http://localhost:8000/docs` (debes tener corriendo el backend localmente).

**🗣️ Lo que debes decir:**
> "Como pueden ver en la documentación de Swagger generada automáticamente, tenemos nuestros endpoints bien definidos para manejar los menús, las ventas y los usuarios. Todo respondiendo mediante JSON."

---

## Parte 4: Práctica DevOps 1 - GitHub Actions y AWS (2.5 minutos)
**🗣️ Lo que debes decir:**
> "Uno de los retos principales del proyecto fue el despliegue en la nube. Actualmente, el proyecto está hosteado en una instancia de Amazon EC2 de la capa gratuita. Para optimizar los escasos recursos de disco duro y memoria de AWS, evité compilar la aplicación en el servidor. En su lugar, el servidor corre un contenedor súper ligero de **Nginx** usando Docker, el cual solo sirve los archivos estáticos pre-compilados."

**🎬 Lo que debes mostrar en pantalla:**
* Muestra la consola de AWS con tu instancia EC2 en estado "Running".

**🗣️ Lo que debes decir:**
> "Para no tener que subir archivos manualmente por FTP o SSH cada vez que hago un cambio, implementé Integración y Despliegue Continuo (CI/CD) utilizando **GitHub Actions**. Configuré un pipeline que escucha la rama 'main'."

**🎬 Lo que debes mostrar en pantalla:**
1. Muestra la pestaña de **Actions** en tu repositorio de GitHub.
2. Abre uno de los despliegues exitosos (con el chequecito verde).
3. Muestra (sin revelar las claves reales) la pestaña de **Settings > Secrets** para explicar cómo ocultaste la llave `.pem` y la IP de Amazon por seguridad.

---

## Parte 5: Práctica DevOps 2 - Monitoreo con UptimeRobot (1.5 minutos)
**🗣️ Lo que debes decir:**
> "Finalmente, un software empresarial debe tener observabilidad. Si el servidor se cae, yo como administrador debo ser el primero en saberlo, no el cliente. Para esto integré **UptimeRobot**."

**🎬 Lo que debes mostrar en pantalla:**
* Abre el Dashboard de UptimeRobot.

**🗣️ Lo que debes decir:**
> "UptimeRobot hace una petición (Ping) HTTP a la IP de mi servidor en AWS cada 5 minutos. En pantalla pueden ver el monitor configurado en verde (Estado UP). Durante la semana realicé pruebas de estrés apagando el contenedor de Docker; UptimeRobot detectó el código de error y me envió automáticamente una alerta por correo electrónico. Cuando volví a encender el contenedor, me notificó que el servicio fue restablecido. Así garantizamos un monitoreo 24/7."

**🎬 Lo que debes mostrar en pantalla:**
* Señala los eventos en el historial de UptimeRobot (los registros rojos de "Down" y los verdes de "Up").
* (Opcional) Muestra tu bandeja de entrada de correo con el correo de alerta que envía UptimeRobot.

---

## Parte 6: Despedida (30 segundos)
**🗣️ Lo que debes decir:**
> "En conclusión, GastroHotel Tech no solo es un sistema funcional en Front y Backend, sino que cuenta con un ciclo de vida de desarrollo moderno: automatizado, dockerizado y constantemente monitoreado. Muchas gracias por su atención."
