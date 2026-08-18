import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PosComponent } from './pos.component';
import { GuestPortalComponent } from './guest-portal.component';
import { ApiService } from './api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, PosComponent, GuestPortalComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'GastroHotel Tech';
  currentView = 'guest-portal';
  currentUser: any = null;
  private ws: WebSocket | null = null;
  reservas: any[] = [];
  showSettingsModal = false;
  tempApiUrl = '';

  constructor(private api: ApiService) {
    this.tempApiUrl = this.api.getBaseUrl();
  }

  changeView(view: string) {
    this.currentView = view;
    if (view === 'reservas') {
      this.api.obtenerReservas().subscribe(data => this.reservas = data);
    } else if (view === 'reception') {
      this.loadRack();
    } else if (view === 'huespedes') {
      this.api.listarHuespedes().subscribe(data => this.huespedes = data);
    } else if (view === 'staff') {
      this.api.listarStaff().subscribe(data => this.staffList = data);
    } else if (view === 'reportes') {
      this.api.obtenerReporte().subscribe(data => this.reporte = data);
    } else if (view === 'inventario') {
      this.loadInventario();
    }
  }

  ngOnInit() {
    this.connectWebSocket();
    this.loadRack();
  }

  guardarConfigRed() {
    if (this.tempApiUrl) {
      // Remover slash final si el usuario lo agregó
      let cleanUrl = this.tempApiUrl.replace(/\/$/, "");
      this.api.setBaseUrl(cleanUrl);
      this.showSettingsModal = false;
      alert("Red configurada a: " + cleanUrl + "\nRecargando conexión...");
      // Forzar recarga para reiniciar WebSockets y peticiones
      window.location.reload();
    }
  }

  ngOnDestroy() {
    if (this.ws) {
      this.ws.close();
    }
  }

  connectWebSocket() {
    const apiDomain = this.api.getBaseUrl().replace(/^http/, 'ws');
    this.ws = new WebSocket(`${apiDomain}/ws/reception`);
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === 'nueva_reserva') {
        this.playDing();
        // Insertar al inicio de la lista
        this.recentCheckins.unshift({
          id: 'RES-' + data.reserva.id_reserva,
          name: 'Reserva Web',
          room: 'Auto',
          status: data.reserva.estado,
          time: new Date().toLocaleTimeString()
        });
        // Actualizar contadores simulados
        this.roomsStatus.available--;
        this.roomsStatus.occupied++;
      } else if (data.event === 'limpieza_solicitada') {
        this.playDing();
        this.recentCheckins.unshift({
          id: 'ROOM-' + data.habitacion,
          name: 'Solicita Limpieza',
          room: data.habitacion,
          status: 'Atención',
          time: new Date().toLocaleTimeString()
        });
        this.roomsStatus.cleaning++;
      }
    };
    this.ws.onclose = () => {
      // Reconnect after 3 seconds
      setTimeout(() => this.connectWebSocket(), 3000);
    };
  }

  playDing() {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 (Campanita)
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1);
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 1);
    } catch (e) {
      console.log('Web Audio API not supported', e);
    }
  }

  onStaffLoggedIn(user: any) {
    this.currentUser = user;
    if (user.rol === 'Mesero') {
      this.changeView('pos');
    } else {
      this.changeView('reception');
    }
  }

  
  // Data for Reception Dashboard
  recentCheckins: any[] = [];
  rackHabitaciones: any[] = [];
  selectedRoom: any = null;
  selectedRoomDetail: any = null;
  
  showNuevaReservaModal = false;
  showBuscarFolioModal = false;
  busquedaFolioId = '';
  busquedaResultado: any = null;

  roomsStatus = { occupied: 0, available: 0, cleaning: 0, total: 0 };

  loadRack() {
    this.api.obtenerRack().subscribe(data => {
      this.rackHabitaciones = data;
      this.updateRoomsStatus();
    });
  }

  updateRoomsStatus() {
    this.roomsStatus.total = this.rackHabitaciones.length;
    this.roomsStatus.occupied = this.rackHabitaciones.filter(h => h.estado_ocupacion === 'Ocupada' || h.estado_ocupacion === 'Reservada').length;
    this.roomsStatus.available = this.rackHabitaciones.filter(h => h.estado_ocupacion === 'Libre').length;
    this.roomsStatus.cleaning = this.rackHabitaciones.filter(h => h.estado_limpieza !== 'Limpia').length;
  }

  openRoomModal(hab: any) {
    this.selectedRoom = hab;
    if (hab.estado_ocupacion === 'Ocupada' || hab.estado_ocupacion === 'Reservada') {
      this.api.obtenerDetalleHabitacion(hab.id_habitacion).subscribe({
        next: (res) => {
          if (!res.error) this.selectedRoomDetail = res;
          else this.selectedRoomDetail = null;
        },
        error: () => this.selectedRoomDetail = null
      });
    } else {
      this.selectedRoomDetail = null;
    }
  }

  closeModals() {
    this.selectedRoom = null;
    this.selectedRoomDetail = null;
    this.showNuevaReservaModal = false;
    this.showBuscarFolioModal = false;
    this.busquedaResultado = null;
    this.busquedaFolioId = '';
  }

  buscarFolio() {
    if (!this.busquedaFolioId) return;
    this.api.obtenerReservas().subscribe(data => {
      const res = data.find((r: any) => r.id_reserva.toString() === this.busquedaFolioId);
      if (res) this.busquedaResultado = res;
      else alert("Reserva/Folio no encontrado.");
    });
  }

  // ── Check-in / Check-out ─────────────────
  hacerCheckin() {
    if (!this.selectedRoomDetail) return;
    const idReserva = this.selectedRoomDetail.reserva.id_reserva;
    this.api.cambiarEstadoReserva(idReserva, 'Check-in').subscribe({
      next: () => { alert('✅ Check-in realizado con éxito.'); this.closeModals(); this.loadRack(); },
      error: (e) => alert('Error: ' + (e.error?.detail || e.message))
    });
  }

  hacerCheckout() {
    if (!this.selectedRoomDetail) return;
    const idReserva = this.selectedRoomDetail.reserva.id_reserva;
    this.api.cambiarEstadoReserva(idReserva, 'Check-out').subscribe({
      next: () => { alert('✅ Check-out realizado. Habitación marcada como Sucia.'); this.closeModals(); this.loadRack(); },
      error: (e) => alert('⚠️ ' + (e.error?.detail || e.message))
    });
  }

  // ── Limpieza ────────────────────────────
  marcarLimpia() {
    if (!this.selectedRoom) return;
    this.api.marcarLimpieza(this.selectedRoom.id_habitacion).subscribe({
      next: () => { alert('✅ Habitación marcada como Limpia.'); this.closeModals(); this.loadRack(); },
      error: (e) => alert('Error: ' + (e.error?.detail || e.message))
    });
  }

  // ── CRM Huéspedes ────────────────────────
  huespedes: any[] = [];
  selectedHuesped: any = null;

  // ── Staff CRUD ───────────────────────────
  staffList: any[] = [];
  showStaffModal = false;
  editandoStaff: any = null;
  nuevoStaff = { nombre: '', rol: 'Mesero', pin: '' };

  abrirModalStaff(emp: any = null) {
    this.editandoStaff = emp;
    this.nuevoStaff = emp ? { nombre: emp.nombre, rol: emp.rol, pin: emp.pin } : { nombre: '', rol: 'Mesero', pin: '' };
    this.showStaffModal = true;
  }

  guardarStaff() {
    if (!this.nuevoStaff.nombre || !this.nuevoStaff.pin) { alert('Complete todos los campos.'); return; }
    const obs = this.editandoStaff
      ? this.api.editarStaff(this.editandoStaff.id, this.nuevoStaff)
      : this.api.crearStaff(this.nuevoStaff);
    obs.subscribe({
      next: () => { this.showStaffModal = false; this.api.listarStaff().subscribe(d => this.staffList = d); },
      error: (e) => alert('Error: ' + (e.error?.detail || e.message))
    });
  }

  eliminarStaff(id: number) {
    if (!confirm('¿Confirmar eliminación del empleado?')) return;
    this.api.eliminarStaff(id).subscribe({
      next: () => this.api.listarStaff().subscribe(d => this.staffList = d),
      error: (e) => alert('Error: ' + (e.error?.detail || e.message))
    });
  }

  // ── Reportes ─────────────────────────────
  reporte: any = null;
  cierreRegistrado = false;

  cerrarTurno() {
    if (confirm('¿Confirmar cierre de turno? Esto registrará el corte de caja.')) {
      this.cierreRegistrado = true;
      alert(`✅ Turno cerrado a las ${new Date().toLocaleTimeString()}. Total General: Q.${this.reporte?.total_general?.toFixed(2) || '0.00'}`);
    }
  }

  // ── Módulo de Pago y Facturación ───────────────────────────
  showPagoModal = false;
  metodoPago = 'Efectivo';
  montoPago = 0;
  numeroTarjeta = '';
  cvvTarjeta = '';
  fechaVencimientoTarjeta = '';
  docTransferencia = '';
  nitCliente = 'CF';
  nombreCliente = 'Consumidor Final';
  direccionCliente = 'Ciudad';
  showFacturaModal = false;
  facturaReciente: any = null;

  // ── POS Walk-in ───────────────────────────────────────────
  comandasActivas: any[] = [];
  selectedComanda: any = null;
  showPagoComandaModal = false;

  cargarComandasActivas() {
    this.api.listarComandasActivas().subscribe(data => this.comandasActivas = data);
  }

  abrirPagoComanda(comanda: any) {
    this.selectedComanda = comanda;
    this.metodoPago = 'Efectivo';
    this.numeroTarjeta = '';
    this.docTransferencia = '';
    this.nitCliente = 'CF';
    this.nombreCliente = 'Consumidor Final';
    this.direccionCliente = 'Ciudad';
    this.showPagoComandaModal = true;
  }

  confirmarPagoComanda() {
    if (!this.selectedComanda) return;
    const payload = {
      metodo_pago: this.metodoPago,
      numero_tarjeta: this.numeroTarjeta,
      doc_transferencia: this.docTransferencia,
      nit_cliente: this.nitCliente,
      nombre_cliente: this.nombreCliente,
      direccion: this.direccionCliente
    };
    this.api.cobrarComanda(this.selectedComanda.id_comanda, payload).subscribe({
      next: (res) => {
        this.showPagoComandaModal = false;
        this.facturaReciente = res.factura;
        this.showFacturaModal = true;
        this.cargarComandasActivas();
      },
      error: (e) => alert('Error al cobrar comanda: ' + (e.error?.detail || e.message))
    });
  }

  abrirModalPago() {
    if (!this.selectedRoomDetail) return;
    this.montoPago = this.selectedRoomDetail.folio.total_cuenta || 0;
    this.metodoPago = 'Efectivo';
    this.numeroTarjeta = '';
    this.cvvTarjeta = '';
    this.fechaVencimientoTarjeta = '';
    this.docTransferencia = '';
    this.nitCliente = 'CF';
    this.nombreCliente = 'Consumidor Final';
    this.direccionCliente = 'Ciudad';
    this.showPagoModal = true;
  }

  confirmarPago() {
    if (!this.selectedRoomDetail) return;
    const idReserva = this.selectedRoomDetail.reserva.id_reserva;
    const payload = {
        monto: this.montoPago,
        metodo_pago: this.metodoPago,
        numero_tarjeta: this.numeroTarjeta,
        doc_transferencia: this.docTransferencia,
        nit_cliente: this.nitCliente,
        nombre_cliente: this.nombreCliente,
        direccion: this.direccionCliente
    };
    
    this.api.registrarPago(idReserva, payload).subscribe({
      next: (res) => {
        this.showPagoModal = false;
        this.facturaReciente = res.factura;
        this.showFacturaModal = true;
        this.api.obtenerDetalleHabitacion(this.selectedRoom.id_habitacion).subscribe(d => {
          if (!d.error) this.selectedRoomDetail = d;
        });
      },
      error: (e) => alert('Error al registrar pago: ' + (e.error?.detail || e.message))
    });
  }

  // ── Gestión de Configuración & Precios (Gerente) ───────────
  tempAltaInicio = '12-20';
  tempAltaFin = '01-05';
  editingHabitacion: any = null;
  showEditHabitacionModal = false;

  abrirEditarHabitacion(hab: any) {
    this.editingHabitacion = { ...hab };
    this.showEditHabitacionModal = true;
  }

  guardarHabitacionConfig() {
    if (!this.editingHabitacion) return;
    const payload = {
      precio_base: this.editingHabitacion.precio_base,
      precio_temporada_alta: this.editingHabitacion.precio_temporada_alta,
      vista: this.editingHabitacion.vista,
      capacidad: this.editingHabitacion.capacidad,
      descripcion: this.editingHabitacion.descripcion,
      incluye_desayuno: this.editingHabitacion.incluye_desayuno,
      tipo: this.editingHabitacion.tipo
    };

    this.api.actualizarHabitacion(this.editingHabitacion.id_habitacion, payload).subscribe({
      next: (res) => {
        alert(`✅ Habitación ${this.editingHabitacion.id_habitacion} actualizada exitosamente.`);
        this.showEditHabitacionModal = false;
        this.loadRack();
      },
      error: (err) => alert("Error guardando habitación: " + (err.error?.detail || err.message))
    });
  }

  guardarConfiguracionTemporada() {
    const payload = {
      temporada_alta_inicio: this.tempAltaInicio,
      temporada_alta_fin: this.tempAltaFin
    };
    this.api.actualizarConfiguracion(payload).subscribe({
      next: (res) => alert("✅ Fechas de Temporada Alta actualizadas correctamente."),
      error: (err) => alert("Error guardando configuración.")
    });
  }

  imprimirFactura() {
    if (!this.facturaReciente) return;
    const f = this.facturaReciente;
    const items = f.items || [];
    
    const tipoLabel: {[k: string]: string} = {
      'Hospedaje': '🏨 Hospedaje',
      'Restaurante': '🍽️ Restaurante / Comanda',
      'Mixta': '🏨🍽️ Hotel + Restaurante'
    };

    const itemsHTML = items.map((item: any) => `
      <tr>
        <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 0.85rem;">${item.codigo}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #eee; font-size: 0.9rem;">${item.descripcion}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #eee; text-align: center; font-size: 0.9rem;">${item.cantidad}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #eee; text-align: right; font-size: 0.9rem;">Q.${(item.precio_unitario || 0).toFixed(2)}</td>
        <td style="padding: 8px 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600; font-size: 0.9rem;">Q.${(item.subtotal || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const logoSvg = `
      <svg width="60" height="70" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 8px;">
        <rect x="5" y="5" width="90" height="110" rx="10" fill="transparent" stroke="#d4af37" stroke-width="4"/>
        <path d="M50 20 L80 45 L20 45 Z" fill="#d4af37"/>
        <text x="50" y="80" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#d4af37" text-anchor="middle">GH</text>
        <circle cx="50" cy="104" r="3" fill="#d4af37"/>
      </svg>
    `;

    const htmlContent = `
      <html>
        <head>
          <title>Factura No. ${f.id_factura} - GastroHotel Tech</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 2.5rem; color: #111; max-width: 780px; margin: auto; }
            .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 1.5rem; margin-bottom: 1.5rem; }
            .header h1 { font-size: 2.2rem; margin: 4px 0 0 0; letter-spacing: 2px; color: #1e3a5f; font-family: Georgia, serif; }
            .header p.subtitle { font-size: 0.75rem; letter-spacing: 4px; color: #f59e0b; font-weight: bold; margin: 0 0 10px 0; }
            .header .tipo-badge { display: inline-block; background: #1e3a5f; color: white; padding: 4px 14px; border-radius: 20px; font-size: 0.85rem; margin-top: 4px; font-weight: 600; }
            .factura-num { font-size: 1.1rem; color: #444; margin-top: 8px; }
            .cliente-box { background: #f8fafc; padding: 1.25rem 1.5rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 5px solid #1e3a5f; border: 1px solid #e2e8f0; border-left-width: 5px; }
            .cliente-box p { margin: 5px 0; font-size: 0.95rem; color: #334155; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
            thead th { background: #1e3a5f; color: white; padding: 10px; text-align: left; font-size: 0.85rem; letter-spacing: 0.5px; }
            thead th:nth-child(3), thead th:nth-child(4), thead th:nth-child(5) { text-align: right; }
            .total-row { font-size: 1.5rem; font-weight: bold; text-align: right; padding: 1rem 0; border-top: 2px solid #1e3a5f; color: #0f172a; margin-top: 0.5rem; }
            .footer { text-align: center; margin-top: 2.5rem; color: #64748b; font-size: 0.8rem; border-top: 1px solid #e2e8f0; padding-top: 1.25rem; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoSvg}
            <h1>GASTROHOTEL TECH</h1>
            <p class="subtitle">RESORT & SPA — ANTIGUA GUATEMALA</p>
            <div class="tipo-badge">${tipoLabel[f.tipo] || f.tipo || 'Factura'}</div>
            <p class="factura-num">Factura No. <strong>${f.id_factura}</strong> &nbsp;|&nbsp; Fecha: ${f.fecha}</p>
            ${f.habitacion ? `<p style="margin-top:4px; color:#555; font-size:0.95rem;">Habitación: <strong>${f.habitacion}</strong></p>` : ''}
            ${f.mesa ? `<p style="margin-top:4px; color:#555; font-size:0.95rem;">Mesa: <strong>${f.mesa}</strong></p>` : ''}
          </div>
          
          <div class="cliente-box">
            <p><strong>NIT:</strong> ${f.nit}</p>
            <p><strong>Nombre / Razon Social:</strong> ${f.nombre}</p>
            <p><strong>Dirección Fiscal:</strong> ${f.direccion || 'Ciudad'}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Descripción de Consumo / Servicio</th>
                <th style="text-align:center;">Cant.</th>
                <th style="text-align:right;">P. Unit.</th>
                <th style="text-align:right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML || '<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:#94a3b8;">Sin desglose disponible</td></tr>'}
            </tbody>
          </table>

          <div class="total-row">TOTAL PAGADO: Q. ${(f.total || 0).toFixed(2)}</div>
          
          <div class="footer">
            <p><strong>GastroHotel Tech — Sistema de Gestión Hotelera & Gastronómica</strong></p>
            <p>Documento tributario generado electrónicamente. Gracias por su preferencia.</p>
          </div>
        </body>
      </html>
    `;

    const WinPrint = window.open('', '', 'left=0,top=0,width=850,height=1000,toolbar=0,scrollbars=0,status=0');
    if (!WinPrint) return;
    WinPrint.document.write(htmlContent);
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 350);
  }

  // ── EXPORTACIÓN CIERRE DE CAJA ───────────
  
  exportarTXT() {
    if (!this.reporte) return;
    
    let txt = `=======================================\n`;
    txt += `     REPORTE DE CIERRE DE CAJA\n`;
    txt += `     GastroHotel Tech Resort\n`;
    txt += `=======================================\n`;
    txt += `Fecha: ${this.reporte.fecha}\n\n`;
    
    txt += `--- RESUMEN FINANCIERO ---\n`;
    txt += `Ingresos Restaurante : Q. ${(this.reporte.total_restaurante || 0).toFixed(2)}\n`;
    txt += `Ingresos Hospedaje   : Q. ${(this.reporte.total_hospedaje || 0).toFixed(2)}\n`;
    txt += `---------------------------------------\n`;
    txt += `TOTAL CALCULADO      : Q. ${((this.reporte.total_restaurante || 0) + (this.reporte.total_hospedaje || 0)).toFixed(2)}\n\n`;
    
    txt += `--- CAJA REAL ---\n`;
    txt += `Total Pagos Recibidos: Q. ${(this.reporte.caja_real || 0).toFixed(2)}\n\n`;
    
    txt += `--- KPIs OCUPACIÓN ---\n`;
    txt += `Habitaciones Totales : ${this.reporte.habitaciones_total}\n`;
    txt += `Hab. Ocupadas        : ${this.reporte.habitaciones_ocupadas}\n`;
    txt += `Hab. Libres          : ${this.reporte.habitaciones_libres}\n\n`;
    
    txt += `--- DETALLE COMANDAS ---\n`;
    if (this.reporte.detalle_comandas && this.reporte.detalle_comandas.length > 0) {
      this.reporte.detalle_comandas.forEach((c: any) => {
        txt += `Comanda #${c.id_comanda} | Mesa: ${c.num_mesa} | Estado: ${c.estado} | Total: Q.${(c.total || 0).toFixed(2)}\n`;
      });
    } else {
      txt += `Sin comandas registradas en la fecha.\n`;
    }
    
    txt += `\n=======================================\n`;
    txt += `Reporte Generado Automáticamente\n`;
    
    const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CierreCaja_${this.reporte.fecha}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportarPDF() {
    if (!this.reporte) return;
    
    const logoSvg = `
      <svg width="60" height="70" viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 8px;">
        <rect x="5" y="5" width="90" height="110" rx="10" fill="transparent" stroke="#d4af37" stroke-width="4"/>
        <path d="M50 20 L80 45 L20 45 Z" fill="#d4af37"/>
        <text x="50" y="80" font-family="Georgia, serif" font-size="28" font-weight="bold" fill="#d4af37" text-anchor="middle">GH</text>
        <circle cx="50" cy="104" r="3" fill="#d4af37"/>
      </svg>
    `;

    const trComandas = (this.reporte.detalle_comandas || []).map((c: any) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eee;">CMD-${c.id_comanda}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${c.num_mesa}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${c.estado}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right; font-weight: 600;">Q. ${(c.total || 0).toFixed(2)}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <html>
        <head>
          <title>Cierre de Caja - ${this.reporte.fecha}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 2.5rem; color: #111; max-width: 800px; margin: auto; }
            .header { text-align: center; border-bottom: 3px double #1e3a5f; padding-bottom: 1.5rem; margin-bottom: 2rem; }
            .header h1 { font-size: 2.2rem; margin: 4px 0 0 0; letter-spacing: 2px; color: #1e3a5f; font-family: Georgia, serif; }
            .header p.subtitle { font-size: 0.75rem; letter-spacing: 4px; color: #f59e0b; font-weight: bold; margin: 0 0 10px 0; }
            .grid { display: flex; gap: 2rem; margin-bottom: 2rem; }
            .card { background: #f8fafc; padding: 1.5rem; border-radius: 8px; flex: 1; border: 1px solid #e2e8f0; border-top: 4px solid #1e3a5f; }
            .card h3 { margin-top: 0; color: #1e3a5f; font-size: 1rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem; margin-bottom: 1rem; }
            .row { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.95rem; }
            .total-row { display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem; padding-top: 1rem; border-top: 2px dashed #cbd5e1; margin-top: 1rem; color: #0f172a; }
            .caja-real { background: #ecfdf5; border-top-color: #10b981; }
            .caja-real h3 { color: #047857; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
            thead th { background: #1e3a5f; color: white; padding: 10px; text-align: left; font-size: 0.85rem; }
            .footer { text-align: center; color: #64748b; font-size: 0.8rem; border-top: 1px solid #e2e8f0; padding-top: 1.25rem; margin-top: 3rem; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoSvg}
            <h1>GASTROHOTEL TECH</h1>
            <p class="subtitle">REPORTE DE CIERRE DE CAJA</p>
            <p style="font-size: 1.1rem; color: #444; margin-top: 8px;">Fecha de Auditoría: <strong>${this.reporte.fecha}</strong></p>
          </div>
          
          <div class="grid">
            <div class="card">
              <h3>Resumen Financiero Calculado</h3>
              <div class="row"><span>Restaurante (Comandas):</span> <span>Q. ${(this.reporte.total_restaurante || 0).toFixed(2)}</span></div>
              <div class="row"><span>Hospedaje (Reservas):</span> <span>Q. ${(this.reporte.total_hospedaje || 0).toFixed(2)}</span></div>
              <div class="total-row"><span>Total Teórico:</span> <span>Q. ${((this.reporte.total_restaurante || 0) + (this.reporte.total_hospedaje || 0)).toFixed(2)}</span></div>
            </div>
            
            <div class="card caja-real">
              <h3>Ingreso a Caja (Pagos Reales)</h3>
              <p style="font-size: 0.85rem; color: #64748b; margin-top: -0.5rem; margin-bottom: 1rem;">Pagos registrados exitosamente</p>
              <div class="total-row" style="border-top: none; padding-top: 0; font-size: 1.8rem; color: #047857;">
                <span>Total Recibido:</span> <span>Q. ${(this.reporte.caja_real || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="card" style="margin-bottom: 2rem;">
            <h3>KPIs Ocupación Diaria</h3>
            <div class="row"><span>Total Habitaciones:</span> <strong>${this.reporte.habitaciones_total}</strong></div>
            <div class="row"><span>Ocupadas / Reservadas:</span> <strong>${this.reporte.habitaciones_ocupadas}</strong></div>
            <div class="row"><span>Disponibles:</span> <strong>${this.reporte.habitaciones_libres}</strong></div>
          </div>

          <h3 style="color: #1e3a5f; margin-bottom: 1rem;">Desglose de Comandas</h3>
          <table>
            <thead>
              <tr>
                <th>ID Comanda</th>
                <th style="text-align: center;">Mesa</th>
                <th style="text-align: center;">Estado</th>
                <th style="text-align: right;">Total Cobrado</th>
              </tr>
            </thead>
            <tbody>
              ${trComandas || '<tr><td colspan="4" style="text-align:center; padding:1.5rem; color:#94a3b8;">Sin comandas procesadas hoy</td></tr>'}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>GastroHotel Tech — Sistema de Gestión</strong></p>
            <p>Documento de Auditoría Interna.</p>
          </div>
        </body>
      </html>
    `;

    const WinPrint = window.open('', '', 'left=0,top=0,width=850,height=1000,toolbar=0,scrollbars=0,status=0');
    if (!WinPrint) return;
    WinPrint.document.write(htmlContent);
    WinPrint.document.close();
    WinPrint.focus();
    setTimeout(() => {
      WinPrint.print();
      WinPrint.close();
    }, 350);
  }

  // ── MÓDULO DE INVENTARIO Y RECETAS ───────────
  insumos: any[] = [];
  articulosMenu: any[] = [];
  
  nuevoInsumo = { nombre: '', unidad_medida: 'Unidad', stock_actual: 0, punto_reorden: 5, costo_unitario: 0 };
  
  selectedArticuloReceta: any = null;
  nuevaRecetaInsumoId = '';
  nuevaRecetaCantidad = 0;

  loadInventario() {
    this.api.obtenerInsumos().subscribe(data => this.insumos = data);
    this.api.obtenerArticulos().subscribe(data => this.articulosMenu = data);
  }

  guardarInsumo() {
    this.api.crearInsumo(this.nuevoInsumo).subscribe(() => {
      this.loadInventario();
      this.nuevoInsumo = { nombre: '', unidad_medida: 'Unidad', stock_actual: 0, punto_reorden: 5, costo_unitario: 0 };
    });
  }
  
  seleccionarArticuloParaReceta(art: any) {
    this.selectedArticuloReceta = art;
  }
  
  agregarReceta() {
    if (!this.selectedArticuloReceta || !this.nuevaRecetaInsumoId || this.nuevaRecetaCantidad <= 0) return;
    const payload = {
      id_insumo: parseInt(this.nuevaRecetaInsumoId),
      cantidad: this.nuevaRecetaCantidad
    };
    this.api.agregarReceta(this.selectedArticuloReceta.id_articulo, payload).subscribe(() => {
      this.api.obtenerArticulos().subscribe(data => {
        this.articulosMenu = data;
        this.selectedArticuloReceta = this.articulosMenu.find(a => a.id_articulo === this.selectedArticuloReceta.id_articulo);
      });
      this.nuevaRecetaInsumoId = '';
      this.nuevaRecetaCantidad = 0;
    });
  }
  
  eliminarReceta(idReceta: number) {
    this.api.eliminarReceta(idReceta).subscribe(() => {
      this.api.obtenerArticulos().subscribe(data => {
        this.articulosMenu = data;
        this.selectedArticuloReceta = this.articulosMenu.find(a => a.id_articulo === this.selectedArticuloReceta.id_articulo);
      });
    });
  }
}
