import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
# Se recomienda usar variables de entorno para esto en producción
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "tu_correo@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "tu_app_password")

def enviar_correo(destinatario: str, asunto: str, cuerpo_html: str):
    """ Función base para enviar un correo """
    if SMTP_EMAIL == "tu_correo@gmail.com":
        print(f"⚠️ [MOCK EMAIL] Para: {destinatario} | Asunto: {asunto}")
        print("Configura SMTP_EMAIL y SMTP_PASSWORD para enviar correos reales.")
        return
        
    msg = MIMEMultipart("alternative")
    msg['Subject'] = asunto
    msg['From'] = f"GastroHotel Tech <{SMTP_EMAIL}>"
    msg['To'] = destinatario

    html_part = MIMEText(cuerpo_html, 'html')
    msg.attach(html_part)

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_EMAIL, SMTP_PASSWORD)
            server.send_message(msg)
            print(f"✅ Correo enviado exitosamente a {destinatario}")
    except Exception as e:
        print(f"❌ Error enviando correo a {destinatario}: {str(e)}")

def enviar_correo_confirmacion(email_destino: str, id_reserva: int, habitacion: str, fecha_checkin: str, fecha_checkout: str):
    asunto = f"Confirmación de Reserva #{id_reserva} - GastroHotel"
    cuerpo = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #1e3a5f; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">GastroHotel Tech</h1>
                </div>
                <div style="padding: 20px;">
                    <h2>¡Tu reserva está confirmada!</h2>
                    <p>Gracias por elegirnos. Aquí tienes los detalles de tu estancia:</p>
                    <ul>
                        <li><strong>Reserva ID:</strong> RES-{id_reserva}</li>
                        <li><strong>Habitación:</strong> #{habitacion}</li>
                        <li><strong>Check-in:</strong> {fecha_checkin}</li>
                        <li><strong>Check-out:</strong> {fecha_checkout}</li>
                    </ul>
                    <p>Te esperamos. Si tienes alguna duda, responde a este correo.</p>
                </div>
                <div style="background-color: #f8fafc; color: #64748b; padding: 15px; text-align: center; font-size: 12px;">
                    GastroHotel Tech Resort & Spa - Antigua Guatemala
                </div>
            </div>
        </body>
    </html>
    """
    enviar_correo(email_destino, asunto, cuerpo)

def enviar_correo_factura(email_destino: str, id_factura: int, total: float):
    asunto = f"Factura #{id_factura} de tu consumo - GastroHotel"
    cuerpo = f"""
    <html>
        <body style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #10b981; color: white; padding: 20px; text-align: center;">
                    <h1 style="margin: 0;">Pago Procesado Exitosamente</h1>
                </div>
                <div style="padding: 20px;">
                    <h2>Gracias por tu pago</h2>
                    <p>Hemos registrado tu pago por un total de <strong>Q. {total:.2f}</strong> asociado a la Factura #{id_factura}.</p>
                    <p>Esperamos que hayas disfrutado de nuestros servicios.</p>
                </div>
            </div>
        </body>
    </html>
    """
    enviar_correo(email_destino, asunto, cuerpo)
