"""
Archivo Principal (Entrypoint) de la API FastAPI.
Contiene todos los endpoints (rutas) para el manejo de usuarios, comandas, habitaciones e inventario.
"""
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session
import models, schemas
from database import engine, get_db, SessionLocal
from fastapi.middleware.cors import CORSMiddleware
import random
import string
import json
import asyncio
import hashlib
import email_service

def hash_pass(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def es_temporada_alta(fecha_checkin, db: Session) -> bool:
    try:
        from datetime import date
        d = fecha_checkin if isinstance(fecha_checkin, date) else date.fromisoformat(str(fecha_checkin))
        inicio_cfg = db.query(models.Configuracion).filter(models.Configuracion.clave == "temporada_alta_inicio").first()
        fin_cfg = db.query(models.Configuracion).filter(models.Configuracion.clave == "temporada_alta_fin").first()
        
        ini_str = inicio_cfg.valor if inicio_cfg else "12-20"
        fin_str = fin_cfg.valor if fin_cfg else "01-05"
        
        ini_m, ini_d = map(int, ini_str.split("-"))
        fin_m, fin_d = map(int, fin_str.split("-"))
        
        m, day = d.month, d.day
        if ini_m <= fin_m:
            return (m > ini_m or (m == ini_m and day >= ini_d)) and (m < fin_m or (m == fin_m and day <= fin_d))
        else:
            return (m > ini_m or (m == ini_m and day >= ini_d)) or (m < fin_m or (m == fin_m and day <= fin_d))
    except Exception:
        return False

def obtener_precio_habitacion(hab: models.Habitacion, fecha_checkin, db: Session) -> float:
    if es_temporada_alta(fecha_checkin, db) and (getattr(hab, 'precio_temporada_alta', 0.0) or 0) > 0:
        return hab.precio_temporada_alta
    return hab.precio_base or 0.0

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="GastroHotel Tech API")

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except Exception:
                pass

manager = ConnectionManager()

@app.on_event("startup")
def startup_populate():
    db = SessionLocal()
    if db.query(models.Habitacion).count() == 0:
        db.add(models.Habitacion(id_habitacion=101, tipo="Doble", precio_base=500.0, estado="Limpia"))
        db.add(models.Habitacion(id_habitacion=102, tipo="Suite", precio_base=900.0, estado="Limpia"))
        db.add(models.Habitacion(id_habitacion=103, tipo="Sencilla", precio_base=300.0, estado="Limpia"))
        db.add(models.Huesped(nombres_completos="Cliente Demo", doc_identidad="123456789"))
        db.commit()
        
    if db.query(models.Empleado).count() == 0:
        empleados = [
            models.Empleado(nombre="Mesero Demo", rol="Mesero", pin_acceso="1111"),
            models.Empleado(nombre="Recepción Demo", rol="Recepcion", pin_acceso="2222"),
            models.Empleado(nombre="Gerente Demo", rol="Admin", pin_acceso="3333")
        ]
        db.add_all(empleados)
        db.commit()
        
    if db.query(models.Articulo).count() == 0:
        articulos = [
            models.Articulo(nombre="Hamburguesa Artesanal", categoria="Fuertes", precio=75.0, codigo="RES-001"),
            models.Articulo(nombre="Cóctel de Autor", categoria="Bebidas", precio=45.0, codigo="BEB-001"),
            models.Articulo(nombre="Ensalada César", categoria="Entradas", precio=50.0, codigo="ENT-001")
        ]
        db.add_all(articulos)
        db.commit()
    db.close()

# Configure CORS for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome GastroHotel Tech API"}

