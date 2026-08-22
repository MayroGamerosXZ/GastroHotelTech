/**
 * Servicio de Conexión HTTP.
 * Centraliza todas las llamadas a la API de FastAPI (GET, POST, PUT, DELETE) desde el frontend.
 */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Permite configurar la URL dinámicamente desde la interfaz (útil para Ngrok en la App Móvil)
  private baseUrl = localStorage.getItem('API_URL') || 'http://3.15.199.136:8000';

  constructor(private http: HttpClient) { }

  private getHeaders() {
    return {
      headers: {
        'ngrok-skip-browser-warning': '69420',
        'Bypass-Tunnel-Reminder': 'true'
      }
    };
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
    localStorage.setItem('API_URL', url);
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  crearHuesped(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/huespedes/`, data, this.getHeaders());
  }

  crearReserva(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservas/`, data, this.getHeaders());
  }

  obtenerReservas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reservas/`, this.getHeaders());
  }

  obtenerRack(): Observable<any> {
    return this.http.get(`${this.baseUrl}/rack/`, this.getHeaders());
  }

  obtenerDetalleHabitacion(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/rack/${id}`, this.getHeaders());
  }

  obtenerArticulos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/articulos/`, this.getHeaders());
  }

  crearComanda(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/comandas/`, data, this.getHeaders());
  }

  loginStaff(pin: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/staff/`, { pin }, this.getHeaders());
  }

  loginGuest(doc: string, pin: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/login/guest/`, { doc_identidad: doc, codigo_pin: pin }, this.getHeaders());
  }

  solicitarLimpieza(habitacion: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/solicitar_limpieza/`, { habitacion }, this.getHeaders());
  }

  // Check-in / Check-out
  cambiarEstadoReserva(idReserva: number, estado: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/reservas/${idReserva}/estado`, { estado }, this.getHeaders());
  }

  // Limpieza
  marcarLimpieza(idHabitacion: number, estado: string = 'Limpia'): Observable<any> {
    return this.http.patch(`${this.baseUrl}/habitaciones/${idHabitacion}/limpieza`, { estado }, this.getHeaders());
  }

  // CRM Huéspedes
  listarHuespedes(): Observable<any> {
    return this.http.get(`${this.baseUrl}/huespedes/`, this.getHeaders());
  }

  // Staff CRUD
  listarStaff(): Observable<any> {
    return this.http.get(`${this.baseUrl}/staff/`, this.getHeaders());
  }
  crearStaff(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/staff/`, data, this.getHeaders());
  }
  editarStaff(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/staff/${id}`, data, this.getHeaders());
  }
  eliminarStaff(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/staff/${id}`, this.getHeaders());
  }

  // Reportes
  obtenerReporte(): Observable<any> {
    return this.http.get(`${this.baseUrl}/reportes/resumen`, this.getHeaders());
  }

  // Pago de folio
  registrarPago(idReserva: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/reservas/${idReserva}/pago`, payload, this.getHeaders());
  }

  // POS Walk-in: Comandas activas sin habitación
  listarComandasActivas(): Observable<any> {
    return this.http.get(`${this.baseUrl}/comandas/activas`, this.getHeaders());
  }

  // POS Walk-in: Cobrar comanda directamente
  cobrarComanda(idComanda: number, payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/comandas/${idComanda}/pago`, payload, this.getHeaders());
  }

  // Auth Huéspedes
  registrarHuespedEmail(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/huesped/registro`, payload, this.getHeaders());
  }

  loginHuespedEmail(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/huesped/login`, payload, this.getHeaders());
  }

  // Configuración & Precios de Hotel
  obtenerConfiguracion(): Observable<any> {
    return this.http.get(`${this.baseUrl}/configuracion/`, this.getHeaders());
  }

  actualizarConfiguracion(payload: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/configuracion/`, payload, this.getHeaders());
  }

  actualizarHabitacion(idHabitacion: number, payload: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/habitaciones/${idHabitacion}`, payload, this.getHeaders());
  }

  // Inventario y Recetas
  obtenerInsumos(): Observable<any> {
    return this.http.get(`${this.baseUrl}/insumos/`, this.getHeaders());
  }
  crearInsumo(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/insumos/`, data, this.getHeaders());
  }
  actualizarInsumo(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/insumos/${id}`, data, this.getHeaders());
  }
  agregarReceta(idArticulo: number, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/articulos/${idArticulo}/recetas/`, data, this.getHeaders());
  }
  eliminarReceta(idReceta: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/recetas/${idReceta}`, this.getHeaders());
  }
}
