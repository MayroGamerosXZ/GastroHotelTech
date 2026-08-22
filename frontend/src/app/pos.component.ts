/**
 * Componente de Punto de Venta (POS).
 * Maneja la lógica del restaurante, el carrito de compras (comanda), el cálculo de propinas y el envío a cocina.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="flex animate-fade-in mobile-pos-layout" style="height: 100%; width: 100%;">
    <!-- Main Menu Area -->
    <main class="main-content" style="padding: 1.5rem; display: flex; flex-direction: column;">
      <header class="flex justify-between items-center mobile-header-stack" style="margin-bottom: 2rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1.5rem;">
        <div>
          <h1 style="margin-bottom: 0.25rem; font-family: Georgia, serif; color: var(--accent-primary);">GastroHotel Restaurante</h1>
          <p style="margin-bottom: 0;">Terminal de Punto de Venta (POS)</p>
        </div>
        <div class="flex gap-4 mobile-pos-categories">
          <button style="background: transparent; border: none; font-size: 1rem; padding: 0.5rem 0; cursor: pointer; color: var(--text-primary); transition: all 0.2s;" [style.borderBottom]="categoriaSeleccionada === 'Todas' ? '2px solid var(--accent-primary)' : '2px solid transparent'" [style.color]="categoriaSeleccionada === 'Todas' ? 'var(--accent-primary)' : 'var(--text-secondary)'" (click)="filtrar('Todas')">Todas</button>
          <button style="background: transparent; border: none; font-size: 1rem; padding: 0.5rem 0; cursor: pointer; color: var(--text-primary); transition: all 0.2s;" [style.borderBottom]="categoriaSeleccionada === 'Desayunos' ? '2px solid var(--accent-primary)' : '2px solid transparent'" [style.color]="categoriaSeleccionada === 'Desayunos' ? 'var(--accent-primary)' : 'var(--text-secondary)'" (click)="filtrar('Desayunos')">Desayunos</button>
          <button style="background: transparent; border: none; font-size: 1rem; padding: 0.5rem 0; cursor: pointer; color: var(--text-primary); transition: all 0.2s;" [style.borderBottom]="categoriaSeleccionada === 'Entremés' ? '2px solid var(--accent-primary)' : '2px solid transparent'" [style.color]="categoriaSeleccionada === 'Entremés' ? 'var(--accent-primary)' : 'var(--text-secondary)'" (click)="filtrar('Entremés')">Entremés</button>
          <button style="background: transparent; border: none; font-size: 1rem; padding: 0.5rem 0; cursor: pointer; color: var(--text-primary); transition: all 0.2s;" [style.borderBottom]="categoriaSeleccionada === 'Platos Fuertes' ? '2px solid var(--accent-primary)' : '2px solid transparent'" [style.color]="categoriaSeleccionada === 'Platos Fuertes' ? 'var(--accent-primary)' : 'var(--text-secondary)'" (click)="filtrar('Platos Fuertes')">Fuertes</button>
          <button style="background: transparent; border: none; font-size: 1rem; padding: 0.5rem 0; cursor: pointer; color: var(--text-primary); transition: all 0.2s;" [style.borderBottom]="categoriaSeleccionada === 'Postres' ? '2px solid var(--accent-primary)' : '2px solid transparent'" [style.color]="categoriaSeleccionada === 'Postres' ? 'var(--accent-primary)' : 'var(--text-secondary)'" (click)="filtrar('Postres')">Postres</button>
          <button style="background: transparent; border: none; font-size: 1rem; padding: 0.5rem 0; cursor: pointer; color: var(--text-primary); transition: all 0.2s;" [style.borderBottom]="categoriaSeleccionada === 'Bebidas' ? '2px solid var(--accent-primary)' : '2px solid transparent'" [style.color]="categoriaSeleccionada === 'Bebidas' ? 'var(--accent-primary)' : 'var(--text-secondary)'" (click)="filtrar('Bebidas')">Bebidas</button>
        </div>
      </header>

      <!-- Products Grid -->
      <div class="mobile-pos-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1.5rem; overflow-y: auto; padding-bottom: 1rem;">
        
        <div *ngFor="let articulo of articulosFiltrados" class="glass-card flex-col" 
             style="padding: 0; cursor: pointer; overflow: hidden; border-radius: var(--radius-lg); transition: transform 0.2s, box-shadow 0.2s;"
             (click)="agregarAlCarrito(articulo)"
             onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.4)'"
             onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow=''">
          
          <!-- Imagen -->
          <div style="width: 100%; height: 130px; position: relative; overflow: hidden;">
            <img [src]="getImagenUrl(articulo.nombre, articulo.categoria)" 
                 [alt]="articulo.nombre"
                 style="width: 100%; height: 100%; object-fit: cover;"
                 loading="lazy"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; font-size: 2rem;"
                 [style.background]="getFallbackGradient(articulo.categoria)">
              {{ getCategoryEmoji(articulo.categoria) }}
            </div>
            <!-- Badge categoria -->
            <span style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); padding: 2px 8px; border-radius: 20px; font-size: 0.65rem; color: white; text-transform: uppercase; letter-spacing: 0.5px;">
              {{ articulo.categoria }}
            </span>
          </div>

          <!-- Info -->
          <div style="padding: 0.85rem;">
            <h3 style="font-size: 0.9rem; margin-bottom: 0.5rem; line-height: 1.3;">{{ articulo.nombre }}</h3>
            <div class="flex justify-between items-center">
              <span style="font-weight: 700; color: var(--accent-secondary); font-size: 1rem;">Q. {{ articulo.precio | number:'1.2-2' }}</span>
              <button class="btn btn-primary" style="padding: 0.3rem 0.75rem; font-size: 1rem; min-width: 32px;">+</button>
            </div>
          </div>
        </div>

      </div>
    </main>

    <!-- Ticket Sidebar (Comanda) -->
    <aside class="mobile-pos-sidebar" style="width: 350px; background: var(--bg-secondary); border-left: 1px solid var(--glass-border); padding: 1.5rem; display: flex; flex-direction: column;">
      <h2 style="font-size: 1.25rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--glass-border); padding-bottom: 1rem;">Comanda Actual</h2>
      
      <!-- Order Items -->
      <div style="flex: 1; overflow-y: auto;">
        <div *ngIf="carrito.length === 0" style="text-align: center; color: var(--text-muted); margin-top: 2rem;">
          <p>No hay artículos en la comanda.</p>
        </div>
        
        <div *ngFor="let item of carrito" class="flex justify-between items-center" style="margin-bottom: 1rem;">
          <div class="flex gap-2 items-center">
            <span style="background: rgba(255,255,255,0.1); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">{{ item.cantidad }}x</span>
            <span style="font-size: 0.875rem;">{{ item.articulo.nombre }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span style="font-weight: 500; font-size: 0.875rem;">Q. {{ (item.articulo.precio * item.cantidad) | number:'1.2-2' }}</span>
            <button (click)="removerDelCarrito(item)" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 1.2rem;">&times;</button>
          </div>
        </div>
      </div>

      <!-- Totals & Actions -->
      <div style="border-top: 1px solid var(--glass-border); padding-top: 1rem; margin-top: auto;">
        <div class="flex justify-between" style="margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.875rem;">
          <span>Subtotal</span>
          <span>Q. {{ subtotal | number:'1.2-2' }}</span>
        </div>
        <div class="flex justify-between" style="margin-bottom: 1rem; color: var(--text-muted); font-size: 0.875rem;">
          <span>Propina Sugerida (10%)</span>
          <span>Q. {{ propina | number:'1.2-2' }}</span>
        </div>
        <div class="flex justify-between items-center" style="margin-bottom: 1.5rem;">
          <span style="font-weight: 600; font-size: 1.125rem;">Total</span>
          <span style="font-weight: 700; font-size: 1.5rem; color: var(--accent-primary);">Q. {{ total | number:'1.2-2' }}</span>
        </div>

        <button (click)="enviarCocina()" [disabled]="carrito.length === 0" class="btn btn-primary" style="width: 100%; margin-bottom: 0.75rem; padding: 0.8rem;" [style.opacity]="carrito.length === 0 ? '0.5' : '1'">
          Enviar a Cocina (Cliente Paso)
        </button>
        <button (click)="cargarHabitacion()" [disabled]="carrito.length === 0" class="btn btn-secondary" style="width: 100%; padding: 0.8rem; background: var(--success); color: white; border: none;" [style.opacity]="carrito.length === 0 ? '0.5' : '1'">
          Cargar a Habitación (Room Charge)
        </button>
      </div>
    </aside>
  </div>
  `
})
export class PosComponent implements OnInit {
  articulos: any[] = [];
  articulosFiltrados: any[] = [];
  categoriaSeleccionada: string = 'Todas';
  
  carrito: {articulo: any, cantidad: number}[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.obtenerArticulos().subscribe({
      next: (data) => {
        this.articulos = data;
        this.articulosFiltrados = data;
      },
      error: (err) => console.error("Error cargando artículos", err)
    });
  }

  filtrar(categoria: string) {
    this.categoriaSeleccionada = categoria;
    if (categoria === 'Todas') {
      this.articulosFiltrados = this.articulos;
    } else {
      this.articulosFiltrados = this.articulos.filter(a => a.categoria === categoria);
    }
  }

  agregarAlCarrito(articulo: any) {
    const item = this.carrito.find(i => i.articulo.id_articulo === articulo.id_articulo);
    if (item) {
      item.cantidad++;
    } else {
      this.carrito.push({ articulo, cantidad: 1 });
    }
  }
  
  removerDelCarrito(item: any) {
    const index = this.carrito.indexOf(item);
    if (index > -1) {
      this.carrito.splice(index, 1);
    }
  }

  get subtotal() {
    return this.carrito.reduce((acc, item) => acc + (item.articulo.precio * item.cantidad), 0);
  }

  get propina() {
    return this.subtotal * 0.10;
  }

  get total() {
    return this.subtotal + this.propina;
  }

  getImagenUrl(nombre: string, categoria: string): string {
    if (!nombre) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'; // Fallback absoluto
    // Diccionario de imágenes específicas por plato (Unsplash Source API)
    const imagenes: {[key: string]: string} = {
      // Desayunos
      '4 Pecados': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80',
      'Delicado Omelett Francés': 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=400&q=80',
      'Huevos en el Purgatorio': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80',
      'Mazateco': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&q=80',
      'Chicharronero': 'https://images.unsplash.com/photo-1606851091851-e8c8c0fca5ba?w=400&q=80',
      'Tostadas a la Francesa': 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&q=80',
      'Omelet de Claras': 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80',
      'Granjero': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80',
      // Entremés
      'Tacos de Pescado o Camarón': 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80',
      'Carpacho de Res': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=80',
      'Mejillones al Ajo': 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&q=80',
      'Ensalada del Chef': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
      // Platos Fuertes
      'Trucha Caribeña': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&q=80',
      'Salmón a la Naranja': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&q=80',
      'Lomito al Zacapa': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&q=80',
      'Mar y Tierra, Solo Carnes': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80',
      'Camarones Don Carlos La Especialidad': 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&q=80',
      'Pechugas de Pollo al Parmesano': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c3?w=400&q=80',
      'Espagueti Primavera de Pollo': 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=400&q=80',
      // Postres
      'Pie de Queso Maracuyá': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
      'Pie Queso Pistacho': 'https://images.unsplash.com/photo-1620926879000-c07c5c3edac2?w=400&q=80',
      'Flan de la Abuela': 'https://images.unsplash.com/photo-1528975604071-b4dc52a2d18c?w=400&q=80',
      'Bananos Horneados': 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400&q=80',
      'Helado': 'https://images.unsplash.com/photo-1570197781417-0a523b123890?w=400&q=80',
      'Crème Brûlée': 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&q=80',
      'Gelato 1 Bola': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80',
      // Bebidas
      'Mojito Orange': 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80',
      'Margarita Salvaje (Fresa)': 'https://images.unsplash.com/photo-1582106245687-cbb466a9f07f?w=400&q=80',
      'Bebida Natural': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&q=80',
      'Gaseosas': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80',
      'Botella de Agua': 'https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400&q=80',
      'Té Frío': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
      'Cerveza': 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400&q=80',
      'Vino Tinto': 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400&q=80',
      'Café por Libra': 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80',
      'Café Negro': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80',
      'Café Capuchino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&q=80',
      'Naranjada 100% Natural': 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
      // Infantil
      'Hamburguesa Infantil': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
      'Espagueti de Pollo': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80',
      'Hamburguesa de la Casa': 'https://images.unsplash.com/photo-1550317138-10000687a72b?w=400&q=80',
      'Baguet Artesanal de Masa Madre': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80',
    };
    return imagenes[nombre] || this.getCategoryDefaultImage(categoria);
  }

  getCategoryDefaultImage(categoria: string): string {
    const defaults: {[key: string]: string} = {
      'Desayunos': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&q=80',
      'Entremés': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
      'Platos Fuertes': 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80',
      'Postres': 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400&q=80',
      'Bebidas': 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=400&q=80',
      'Infantil': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80',
    };
    return defaults[categoria] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80';
  }

  getFallbackGradient(categoria: string): string {
    const gradients: {[key: string]: string} = {
      'Desayunos': 'linear-gradient(45deg, #f59e0b, #d97706)',
      'Entremés': 'linear-gradient(45deg, #10b981, #047857)',
      'Platos Fuertes': 'linear-gradient(45deg, #ef4444, #b91c1c)',
      'Postres': 'linear-gradient(45deg, #ec4899, #be185d)',
      'Bebidas': 'linear-gradient(45deg, #3b82f6, #1d4ed8)',
      'Infantil': 'linear-gradient(45deg, #8b5cf6, #6d28d9)',
    };
    return gradients[categoria] || 'linear-gradient(45deg, #1f2937, #374151)';
  }

  getCategoryEmoji(categoria: string): string {
    const emojis: {[key: string]: string} = {
      'Desayunos': '🍳', 'Entremés': '🥗', 'Platos Fuertes': '🥩',
      'Postres': '🍰', 'Bebidas': '🥂', 'Infantil': '👶'
    };
    return emojis[categoria] || '🍴';
  }

  // Método legacy mantenido por compatibilidad
  getImagen(categoria: string): string {
    return this.getCategoryDefaultImage(categoria);
  }

  generarPayload(idFolio: number | null) {
    return {
      id_folio: idFolio,
      num_mesa: 12, // Terminal fija por ahora
      detalles: this.carrito.map(item => ({
        id_articulo: item.articulo.id_articulo,
        cantidad: item.cantidad
      }))
    };
  }

  enviarCocina() {
    // Cliente de paso, no se carga a habitación (id_folio = null)
    const payload = this.generarPayload(null);
    this.api.crearComanda(payload).subscribe({
      next: (res) => {
        alert("Comanda #" + res.id_comanda + " enviada a cocina.");
        this.carrito = [];
      },
      error: (err) => alert("Error al crear comanda: " + (err.error?.detail || err.message))
    });
  }

  cargarHabitacion() {
    // En producción se pediría el número de habitación y se buscaría el folio.
    // Para MVP usaremos el id_folio = 1 (creado por la reserva de prueba)
    const folioStr = prompt("Ingrese el ID del Folio de la Habitación:", "1");
    if (!folioStr) return;
    
    const idFolio = parseInt(folioStr, 10);
    const payload = this.generarPayload(idFolio);
    
    this.api.crearComanda(payload).subscribe({
      next: (res) => {
        alert("¡Éxito! Comanda #" + res.id_comanda + " cargada al Folio " + idFolio);
        this.carrito = [];
      },
      error: (err) => {
        let msg = typeof err.error?.detail === 'string' ? err.error.detail : err.message;
        alert("Atención (Room Charge Fallido): " + msg);
      }
    });
  }
}