@app.get("/habitaciones/")
def read_habitaciones(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    habitaciones = db.query(models.Habitacion).offset(skip).limit(limit).all()
    return habitaciones

# Mocks para Pagos y Facturación
@app.post("/mock/pagar_folio/{id_folio}")
def mock_pagar_folio(id_folio: int, db: Session = Depends(get_db)):
    folio = db.query(models.CuentaFolio).filter(models.CuentaFolio.id_folio == id_folio).first()
    if not folio:
        raise HTTPException(status_code=404, detail="Folio no encontrado")
    
    folio.pagado = True
    db.commit()
    
    # Simulación de generación de FEL
    factura_simulada = {
        "serie": "A1-MOCK",
        "numero": f"100{id_folio}",
        "total": folio.saldo_hospedaje + folio.saldo_restaurante,
        "pdf_url": f"https://mock-fel.com/facturas/100{id_folio}.pdf"
    }
    
    return {"status": "success", "mensaje": "Pago simulado exitoso", "factura": factura_simulada}

# Nuevos Endpoints REST

@app.websocket("/ws/reception")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/login/staff/", response_model=schemas.EmpleadoResponse)
def login_staff(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    empleado = db.query(models.Empleado).filter(models.Empleado.pin_acceso == req.pin, models.Empleado.activo == True).first()
    if not empleado:
        raise HTTPException(status_code=401, detail="PIN incorrecto o empleado inactivo")
    return empleado

@app.post("/login/guest/")
def login_guest(req: schemas.GuestLoginRequest, db: Session = Depends(get_db)):
    huesped = db.query(models.Huesped).filter(models.Huesped.doc_identidad == req.doc_identidad).first()
    if not huesped:
        raise HTTPException(status_code=404, detail="Documento de identidad no encontrado")
    
    reserva = db.query(models.Reserva).filter(
        models.Reserva.id_huesped == huesped.id_huesped,
        models.Reserva.codigo_pin == req.codigo_pin
    ).first()
    
    if not reserva:
        raise HTTPException(status_code=401, detail="PIN de reserva incorrecto")
    
    # Seguridad: El PIN solo funciona durante el Check-in activo
    if reserva.estado != "Check-in":
        raise HTTPException(
            status_code=403,
            detail="Acceso denegado. La reserva no está activa (ya finalizó o aún no inició Check-in)."
        )
        
    folio = db.query(models.CuentaFolio).filter(models.CuentaFolio.id_reserva == reserva.id_reserva).first()
    
    return {
        "huesped": huesped.nombres_completos,
        "habitacion": reserva.id_habitacion,
        "estado": reserva.estado,
        "id_folio": folio.id_folio if folio else None
    }

@app.post("/huespedes/", response_model=schemas.HuespedResponse)
def crear_huesped(huesped: schemas.HuespedCreate, db: Session = Depends(get_db)):
    db_huesped = models.Huesped(**huesped.model_dump())
    db.add(db_huesped)
    db.commit()
    db.refresh(db_huesped)
    return db_huesped

from pydantic import BaseModel
class LimpiezaRequest(BaseModel):
    habitacion: str

@app.post("/solicitar_limpieza/")
async def solicitar_limpieza(req: LimpiezaRequest):
    # Broadcast en background
    try:
        await manager.broadcast({
            "event": "limpieza_solicitada",
            "habitacion": req.habitacion
        })
    except Exception:
        pass
    return {"status": "success", "mensaje": "Recepción notificada"}

@app.get("/reservas/", response_model=list[schemas.ReservaResponse])
def leer_reservas(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Reserva).offset(skip).limit(limit).all()

@app.get("/rack/")
def obtener_rack(db: Session = Depends(get_db)):
    habitaciones = db.query(models.Habitacion).all()
    rack = []
    for hab in habitaciones:
        # Buscar reserva activa o pendiente
        reserva = db.query(models.Reserva).filter(
            models.Reserva.id_habitacion == hab.id_habitacion,
            models.Reserva.estado.in_(["Check-in", "Pendiente"])
        ).first()
        
        estado_oc = "Libre"
        if reserva:
            estado_oc = "Ocupada" if reserva.estado == "Check-in" else "Reservada"
            
        precio_actual = obtener_precio_habitacion(hab, reserva.fecha_checkin if reserva else None, db)
        rack.append({
            "id_habitacion": hab.id_habitacion,
            "tipo": hab.tipo,
            "precio_base": hab.precio_base,
            "precio_temporada_alta": getattr(hab, 'precio_temporada_alta', 0.0) or hab.precio_base,
            "precio_actual": precio_actual,
            "vista": getattr(hab, 'vista', 'Ciudad') or 'Ciudad',
            "capacidad": getattr(hab, 'capacidad', 2) or 2,
            "descripcion": getattr(hab, 'descripcion', '') or '',
            "incluye_desayuno": getattr(hab, 'incluye_desayuno', False),
            "estado_limpieza": hab.estado, # Limpia, Sucia, etc.
            "estado_ocupacion": estado_oc,
            "id_reserva": reserva.id_reserva if reserva else None,
            "huesped": reserva.huesped.nombres_completos if reserva and reserva.huesped else None
        })
    return rack

@app.get("/rack/{id_habitacion}")
def detalle_habitacion(id_habitacion: int, db: Session = Depends(get_db)):
    reserva = db.query(models.Reserva).filter(
        models.Reserva.id_habitacion == id_habitacion,
        models.Reserva.estado.in_(["Check-in", "Pendiente"])
    ).first()
    
    if not reserva:
        return {"error": "No hay reserva activa en esta habitación."}
        
    folio = db.query(models.CuentaFolio).filter(models.CuentaFolio.id_reserva == reserva.id_reserva).first()
    comandas = []
    if folio:
        comandas_db = db.query(models.Comanda).filter(models.Comanda.id_folio == folio.id_folio).all()
        for c in comandas_db:
            comandas.append({
                "id_comanda": c.id_comanda,
                "total": c.total,
                "estado": c.estado
            })
            
    # Calcular saldo de hospedaje: noches x precio de la habitacion
    hab = db.query(models.Habitacion).filter(models.Habitacion.id_habitacion == id_habitacion).first()
    noches = 0
    precio_noche = 0.0
    saldo_hospedaje_calculado = 0.0
    if hab and reserva.fecha_checkin and reserva.fecha_checkout:
        from datetime import date
        ci = reserva.fecha_checkin if isinstance(reserva.fecha_checkin, date) else date.fromisoformat(str(reserva.fecha_checkin))
        co = reserva.fecha_checkout if isinstance(reserva.fecha_checkout, date) else date.fromisoformat(str(reserva.fecha_checkout))
        noches = max((co - ci).days, 1)
        precio_noche = obtener_precio_habitacion(hab, ci, db)
        saldo_hospedaje_calculado = noches * precio_noche
    
    # Si ya está pagado, el saldo es cero.
    esta_pagado = getattr(folio, 'pagado', False) if folio else False
    if esta_pagado:
        saldo_hospedaje_calculado = 0.0
        saldo_restaurante = 0.0
    else:
        saldo_restaurante = sum(c["total"] for c in comandas)
            
    return {
        "id_habitacion": id_habitacion,
        "reserva": {
            "id_reserva": reserva.id_reserva,
            "huesped": reserva.huesped.nombres_completos if reserva.huesped else "Desconocido",
            "checkin": str(reserva.fecha_checkin),
            "checkout": str(reserva.fecha_checkout)
        },
        "folio": {
            "id_folio": folio.id_folio if folio else None,
            "noches": noches,
            "precio_por_noche": precio_noche,
            "saldo_hospedaje": saldo_hospedaje_calculado,
            "saldo_restaurante": saldo_restaurante,
            "total_cuenta": saldo_hospedaje_calculado + saldo_restaurante,
            "comandas": comandas,
            "pagado": esta_pagado
        }
    }

@app.post("/reservas/", response_model=schemas.ReservaResponse)
def crear_reserva(reserva: schemas.ReservaCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. Regla de Negocio: Verificar Habitaciones Traslapadas
    traslape = db.query(models.Reserva).filter(
        models.Reserva.id_habitacion == reserva.id_habitacion,
        models.Reserva.estado.in_(["Pendiente", "Check-in"]),
        models.Reserva.fecha_checkin < reserva.fecha_checkout,
        models.Reserva.fecha_checkout > reserva.fecha_checkin
    ).first()
    
    if traslape:
        # En vez de fallar de inmediato, busquemos una habitación disponible
        disponibles = db.query(models.Habitacion).all()
        habitacion_libre = None
        for hab in disponibles:
            ocupada = db.query(models.Reserva).filter(
                models.Reserva.id_habitacion == hab.id_habitacion,
                models.Reserva.estado.in_(["Pendiente", "Check-in"]),
                models.Reserva.fecha_checkin < reserva.fecha_checkout,
                models.Reserva.fecha_checkout > reserva.fecha_checkin
            ).first()
            if not ocupada:
                habitacion_libre = hab.id_habitacion
                break
                
        if habitacion_libre:
            reserva.id_habitacion = habitacion_libre
        else:
            raise HTTPException(status_code=400, detail="El hotel está 100% lleno en esas fechas. (Traslape)")

    # Crear reserva
    codigo_generado = ''.join(random.choices(string.digits, k=6))
    db_reserva = models.Reserva(**reserva.model_dump(), estado="Pendiente", codigo_pin=codigo_generado)
    db.add(db_reserva)
    db.commit()
    db.refresh(db_reserva)
    
    # 2. Crear Folio automático asociado a la reserva
    folio = models.CuentaFolio(id_reserva=db_reserva.id_reserva)
    db.add(folio)
    db.commit()
    
    # Broadcast en background
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.broadcast({
            "event": "nueva_reserva",
            "reserva": {
                "id_reserva": db_reserva.id_reserva,
                "estado": db_reserva.estado
            }
        }))
    except Exception:
        pass
        
    # Enviar correo de confirmación
    huesped = db.query(models.Huesped).filter(models.Huesped.id_huesped == db_reserva.id_huesped).first()
    if huesped and huesped.email:
        background_tasks.add_task(
            email_service.enviar_correo_confirmacion, 
            huesped.email, 
            db_reserva.id_reserva, 
            str(db_reserva.id_habitacion), 
            str(db_reserva.fecha_checkin), 
            str(db_reserva.fecha_checkout)
        )
        
    return db_reserva

# Endpoints POS Restaurante

@app.get("/articulos/", response_model=list[schemas.ArticuloResponse])
def obtener_articulos(db: Session = Depends(get_db)):
    return db.query(models.Articulo).filter(models.Articulo.activo == True).all()

@app.post("/comandas/", response_model=schemas.ComandaResponse)
def crear_comanda(comanda: schemas.ComandaCreate, db: Session = Depends(get_db)):
    # Validar Room Charge (si id_folio está presente)
    if comanda.id_folio:
        folio = db.query(models.CuentaFolio).filter(models.CuentaFolio.id_folio == comanda.id_folio).first()
        if not folio:
            raise HTTPException(status_code=404, detail="Folio no encontrado. El huésped no tiene check-in activo.")

    db_comanda = models.Comanda(
        id_folio=comanda.id_folio,
        num_mesa=comanda.num_mesa,
        estado="En Cocina"
    )
    db.add(db_comanda)
    db.commit()
    db.refresh(db_comanda)
    
    total_comanda = 0.0
    for detalle in comanda.detalles:
        articulo = db.query(models.Articulo).filter(models.Articulo.id_articulo == detalle.id_articulo).first()
        if not articulo:
            raise HTTPException(status_code=404, detail=f"Articulo {detalle.id_articulo} no encontrado")
        
        db_detalle = models.DetalleComanda(
            id_comanda=db_comanda.id_comanda,
            id_articulo=articulo.id_articulo,
            cantidad=detalle.cantidad,
            precio_unitario=articulo.precio
        )
        db.add(db_detalle)
        total_comanda += articulo.precio * detalle.cantidad
        
        # Lógica de deducción de inventario por receta
        recetas = db.query(models.Receta).filter(models.Receta.id_articulo == articulo.id_articulo).all()
        for receta in recetas:
            insumo = db.query(models.Insumo).filter(models.Insumo.id_insumo == receta.id_insumo).first()
            if insumo:
                insumo.stock_actual -= (receta.cantidad * detalle.cantidad)
        
    db_comanda.total = total_comanda
    
    # Si se cargó a habitación, sumar al folio del restaurante
    if comanda.id_folio:
        folio.saldo_restaurante += total_comanda
        
    db.commit()
    db.refresh(db_comanda)
    
    return db_comanda

# ─────────────────────────────────────────────
# MÓDULO INVENTARIO Y RECETAS
# ─────────────────────────────────────────────

@app.get("/insumos/", response_model=list[schemas.InsumoResponse])
def listar_insumos(db: Session = Depends(get_db)):
    return db.query(models.Insumo).all()

@app.post("/insumos/", response_model=schemas.InsumoResponse)
def crear_insumo(insumo: schemas.InsumoCreate, db: Session = Depends(get_db)):
    db_insumo = models.Insumo(**insumo.model_dump())
    db.add(db_insumo)
    db.commit()
    db.refresh(db_insumo)
    return db_insumo

@app.put("/insumos/{id_insumo}", response_model=schemas.InsumoResponse)
def actualizar_insumo(id_insumo: int, insumo: schemas.InsumoUpdate, db: Session = Depends(get_db)):
    db_insumo = db.query(models.Insumo).filter(models.Insumo.id_insumo == id_insumo).first()
    if not db_insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
    
    update_data = insumo.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_insumo, key, value)
        
    db.commit()
    db.refresh(db_insumo)
    return db_insumo

@app.post("/articulos/{id_articulo}/recetas/", response_model=schemas.RecetaResponse)
def agregar_receta(id_articulo: int, receta: schemas.RecetaCreate, db: Session = Depends(get_db)):
    art = db.query(models.Articulo).filter(models.Articulo.id_articulo == id_articulo).first()
    if not art:
        raise HTTPException(status_code=404, detail="Articulo no encontrado")
        
    insumo = db.query(models.Insumo).filter(models.Insumo.id_insumo == receta.id_insumo).first()
    if not insumo:
        raise HTTPException(status_code=404, detail="Insumo no encontrado")
        
    db_receta = models.Receta(
        id_articulo=id_articulo,
        id_insumo=receta.id_insumo,
        cantidad=receta.cantidad
    )
    db.add(db_receta)
    db.commit()
    db.refresh(db_receta)
    return db_receta

@app.delete("/recetas/{id_receta}")
def eliminar_receta(id_receta: int, db: Session = Depends(get_db)):
    db_receta = db.query(models.Receta).filter(models.Receta.id_receta == id_receta).first()
    if not db_receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")
    db.delete(db_receta)
    db.commit()
    return {"ok": True}

# ─────────────────────────────────────────────
# MÓDULO 1: Check-in / Check-out Manual
# ─────────────────────────────────────────────

@app.patch("/reservas/{id_reserva}/estado")
def cambiar_estado_reserva(id_reserva: int, body: dict, db: Session = Depends(get_db)):
    nuevo_estado = body.get("estado")
    if nuevo_estado not in ["Check-in", "Check-out", "No-Show", "Pendiente"]:
        raise HTTPException(status_code=400, detail="Estado inválido.")

    reserva = db.query(models.Reserva).filter(models.Reserva.id_reserva == id_reserva).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")

    # Bloqueo de Check-out si hay saldo pendiente
    if nuevo_estado == "Check-out":
        hab = db.query(models.Habitacion).filter(models.Habitacion.id_habitacion == reserva.id_habitacion).first()
        folio = db.query(models.CuentaFolio).filter(models.CuentaFolio.id_reserva == id_reserva).first()

        # Si el folio fue marcado como pagado, permitir checkout sin verificar montos
        if folio and getattr(folio, 'pagado', False):
            pass  # Folio saldado ✔️, permitir checkout
        else:
            # Calcular saldo pendiente
            from datetime import date
            ci = reserva.fecha_checkin if isinstance(reserva.fecha_checkin, date) else date.fromisoformat(str(reserva.fecha_checkin))
            co = reserva.fecha_checkout if isinstance(reserva.fecha_checkout, date) else date.fromisoformat(str(reserva.fecha_checkout))
            noches = (co - ci).days
            saldo_hosp = noches * (hab.precio_base if hab else 0)
            saldo_rest = folio.saldo_restaurante if folio else 0
            total = saldo_hosp + saldo_rest

            if total > 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"No se puede hacer Check-out. Saldo pendiente: Q.{total:.2f} (Hospedaje: Q.{saldo_hosp:.2f} + Restaurante: Q.{saldo_rest:.2f})"
                )

        # Marcar habitación como sucia al hacer checkout
        if hab:
            hab.estado = "Sucia"
        
        # Invalidar PIN para que el huésped no pueda seguir usándolo
        reserva.codigo_pin = None

    reserva.estado = nuevo_estado
    db.commit()
    return {"ok": True, "nuevo_estado": nuevo_estado, "id_reserva": id_reserva}

