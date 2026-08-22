/**
 * Componente de Portal de Huéspedes.
 * Controla la pantalla de bienvenida, registro de nuevos clientes y modales de inicio de sesión.
 */
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-guest-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="guest-portal animate-fade-in" style="min-height: 100vh; position: relative; display: flex; flex-direction: column; background: url('/assets/hotel_room_background.jpg') center/cover no-repeat; background-attachment: fixed;">
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.55); z-index: 1;"></div>

    <!-- HEADER DE NAVEGACIÓN -->
    <header style="position: relative; z-index: 10; padding: 1.5rem 3rem; display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); backdrop-filter: blur(8px); border-bottom: 1px solid rgba(255,255,255,0.1);">
      <div class="logo" style="display: flex; align-items: center; gap: 1rem; cursor: pointer;" (click)="activeTab = 'home'; showRoomService = false;">
        <div style="width: 44px; height: 54px; border: 2px solid #f59e0b; display: flex; align-items: center; justify-content: center; font-family: serif; font-size: 1.4rem; color: #f59e0b; font-weight: bold; border-radius: 4px;">GH</div>
        <div>
          <h2 style="font-family: serif; font-weight: 400; letter-spacing: 2px; margin: 0; font-size: 1.2rem; color: white;">GASTRO HOTEL</h2>
          <p style="font-size: 0.6rem; letter-spacing: 3px; margin: 0; color: #f59e0b;">RESORT & SPA — ANTIGUA</p>
        </div>
      </div>
      
      <nav *ngIf="!showRoomService" class="flex gap-6 items-center" style="font-size: 0.85rem; font-weight: 500; letter-spacing: 1px;">
        <a (click)="activeTab = 'home'" [style.color]="activeTab === 'home' ? '#f59e0b' : 'white'" style="cursor: pointer; transition: color 0.3s;">INICIO</a>
        <a (click)="activeTab = 'habitaciones'" [style.color]="activeTab === 'habitaciones' ? '#f59e0b' : 'white'" style="cursor: pointer; transition: color 0.3s;">HABITACIONES & PRECIOS</a>
        
        <ng-container *ngIf="clienteAutenticado">
          <span style="color: #60a5fa; font-weight: 600; background: rgba(96,165,250,0.15); padding: 0.4rem 0.8rem; border-radius: 20px; border: 1px solid rgba(96,165,250,0.3);">
            👤 {{ clienteAutenticado.nombres_completos }}
          </span>
          <button (click)="showGuestLogin = true" style="background: rgba(245,158,11,0.2); border: 1px solid #f59e0b; color: #f59e0b; padding: 0.4rem 0.8rem; border-radius: 4px; font-weight: 600; cursor: pointer;">
            🛎️ MI PIN / ROOM SERVICE
          </button>
          <a (click)="cerrarSesionCliente()" style="cursor: pointer; color: #ef4444; font-size: 0.8rem;">SALIR</a>
        </ng-container>

        <ng-container *ngIf="!clienteAutenticado">
          <button (click)="showEmailLoginModal = true" style="background: transparent; border: 1px solid rgba(255,255,255,0.4); color: white; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.8rem;">
            🔑 INICIAR SESIÓN
          </button>
          <button (click)="showRegisterModal = true" style="background: #f59e0b; border: none; color: white; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 0.8rem;">
            ✨ CREAR CUENTA
          </button>
        </ng-container>
      </nav>

      <nav *ngIf="showRoomService" class="flex gap-4 items-center">
        <span style="color: #f59e0b; font-weight: 700; font-size: 0.9rem;">HOLA, {{ guestData?.huesped | uppercase }} (HAB: {{ guestData?.habitacion }})</span>
        <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 0.4rem 0.8rem;" (click)="showRoomService = false; activeTab = 'home';">VOLVER AL PORTAL</button>
      </nav>
      
      <div class="flex gap-2">
        <button *ngIf="!showRoomService" class="btn" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; font-size: 0.75rem;" (click)="showStaffLogin = true">Acceso Staff</button>
        <button class="btn" style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.2); color: #cbd5e1; font-size: 0.75rem;" (click)="openSettings.emit()">⚙️</button>
      </div>
    </header>

    <!-- TAB 1: LANDING VIEW -->
    <ng-container *ngIf="!showRoomService && activeTab === 'home'">
      <main style="position: relative; z-index: 10; flex: 1; display: flex; align-items: center; padding: 2rem 4rem;">
        <div style="max-width: 650px;">
          <div style="display: inline-block; background: rgba(245,158,11,0.2); border: 1px solid #f59e0b; color: #f59e0b; padding: 0.4rem 1rem; border-radius: 20px; font-size: 0.8rem; font-weight: 600; margin-bottom: 1rem; letter-spacing: 1px;">
            ANTIGUA GUATEMALA — RESORT EXCLUSIVO
          </div>
          <h1 style="font-family: serif; font-size: 3.5rem; font-weight: 300; line-height: 1.15; margin-bottom: 1.25rem; color: white; text-shadow: 0 4px 16px rgba(0,0,0,0.7);">
            Vive la Experiencia de Lujo & Gastronomía Colonial
          </h1>
          <p style="font-size: 1.05rem; font-weight: 300; margin-bottom: 2rem; color: #cbd5e1; text-shadow: 0 2px 4px rgba(0,0,0,0.7); line-height: 1.6;">
            Habitaciones con vista al volcán, alta cocina internacional y servicio personalizado de primer nivel.
          </p>
          <div style="display: flex; gap: 1rem;">
            <button (click)="activeTab = 'habitaciones'" style="background: #f59e0b; color: white; border: none; padding: 0.9rem 2rem; font-weight: 700; border-radius: 6px; cursor: pointer; letter-spacing: 1px;">
              VER HABITACIONES & TARIFAS
            </button>
          </div>
        </div>
      </main>

      <!-- BARRA DE RESERVA RÁPIDA -->
      <div style="position: relative; z-index: 20; background: rgba(15, 17, 21, 0.9); backdrop-filter: blur(12px); border-top: 1px solid rgba(255,255,255,0.15); padding: 1.25rem 4rem;">
        <div class="flex items-center justify-between gap-4">
          <div class="flex gap-4" style="flex: 1;">
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 0.4rem;">Check In</label>
              <input type="date" [(ngModel)]="checkinDate" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); padding: 0.7rem; color: white; border-radius: 6px;">
            </div>
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 0.4rem;">Check Out</label>
              <input type="date" [(ngModel)]="checkoutDate" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); padding: 0.7rem; color: white; border-radius: 6px;">
            </div>
            <div style="flex: 1;">
              <label style="display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 0.4rem;">Habitación Seleccionada</label>
              <select [(ngModel)]="selectedHabitacionId" style="width: 100%; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); padding: 0.7rem; color: white; border-radius: 6px;">
                <option *ngFor="let hab of rack" [value]="hab.id_habitacion">
                  Hab {{ hab.id_habitacion }} — {{ hab.tipo }} (Vista {{ hab.vista }}) — Q.{{ hab.precio_actual }}/noche
                </option>
              </select>
            </div>
          </div>
          <button (click)="onReservar()" style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 0.9rem 2.5rem; font-weight: 700; font-size: 1rem; letter-spacing: 1px; cursor: pointer; border-radius: 6px; box-shadow: 0 4px 12px rgba(245,158,11,0.3);">
            RESERVAR AHORA
          </button>
        </div>
      </div>
    </ng-container>

    <!-- TAB 2: CATÁLOGO DE HABITACIONES & PRECIOS -->
    <ng-container *ngIf="!showRoomService && activeTab === 'habitaciones'">
      <main style="position: relative; z-index: 10; flex: 1; padding: 2rem 4rem; max-width: 1200px; margin: 0 auto; width: 100%;">
        <h2 style="font-family: serif; font-size: 2.2rem; margin-bottom: 0.5rem; color: white;">Nuestras Habitaciones & Suites</h2>
        <p style="color: #cbd5e1; margin-bottom: 2rem; font-size: 0.95rem;">Precios personalizados según categoría, vista panorámica y temporada alta.</p>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
          <div *ngFor="let hab of rack" class="glass-panel" style="padding: 1.5rem; border-radius: 12px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid rgba(255,255,255,0.12); background: rgba(15,17,21,0.85);">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem;">
                <span style="background: rgba(245,158,11,0.2); color: #f59e0b; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">
                  Habitación {{ hab.id_habitacion }}
                </span>
                <span style="background: rgba(96,165,250,0.2); color: #60a5fa; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 500;">
                  🌅 Vista: {{ hab.vista }}
                </span>
              </div>

              <h3 style="font-size: 1.4rem; font-family: serif; margin-bottom: 0.5rem;">{{ hab.tipo }}</h3>
              <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 1rem; line-height: 1.5;">
                {{ hab.descripcion || 'Elegante habitación equipada con cama king, aire acondicionado y amenities de lujo.' }}
              </p>

              <div style="background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 8px; margin-bottom: 1.25rem;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.4rem;">
                  <span style="color: #94a3b8;">Capacidad:</span>
                  <span style="color: white; font-weight: 600;">👥 {{ hab.capacidad }} Personas</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.4rem;">
                  <span style="color: #94a3b8;">Desayuno:</span>
                  <span [style.color]="hab.incluye_desayuno ? '#10b981' : '#f59e0b'" style="font-weight: 600;">
                    {{ hab.incluye_desayuno ? '☕ Incluido' : '🍳 Adicional' }}
                  </span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                  <span style="color: #94a3b8;">Estado:</span>
                  <span [style.color]="hab.estado_ocupacion === 'Libre' ? '#10b981' : '#ef4444'" style="font-weight: 600;">
                    {{ hab.estado_ocupacion === 'Libre' ? '✅ Disponible' : '🔒 ' + hab.estado_ocupacion }}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1rem; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
                <div>
                  <span style="font-size: 0.7rem; color: #94a3b8; display: block;">Tarifa Estándar: Q.{{ hab.precio_base }}</span>
                  <span *ngIf="hab.precio_temporada_alta > 0" style="font-size: 0.7rem; color: #f59e0b; display: block;">Temp. Alta: Q.{{ hab.precio_temporada_alta }}</span>
                </div>
                <div style="text-align: right;">
                  <span style="font-size: 1.5rem; font-weight: 700; color: #10b981;">Q. {{ hab.precio_actual }}</span>
                  <span style="font-size: 0.75rem; color: #94a3b8;"> / noche</span>
                </div>
              </div>

              <button (click)="seleccionarYReservar(hab)" [disabled]="hab.estado_ocupacion !== 'Libre'"
                [style.opacity]="hab.estado_ocupacion === 'Libre' ? '1' : '0.5'"
                style="width: 100%; background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; padding: 0.8rem; font-weight: 700; border-radius: 6px; cursor: pointer;">
                {{ hab.estado_ocupacion === 'Libre' ? 'SELECCIONAR Y RESERVAR' : 'NO DISPONIBLE' }}
              </button>
            </div>
          </div>
        </div>
      </main>
    </ng-container>

    <!-- ROOM SERVICE VIEW (Logged in with PIN) -->
    <ng-container *ngIf="showRoomService">
      <main style="position: relative; z-index: 10; flex: 1; display: flex; gap: 2rem; padding: 2rem 4rem;">
        
        <div style="flex: 2; background: rgba(15, 17, 21, 0.85); backdrop-filter: blur(10px); border-radius: var(--radius-lg); padding: 2rem; border: 1px solid rgba(255,255,255,0.1);">
          <h2 style="margin-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 1rem;">Menú Room Service</h2>
          
          <div *ngIf="guestData?.estado === 'Pendiente'" style="padding: 2rem; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); border-radius: 8px; text-align: center;">
            <h3 style="color: var(--danger);">Servicio Bloqueado</h3>
            <p>Tu reserva aún está en estado "Pendiente". Debes presentarte a Recepción para realizar tu Check-in y habilitar el cobro a la habitación.</p>
          </div>
          
          <div *ngIf="guestData?.estado !== 'Pendiente'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; max-height: 50vh; overflow-y: auto;">
            <div *ngFor="let articulo of articulos" class="glass-card flex-col" style="padding: 1rem;">
              <h3 style="font-size: 1rem; margin-bottom: 0.25rem;">{{ articulo.nombre }}</h3>
              <p style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.75rem;">Q. {{ articulo.precio | number:'1.2-2' }}</p>
              <button class="btn btn-primary" style="margin-top: auto; width: 100%; padding: 0.5rem;" (click)="pedirArticulo(articulo)">Pedir a Cuarto</button>
            </div>
          </div>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; gap: 2rem;">
          <div style="background: rgba(15, 17, 21, 0.85); backdrop-filter: blur(10px); border-radius: var(--radius-lg); padding: 2rem; border: 1px solid rgba(255,255,255,0.1);">
            <h2 style="margin-bottom: 1.5rem;">Servicios Generales</h2>
            <button class="btn btn-secondary" style="width: 100%; padding: 1rem; margin-bottom: 1rem; background: rgba(59, 130, 246, 0.2); border-color: rgba(59, 130, 246, 0.5);" (click)="pedirLimpieza()">
              🧹 Solicitar Limpieza de Habitación
            </button>
            <button class="btn btn-secondary" style="width: 100%; padding: 1rem; background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.5);">
              📞 Hablar con Recepción
            </button>
          </div>
        </div>

      </main>
    </ng-container>

    <!-- MODAL 1: REGISTRO DE CUENTA DE HUÉSPED (Email + Contraseña) -->
    <div *ngIf="showRegisterModal" style="position: fixed; inset:0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
      <div class="glass-panel" style="padding: 2.5rem; width: 450px; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-bottom: 0.25rem; color: #f59e0b;">Crear Cuenta de Cliente</h2>
        <p style="margin-bottom: 1.5rem; font-size: 0.85rem; color: #94a3b8;">Registra tus datos para hacer reservas y gestionar tu estadía.</p>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.25rem;">Nombres Completos</label>
          <input type="text" [(ngModel)]="regNombre" placeholder="Ej: Juan Carlos Pérez" style="width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.25rem;">DPI / Documento Identidad</label>
          <input type="text" [(ngModel)]="regDpi" placeholder="Ej: 2983748291001" style="width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.25rem;">Correo Electrónico</label>
          <input type="email" [(ngModel)]="regEmail" placeholder="juan@ejemplo.com" style="width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.25rem;">Teléfono de Contacto</label>
          <input type="text" [(ngModel)]="regTelefono" placeholder="+502 5555-5555" style="width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.25rem;">Contraseña</label>
          <input type="password" [(ngModel)]="regPassword" placeholder="••••••••" style="width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
        </div>

        <div class="flex gap-2">
          <button class="btn btn-secondary" style="flex: 1;" (click)="showRegisterModal = false">Cancelar</button>
          <button class="btn btn-primary" style="flex: 1; background: #f59e0b; border: none; font-weight: 700;" (click)="onRegisterSubmit()">Registrarme</button>
        </div>
      </div>
    </div>

    <!-- MODAL 2: INICIO DE SESIÓN DE HUÉSPED (Email + Contraseña) -->
    <div *ngIf="showEmailLoginModal" style="position: fixed; inset:0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
      <div class="glass-panel" style="padding: 2.5rem; width: 400px;">
        <h2 style="margin-bottom: 0.25rem; color: #f59e0b;">Iniciar Sesión</h2>
        <p style="margin-bottom: 1.5rem; font-size: 0.85rem; color: #94a3b8;">Ingresa con tu correo y contraseña.</p>

        <div style="margin-bottom: 1rem;">
          <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.25rem;">Correo Electrónico</label>
          <input type="email" [(ngModel)]="loginEmail" placeholder="juan@ejemplo.com" style="width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
        </div>

        <div style="margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.75rem; color: #cbd5e1; margin-bottom: 0.25rem;">Contraseña</label>
          <input type="password" [(ngModel)]="loginPassword" placeholder="••••••••" style="width: 100%; padding: 0.75rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px;">
        </div>

        <div class="flex gap-2" style="margin-bottom: 1rem;">
          <button class="btn btn-secondary" style="flex: 1;" (click)="showEmailLoginModal = false">Cancelar</button>
          <button class="btn btn-primary" style="flex: 1; background: #f59e0b; border: none; font-weight: 700;" (click)="onEmailLoginSubmit()">Entrar</button>
        </div>

        <div style="text-align: center; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem;">
          <p style="font-size: 0.8rem; color: #94a3b8;">¿No tienes cuenta? <a (click)="showEmailLoginModal = false; showRegisterModal = true;" style="color: #f59e0b; cursor: pointer; font-weight: 600;">Regístrate aquí</a></p>
        </div>
      </div>
    </div>

    <!-- MODAL 3: INGRESO CON PIN DE RESERVA (ROOM SERVICE) -->
    <div *ngIf="showGuestLogin" style="position: fixed; inset:0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(5px);">
      <div class="glass-panel" style="padding: 2.5rem; width: 400px; text-align: center;">
        <h2 style="margin-bottom: 0.5rem; color: #f59e0b;">Acceso Room Service</h2>
        <p style="margin-bottom: 1.5rem; font-size: 0.85rem; color: #94a3b8;">Ingresa con tu Documento y PIN asignado en Recepción</p>
        
        <input type="text" [(ngModel)]="guestDoc" placeholder="Documento de Identidad (DPI)" style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; text-align: center; border-radius: 6px;">
        <input type="text" [(ngModel)]="guestPin" placeholder="PIN (6 dígitos)" style="width: 100%; padding: 0.75rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; text-align: center; letter-spacing: 4px; font-size: 1.1rem; border-radius: 6px;">
        
        <div class="flex gap-2">
          <button class="btn btn-secondary" style="flex: 1;" (click)="showGuestLogin = false">Cancelar</button>
          <button class="btn btn-primary" style="flex: 1; background: #f59e0b; border: none; color: white; font-weight: bold;" (click)="onGuestLoginSubmit()">Ingresar</button>
        </div>
      </div>
    </div>

    <!-- MODAL 4: LOGIN STAFF -->
    <div *ngIf="showStaffLogin" style="position: fixed; inset:0; background: rgba(0,0,0,0.85); z-index: 100; display: flex; align-items: center; justify-content: center;">
      <div class="glass-panel" style="padding: 2rem; width: 350px; text-align: center;">
        <h3 style="margin-bottom: 1.5rem;">Acceso Empleados</h3>
        <input type="password" [(ngModel)]="staffPin" placeholder="PIN" style="width: 100%; padding: 0.75rem; margin-bottom: 1rem; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.2); color: white; text-align: center; letter-spacing: 10px; font-size: 1.5rem; border-radius: 6px;">
        <div class="flex gap-2">
          <button class="btn btn-secondary" style="flex: 1;" (click)="showStaffLogin = false">Cancelar</button>
          <button class="btn btn-primary" style="flex: 1;" (click)="onStaffLoginSubmit()">Entrar</button>
        </div>
      </div>
    </div>
    
  </div>
  `
})
export class GuestPortalComponent implements OnInit {
  @Output() staffLoggedIn = new EventEmitter<any>();
  @Output() openSettings = new EventEmitter<void>();
  
  activeTab: 'home' | 'habitaciones' = 'home';
  checkinDate = '';
  checkoutDate = '';
  numHuespedes = 2;
  selectedHabitacionId: number = 101;
  rack: any[] = [];
  
  // Auth Cliente
  clienteAutenticado: any = null;
  showRegisterModal = false;
  showEmailLoginModal = false;
  
  regNombre = '';
  regDpi = '';
  regEmail = '';
  regPassword = '';
  regTelefono = '';

  loginEmail = '';
  loginPassword = '';

  // PIN Access
  showStaffLogin = false;
  staffPin = '';

  showGuestLogin = false;
  guestDoc = '';
  guestPin = '';
  
  showRoomService = false;
  guestData: any = null;
  articulos: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    if (Capacitor.isNativePlatform()) {
      this.showStaffLogin = true;
    }
    
    this.cargarHabitaciones();
    this.api.obtenerArticulos().subscribe(data => this.articulos = data);
    
    // Verificar si hay sesión guardada en localStorage
    const saved = localStorage.getItem('cliente_gastrohotel');
    if (saved) {
      try { this.clienteAutenticado = JSON.parse(saved); } catch (e) {}
    }

    // Fechas por defecto (hoy y mañana)
    const hoy = new Date();
    const manana = new Date();
    manana.setDate(hoy.getDate() + 1);
    this.checkinDate = hoy.toISOString().split('T')[0];
    this.checkoutDate = manana.toISOString().split('T')[0];
  }

  cargarHabitaciones() {
    this.api.obtenerRack().subscribe(data => {
      this.rack = data;
      if (this.rack.length > 0 && !this.selectedHabitacionId) {
        this.selectedHabitacionId = this.rack[0].id_habitacion;
      }
    });
  }

  seleccionarYReservar(hab: any) {
    this.selectedHabitacionId = hab.id_habitacion;
    this.onReservar();
  }

  onReservar() {
    if (!this.clienteAutenticado) {
      alert("Por favor, inicia sesión o crea una cuenta para poder realizar tu reserva.");
      this.showEmailLoginModal = true;
      return;
    }

    if (!this.checkinDate || !this.checkoutDate) {
      alert("Por favor, selecciona las fechas de Check-in y Check-out.");
      return;
    }

    const reservaData = {
      id_huesped: this.clienteAutenticado.id_huesped,
      id_habitacion: this.selectedHabitacionId || 101,
      fecha_checkin: this.checkinDate,
      fecha_checkout: this.checkoutDate
    };

    this.api.crearReserva(reservaData).subscribe({
      next: (res) => {
        alert(`🎉 ¡RESERVA CONFIRMADA EXCLUSIVAMENTE PARA ${this.clienteAutenticado.nombres_completos.toUpperCase()}!\n\nNo. de Reserva: #${res.id_reserva}\nHabitación: ${res.id_habitacion}\nPIN DE ACCESO DE ROOM SERVICE: ${res.codigo_pin}\n\nGuarda tu PIN para usar Room Service al hacer tu Check-in.`);
        this.cargarHabitaciones();
        
        // Si el cliente quiere, iniciamos sesión con el PIN inmediatamente
        this.guestDoc = this.clienteAutenticado.doc_identidad;
        this.guestPin = res.codigo_pin;
      },
      error: (err) => {
        let errorMsg = err.message;
        if (err.error && err.error.detail) {
          errorMsg = typeof err.error.detail === 'string' ? err.error.detail : JSON.stringify(err.error.detail);
        }
        alert("Atención: Hubo un problema procesando la reserva.\nDetalle: " + errorMsg);
      }
    });
  }

  onRegisterSubmit() {
    if (!this.regNombre || !this.regDpi || !this.regEmail || !this.regPassword) {
      alert("Por favor, llena todos los campos obligatorios.");
      return;
    }

    const payload = {
      nombres_completos: this.regNombre,
      doc_identidad: this.regDpi,
      email: this.regEmail,
      password: this.regPassword,
      telefono: this.regTelefono
    };

    this.api.registrarHuespedEmail(payload).subscribe({
      next: (res) => {
        alert(`✅ Cuenta creada exitosamente. ¡Bienvenido ${res.nombres_completos}!`);
        this.clienteAutenticado = res;
        localStorage.setItem('cliente_gastrohotel', JSON.stringify(res));
        this.showRegisterModal = false;
      },
      error: (err) => alert("Error al registrarse: " + (err.error?.detail || err.message))
    });
  }

  onEmailLoginSubmit() {
    if (!this.loginEmail || !this.loginPassword) {
      alert("Ingresa tu correo y contraseña.");
      return;
    }

    const payload = {
      email: this.loginEmail,
      password: this.loginPassword
    };

    this.api.loginHuespedEmail(payload).subscribe({
      next: (res) => {
        this.clienteAutenticado = res;
        localStorage.setItem('cliente_gastrohotel', JSON.stringify(res));
        this.showEmailLoginModal = false;
        alert(`👋 Hola de nuevo, ${res.nombres_completos}`);
      },
      error: (err) => alert("Acceso denegado: " + (err.error?.detail || err.message))
    });
  }

  cerrarSesionCliente() {
    this.clienteAutenticado = null;
    localStorage.removeItem('cliente_gastrohotel');
  }

  onStaffLoginSubmit() {
    if (!this.staffPin) return;
    this.api.loginStaff(this.staffPin).subscribe({
      next: (user) => {
        this.staffLoggedIn.emit(user);
        this.showStaffLogin = false;
        this.staffPin = '';
      },
      error: (err) => alert("Error detallado: " + JSON.stringify(err.message || err))
    });
  }

  onGuestLoginSubmit() {
    if (!this.guestDoc || !this.guestPin) return;
    this.api.loginGuest(this.guestDoc, this.guestPin).subscribe({
      next: (res) => {
        this.guestData = res;
        this.showGuestLogin = false;
        this.showRoomService = true;
      },
      error: (err) => alert("Credenciales incorrectas: " + (err.error?.detail || err.message))
    });
  }

  pedirArticulo(articulo: any) {
    if (!confirm(`¿Cargar ${articulo.nombre} a tu habitación?`)) return;
    
    const payload = {
      id_folio: this.guestData.id_folio,
      num_mesa: this.guestData.habitacion,
      detalles: [{ id_articulo: articulo.id_articulo, cantidad: 1 }]
    };

    this.api.crearComanda(payload).subscribe({
      next: (res) => alert("Pedido enviado a cocina exitosamente."),
      error: (err) => alert("Error procesando pedido.")
    });
  }

  pedirLimpieza() {
    if (!this.guestData?.habitacion) return;
    this.api.solicitarLimpieza(this.guestData.habitacion.toString()).subscribe({
      next: (res) => alert("Hemos notificado a Recepción. Una recamarera se dirigirá a la Habitación " + this.guestData.habitacion + " pronto."),
      error: (err) => alert("Error al solicitar limpieza")
    });
  }
}