# ─────────────────────────────────────────────
# MÓDULO 2: Marcar Limpieza Completada
# ─────────────────────────────────────────────

@app.patch("/habitaciones/{id_habitacion}/limpieza")
def marcar_limpieza(id_habitacion: int, body: dict, db: Session = Depends(get_db)):
    hab = db.query(models.Habitacion).filter(models.Habitacion.id_habitacion == id_habitacion).first()
    if not hab:
        raise HTTPException(status_code=404, detail="Habitación no encontrada.")
    hab.estado = body.get("estado", "Limpia")
    db.commit()
    return {"ok": True, "habitacion": id_habitacion, "estado": hab.estado}

# ─────────────────────────────────────────────
# MÓDULO 3: CRM Básico de Huéspedes
# ─────────────────────────────────────────────

@app.get("/huespedes/")
def listar_huespedes(db: Session = Depends(get_db)):
    huespedes = db.query(models.Huesped).all()
    result = []
    for h in huespedes:
        reservas = db.query(models.Reserva).filter(models.Reserva.id_huesped == h.id_huesped).all()
        total_visitas = len(reservas)
        result.append({
            "id_huesped": h.id_huesped,
            "nombres_completos": h.nombres_completos,
            "doc_identidad": h.doc_identidad,
            "preferencias_alergias": getattr(h, 'preferencias_alergias', ''),
            "total_visitas": total_visitas,
            "reservas": [{"id_reserva": r.id_reserva, "id_habitacion": r.id_habitacion,
                          "fecha_checkin": str(r.fecha_checkin), "fecha_checkout": str(r.fecha_checkout),
                          "estado": r.estado} for r in reservas]
        })
    return result

# ─────────────────────────────────────────────
# MÓDULO 4: Gestión de Staff CRUD
# ─────────────────────────────────────────────

@app.get("/staff/")
def listar_staff(db: Session = Depends(get_db)):
    empleados = db.query(models.Empleado).all()
    return [{"id": e.id_empleado, "nombre": e.nombre, "rol": e.rol,
             "pin": e.pin_acceso, "activo": getattr(e, 'activo', True)} for e in empleados]

@app.post("/staff/")
def crear_staff(body: dict, db: Session = Depends(get_db)):
    nuevo = models.Empleado(
        nombre=body["nombre"],
        rol=body["rol"],
        pin_acceso=body["pin"]
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return {"ok": True, "id": nuevo.id_empleado}

@app.put("/staff/{id_empleado}")
def editar_staff(id_empleado: int, body: dict, db: Session = Depends(get_db)):
    emp = db.query(models.Empleado).filter(models.Empleado.id_empleado == id_empleado).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado.")
    emp.nombre = body.get("nombre", emp.nombre)
    emp.rol = body.get("rol", emp.rol)
    emp.pin_acceso = body.get("pin", emp.pin_acceso)
    db.commit()
    return {"ok": True}

@app.delete("/staff/{id_empleado}")
def desactivar_staff(id_empleado: int, db: Session = Depends(get_db)):
    emp = db.query(models.Empleado).filter(models.Empleado.id_empleado == id_empleado).first()
    if not emp:
        raise HTTPException(status_code=404, detail="Empleado no encontrado.")
    # Eliminación lógica: eliminamos del sistema demo (en producción sería activo=False)
    db.delete(emp)
    db.commit()
    return {"ok": True, "mensaje": "Empleado eliminado del sistema."}

# ─────────────────────────────────────────────
# MÓDULO 5: Reportes y Cierre de Caja
# ─────────────────────────────────────────────

@app.get("/reportes/resumen")
def reporte_resumen(db: Session = Depends(get_db)):
    from datetime import date
    hoy = date.today()

    # Comandas del día
    comandas_hoy = db.query(models.Comanda).all()
    total_restaurante = sum(c.total or 0 for c in comandas_hoy)

    # Habitaciones
    total_habs = db.query(models.Habitacion).count()
    ocupadas = db.query(models.Reserva).filter(models.Reserva.estado.in_(["Check-in","Pendiente"])).count()
    libres = total_habs - ocupadas

    # Ingresos de hospedaje (reservas activas)
    reservas_activas = db.query(models.Reserva).filter(models.Reserva.estado.in_(["Check-in","Pendiente"])).all()
    total_hospedaje = 0.0
    for r in reservas_activas:
        hab = db.query(models.Habitacion).filter(models.Habitacion.id_habitacion == r.id_habitacion).first()
        if hab and r.fecha_checkin and r.fecha_checkout:
            ci = r.fecha_checkin if isinstance(r.fecha_checkin, date) else date.fromisoformat(str(r.fecha_checkin))
            co = r.fecha_checkout if isinstance(r.fecha_checkout, date) else date.fromisoformat(str(r.fecha_checkout))
            noches = max((co - ci).days, 0)
            total_hospedaje += noches * hab.precio_base

    # Detalle de comandas
    detalle_comandas = []
    for c in comandas_hoy:
        detalle_comandas.append({
            "id_comanda": c.id_comanda,
            "num_mesa": c.num_mesa,
            "total": c.total or 0,
            "estado": c.estado
        })

    # Pagos reales registrados (Caja Actual)
    pagos_hoy = db.query(models.Pago).all()
    caja_real = sum(p.monto for p in pagos_hoy)

    return {
        "fecha": str(hoy),
        "total_restaurante": total_restaurante,
        "total_hospedaje": total_hospedaje,
        "total_general": total_restaurante + total_hospedaje,
        "caja_real": caja_real,
        "habitaciones_total": total_habs,
        "habitaciones_ocupadas": ocupadas,
        "habitaciones_libres": libres,
        "porcentaje_ocupacion": round((ocupadas / total_habs * 100) if total_habs > 0 else 0, 1),
        "comandas": detalle_comandas,
        "pagos": [
            {
                "id_pago": p.id_pago,
                "monto": p.monto,
                "metodo": p.metodo,
                "detalles": p.detalles,
                "fecha_hora": p.fecha_hora
            } for p in pagos_hoy
        ]
    }
# ─────────────────────────────────────────────
# MÓDULO DE PAGO — Registrar pago del folio
# ─────────────────────────────────────────────

@app.post("/reservas/{id_reserva}/pago")
def registrar_pago(id_reserva: int, body: dict, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Registra el pago completo de una reserva.
    Pone saldo_hospedaje y saldo_restaurante en 0
    para permitir el Check-out posterior.
    """
    reserva = db.query(models.Reserva).filter(models.Reserva.id_reserva == id_reserva).first()
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada.")
    if reserva.estado not in ["Check-in", "Pendiente"]:
        raise HTTPException(status_code=400, detail="La reserva no está activa.")

    metodo = body.get("metodo_pago", "Efectivo")
    monto = body.get("monto", 0)

    # Datos de pago adicionales
    num_tarjeta = body.get("numero_tarjeta", "")
    doc_transfer = body.get("doc_transferencia", "")
    
    detalles = ""
    if metodo == "Tarjeta":
        detalles = f"Tarjeta terminada en {num_tarjeta[-4:]}" if len(num_tarjeta) >= 4 else "Tarjeta"
    elif metodo == "Transferencia":
        detalles = f"Ref: {doc_transfer}"

    from datetime import datetime, date
    ahora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # ─── Construir desglose completo para la Factura ───
    items_factura = []
    
    # 1. Hospedaje
    hab = db.query(models.Habitacion).filter(models.Habitacion.id_habitacion == reserva.id_habitacion).first()
    if hab and reserva.fecha_checkin and reserva.fecha_checkout:
        ci = reserva.fecha_checkin if isinstance(reserva.fecha_checkin, date) else date.fromisoformat(str(reserva.fecha_checkin))
        co = reserva.fecha_checkout if isinstance(reserva.fecha_checkout, date) else date.fromisoformat(str(reserva.fecha_checkout))
        noches = max((co - ci).days, 1)
        precio_noche = obtener_precio_habitacion(hab, ci, db)
        items_factura.append({
            "codigo": "HOS-001",
            "descripcion": f"Hospedaje - Habitación {reserva.id_habitacion} ({hab.tipo} - Vista {getattr(hab, 'vista', 'Ciudad')})",
            "cantidad": noches,
            "precio_unitario": precio_noche,
            "subtotal": noches * precio_noche
        })
    
    # 2. Cargos de Restaurante / Room Service
    folio = db.query(models.CuentaFolio).filter(models.CuentaFolio.id_reserva == id_reserva).first()
    if folio:
        comandas_db = db.query(models.Comanda).filter(models.Comanda.id_folio == folio.id_folio).all()
        for cmd in comandas_db:
            detalles_cmd = db.query(models.DetalleComanda).filter(models.DetalleComanda.id_comanda == cmd.id_comanda).all()
            for det in detalles_cmd:
                art = db.query(models.Articulo).filter(models.Articulo.id_articulo == det.id_articulo).first()
                if art:
                    items_factura.append({
                        "codigo": getattr(art, 'codigo', 'ART-000') or 'ART-000',
                        "descripcion": art.nombre,
                        "cantidad": det.cantidad,
                        "precio_unitario": det.precio_unitario,
                        "subtotal": det.cantidad * det.precio_unitario
                    })
    
    # Determinar tipo de factura
    tiene_hospedaje = any(i["codigo"].startswith("HOS") for i in items_factura)
    tiene_restaurante = any(not i["codigo"].startswith("HOS") for i in items_factura)
    tipo_factura = "Mixta" if (tiene_hospedaje and tiene_restaurante) else ("Hospedaje" if tiene_hospedaje else "Restaurante")

    # Crear registro de Pago
    nuevo_pago = models.Pago(
        id_reserva=id_reserva,
        monto=monto,
        metodo=metodo,
        fecha_hora=ahora,
        detalles=detalles
    )
    db.add(nuevo_pago)
    
    # Crear Factura con desglose
    nit = body.get("nit_cliente", "CF")
    nombre = body.get("nombre_cliente", "Consumidor Final")
    direccion = body.get("direccion", "Ciudad")
    
    nueva_factura = models.Factura(
        id_reserva=id_reserva,
        nit_cliente=nit,
        nombre_cliente=nombre,
        direccion=direccion,
        fecha_emision=ahora,
        total=monto,
        detalles_json=json.dumps(items_factura, ensure_ascii=False),
        tipo=tipo_factura
    )
    db.add(nueva_factura)

    # Saldar el folio
    if folio:
        folio.saldo_hospedaje = 0
        folio.saldo_restaurante = 0
        folio.pagado = True

    db.commit()
    db.refresh(nueva_factura)

    huesped = db.query(models.Huesped).filter(models.Huesped.id_huesped == reserva.id_huesped).first()
    if huesped and huesped.email:
        background_tasks.add_task(
            email_service.enviar_correo_factura,
            huesped.email,
            nueva_factura.id_factura,
            monto
        )

    return {
        "ok": True,
        "mensaje": f"Pago de Q.{monto:.2f} registrado correctamente ({metodo}). Ya puede proceder al Check-out.",
        "id_reserva": id_reserva,
        "metodo_pago": metodo,
        "factura": {
            "id_factura": nueva_factura.id_factura,
            "nit": nit,
            "nombre": nombre,
            "direccion": direccion,
            "total": monto,
            "fecha": ahora,
            "tipo": tipo_factura,
            "items": items_factura,
            "reserva_id": id_reserva,
            "habitacion": reserva.id_habitacion
        }
    }

@app.get("/pagos")
def obtener_pagos(db: Session = Depends(get_db)):
    pagos = db.query(models.Pago).all()
    facturas = db.query(models.Factura).all()
    
    return {
        "pagos": [
            {
                "id_pago": p.id_pago,
                "id_reserva": p.id_reserva,
                "monto": p.monto,
                "metodo": p.metodo,
                "fecha_hora": p.fecha_hora,
                "detalles": p.detalles
            } for p in pagos
        ],
        "facturas": [
            {
                "id_factura": f.id_factura,
                "id_reserva": f.id_reserva,
                "nit": f.nit_cliente,
                "nombre": f.nombre_cliente,
                "total": f.total,
                "fecha": f.fecha_emision
            } for f in facturas
        ]
    }

# ─────────────────────────────────────────────
# MÓDULO POS: Cobro Directo de Comandas (Walk-in)
# ─────────────────────────────────────────────

@app.get("/comandas/activas")
def listar_comandas_activas(db: Session = Depends(get_db)):
    """Lista todas las comandas pendientes de cobro (sin folio de habitación = clientes de paso)"""
    # Comandas de clientes de paso (sin habitación asociada)
    comandas_paso = db.query(models.Comanda).filter(
        models.Comanda.id_folio == None,
        models.Comanda.estado.in_(["En Cocina", "Entregado"])
    ).all()
    
    result = []
    for c in comandas_paso:
        detalles = db.query(models.DetalleComanda).filter(models.DetalleComanda.id_comanda == c.id_comanda).all()
        items = []
        for d in detalles:
            art = db.query(models.Articulo).filter(models.Articulo.id_articulo == d.id_articulo).first()
            if art:
                items.append({
                    "codigo": getattr(art, 'codigo', 'ART-000') or 'ART-000',
                    "nombre": art.nombre,
                    "cantidad": d.cantidad,
                    "precio_unitario": d.precio_unitario,
                    "subtotal": d.cantidad * d.precio_unitario
                })
        result.append({
            "id_comanda": c.id_comanda,
            "num_mesa": c.num_mesa,
            "total": c.total,
            "estado": c.estado,
            "items": items
        })
    return result

@app.post("/comandas/{id_comanda}/pago")
def cobrar_comanda_walkin(id_comanda: int, body: dict, db: Session = Depends(get_db)):
    """Cobrar directamente una comanda de cliente de paso (sin reserva de habitación)"""
    from datetime import datetime
    comanda = db.query(models.Comanda).filter(models.Comanda.id_comanda == id_comanda).first()
    if not comanda:
        raise HTTPException(status_code=404, detail="Comanda no encontrada")
    if comanda.estado == "Pagado":
        raise HTTPException(status_code=400, detail="Esta comanda ya fue pagada")

    metodo = body.get("metodo_pago", "Efectivo")
    num_tarjeta = body.get("numero_tarjeta", "")
    doc_transfer = body.get("doc_transferencia", "")
    nit = body.get("nit_cliente", "CF")
    nombre_cliente = body.get("nombre_cliente", "Consumidor Final")
    direccion = body.get("direccion", "Ciudad")
    
    detalles_str = ""
    if metodo == "Tarjeta":
        detalles_str = f"Tarjeta terminada en {num_tarjeta[-4:]}" if len(num_tarjeta) >= 4 else "Tarjeta"
    elif metodo == "Transferencia":
        detalles_str = f"Ref: {doc_transfer}"

    ahora = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Construir items para la factura
    detalles_db = db.query(models.DetalleComanda).filter(models.DetalleComanda.id_comanda == id_comanda).all()
    items_factura = []
    for det in detalles_db:
        art = db.query(models.Articulo).filter(models.Articulo.id_articulo == det.id_articulo).first()
        if art:
            items_factura.append({
                "codigo": getattr(art, 'codigo', 'ART-000') or 'ART-000',
                "descripcion": art.nombre,
                "cantidad": det.cantidad,
                "precio_unitario": det.precio_unitario,
                "subtotal": det.cantidad * det.precio_unitario
            })

    # Crear Pago
    nuevo_pago = models.Pago(
        id_reserva=None,
        monto=comanda.total,
        metodo=metodo,
        fecha_hora=ahora,
        detalles=detalles_str
    )
    db.add(nuevo_pago)

    # Crear Factura detallada
    nueva_factura = models.Factura(
        id_reserva=None,
        nit_cliente=nit,
        nombre_cliente=nombre_cliente,
        direccion=direccion,
        fecha_emision=ahora,
        total=comanda.total,
        detalles_json=json.dumps(items_factura, ensure_ascii=False),
        tipo="Restaurante"
    )
    db.add(nueva_factura)

    comanda.estado = "Pagado"
    db.commit()
    db.refresh(nueva_factura)

    return {
        "ok": True,
        "factura": {
            "id_factura": nueva_factura.id_factura,
            "nit": nit,
            "nombre": nombre_cliente,
            "direccion": direccion,
            "total": comanda.total,
            "fecha": ahora,
            "tipo": "Restaurante",
            "mesa": comanda.num_mesa,
            "items": items_factura
        }
    }

# ─────────────────────────────────────────────
# MÓDULO AUTH & REGISTRO DE HUÉSPEDES
# ─────────────────────────────────────────────

@app.post("/auth/huesped/registro", response_model=schemas.HuespedResponse)
def registrar_huesped(req: schemas.HuespedRegisterRequest, db: Session = Depends(get_db)):
    existente = db.query(models.Huesped).filter(models.Huesped.email == req.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="Este correo electrónico ya está registrado.")
    
    nuevo_huesped = models.Huesped(
        nombres_completos=req.nombres_completos,
        doc_identidad=req.doc_identidad,
        email=req.email,
        password_hash=hash_pass(req.password),
        telefono=req.telefono
    )
    db.add(nuevo_huesped)
    db.commit()
    db.refresh(nuevo_huesped)
    return nuevo_huesped

@app.post("/auth/huesped/login")
def login_huesped_email(req: schemas.HuespedEmailLoginRequest, db: Session = Depends(get_db)):
    huesped = db.query(models.Huesped).filter(
        models.Huesped.email == req.email,
        models.Huesped.password_hash == hash_pass(req.password)
    ).first()
    if not huesped:
        raise HTTPException(status_code=401, detail="Correo electrónico o contraseña incorrectos")
    
    reserva_activa = db.query(models.Reserva).filter(
        models.Reserva.id_huesped == huesped.id_huesped
    ).order_by(models.Reserva.id_reserva.desc()).first()
    
    return {
        "id_huesped": huesped.id_huesped,
        "nombres_completos": huesped.nombres_completos,
        "doc_identidad": huesped.doc_identidad,
        "email": huesped.email,
        "telefono": huesped.telefono,
        "reserva_activa": {
            "id_reserva": reserva_activa.id_reserva,
            "id_habitacion": reserva_activa.id_habitacion,
            "estado": reserva_activa.estado,
            "codigo_pin": reserva_activa.codigo_pin,
            "fecha_checkin": str(reserva_activa.fecha_checkin),
            "fecha_checkout": str(reserva_activa.fecha_checkout)
        } if reserva_activa else None
    }

# ─────────────────────────────────────────────
# CONFIGURACIÓN DEL HOTEL & PRECIOS
# ─────────────────────────────────────────────

@app.get("/configuracion/")
def obtener_configuracion(db: Session = Depends(get_db)):
    configs = db.query(models.Configuracion).all()
    return {c.clave: c.valor for c in configs}

@app.patch("/configuracion/")
def actualizar_configuracion(body: schemas.ConfiguracionUpdate, db: Session = Depends(get_db)):
    if body.temporada_alta_inicio:
        c1 = db.query(models.Configuracion).filter(models.Configuracion.clave == "temporada_alta_inicio").first()
        if not c1:
            c1 = models.Configuracion(clave="temporada_alta_inicio", valor=body.temporada_alta_inicio)
            db.add(c1)
        else:
            c1.valor = body.temporada_alta_inicio

    if body.temporada_alta_fin:
        c2 = db.query(models.Configuracion).filter(models.Configuracion.clave == "temporada_alta_fin").first()
        if not c2:
            c2 = models.Configuracion(clave="temporada_alta_fin", valor=body.temporada_alta_fin)
            db.add(c2)
        else:
            c2.valor = body.temporada_alta_fin

    db.commit()
    return {"ok": True, "mensaje": "Configuración actualizada correctamente"}

@app.patch("/habitaciones/{id_habitacion}")
def actualizar_habitacion(id_habitacion: int, body: schemas.HabitacionUpdate, db: Session = Depends(get_db)):
    hab = db.query(models.Habitacion).filter(models.Habitacion.id_habitacion == id_habitacion).first()
    if not hab:
        raise HTTPException(status_code=404, detail="Habitación no encontrada")
    
    if body.precio_base is not None: hab.precio_base = body.precio_base
    if body.precio_temporada_alta is not None: hab.precio_temporada_alta = body.precio_temporada_alta
    if body.vista is not None: hab.vista = body.vista
    if body.capacidad is not None: hab.capacidad = body.capacidad
    if body.descripcion is not None: hab.descripcion = body.descripcion
    if body.incluye_desayuno is not None: hab.incluye_desayuno = body.incluye_desayuno
    if body.tipo is not None: hab.tipo = body.tipo

    db.commit()
    db.refresh(hab)
    return hab
