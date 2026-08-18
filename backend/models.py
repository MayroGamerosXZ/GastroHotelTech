from sqlalchemy import Column, Integer, String, Float, Boolean, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class Empleado(Base):
    __tablename__ = "empleados"
    id_empleado = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    rol = Column(String) # Recepcion, Mesero, Cocina, Admin
    pin_acceso = Column(String)
    activo = Column(Boolean, default=True)

class Configuracion(Base):
    __tablename__ = "configuracion"
    id = Column(Integer, primary_key=True, index=True)
    clave = Column(String, unique=True, index=True)
    valor = Column(String)

class Huesped(Base):
    __tablename__ = "huespedes"
    id_huesped = Column(Integer, primary_key=True, index=True)
    nombres_completos = Column(String)
    doc_identidad = Column(String, unique=True, index=True)
    preferencias_alergias = Column(Text, nullable=True)
    eliminado_logico = Column(Boolean, default=False)
    email = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    telefono = Column(String, nullable=True)

    reservas = relationship("Reserva", back_populates="huesped")

class Habitacion(Base):
    __tablename__ = "habitaciones"
    id_habitacion = Column(Integer, primary_key=True, index=True) # Ej: 101, 205
    tipo = Column(String) # Sencilla, Doble, Suite
    precio_base = Column(Float)
    estado = Column(String) # Limpia, Sucia, Mantenimiento
    vista = Column(String, default="Ciudad") # Ciudad, Jardín, Piscina, Volcán
    capacidad = Column(Integer, default=2)
    descripcion = Column(String, default="")
    precio_temporada_alta = Column(Float, default=0.0)
    incluye_desayuno = Column(Boolean, default=False)

    reservas = relationship("Reserva", back_populates="habitacion")

class Reserva(Base):
    __tablename__ = "reservas"
    id_reserva = Column(Integer, primary_key=True, index=True)
    id_huesped = Column(Integer, ForeignKey("huespedes.id_huesped"))
    id_habitacion = Column(Integer, ForeignKey("habitaciones.id_habitacion"))
    fecha_checkin = Column(Date)
    fecha_checkout = Column(Date)
    estado = Column(String) # Pendiente, Check-in, Check-out, No-Show
    codigo_pin = Column(String, nullable=True) # PIN de 6 dígitos para Room Service

    huesped = relationship("Huesped", back_populates="reservas")
    habitacion = relationship("Habitacion", back_populates="reservas")
    folio = relationship("CuentaFolio", uselist=False, back_populates="reserva")

class CuentaFolio(Base):
    __tablename__ = "cuentas_folio"
    id_folio = Column(Integer, primary_key=True, index=True)
    id_reserva = Column(Integer, ForeignKey("reservas.id_reserva"), unique=True)
    saldo_hospedaje = Column(Float, default=0.0)
    saldo_restaurante = Column(Float, default=0.0)
    pagado = Column(Boolean, default=False)

    reserva = relationship("Reserva", back_populates="folio")
    comandas = relationship("Comanda", back_populates="folio")

class Comanda(Base):
    __tablename__ = "comandas"
    id_comanda = Column(Integer, primary_key=True, index=True)
    id_folio = Column(Integer, ForeignKey("cuentas_folio.id_folio"), nullable=True) # Nulo si es cliente de paso
    num_mesa = Column(Integer)
    total = Column(Float, default=0.0)
    estado = Column(String) # En Cocina, Entregado, Pagado, Cargado a Habitacion

    folio = relationship("CuentaFolio", back_populates="comandas")
    detalles = relationship("DetalleComanda", back_populates="comanda")

class Articulo(Base):
    __tablename__ = "articulos"
    id_articulo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    categoria = Column(String) # Bebidas, Entradas, Fuertes, Postres
    precio = Column(Float)
    activo = Column(Boolean, default=True)
    codigo = Column(String, nullable=True) # Ej: RES-001, BEB-002

    recetas = relationship("Receta", back_populates="articulo")

class DetalleComanda(Base):
    __tablename__ = "detalles_comanda"
    id_detalle = Column(Integer, primary_key=True, index=True)
    id_comanda = Column(Integer, ForeignKey("comandas.id_comanda"))
    id_articulo = Column(Integer, ForeignKey("articulos.id_articulo"))
    cantidad = Column(Integer)
    precio_unitario = Column(Float)

    comanda = relationship("Comanda", back_populates="detalles")
    articulo = relationship("Articulo")

class Pago(Base):
    __tablename__ = "pagos"
    id_pago = Column(Integer, primary_key=True, index=True)
    id_reserva = Column(Integer, ForeignKey("reservas.id_reserva"))
    monto = Column(Float)
    metodo = Column(String) # Efectivo, Tarjeta, Transferencia
    fecha_hora = Column(String)
    detalles = Column(String, nullable=True) # Num Tarjeta o Referencia

    reserva = relationship("Reserva")

class Factura(Base):
    __tablename__ = "facturas"
    id_factura = Column(Integer, primary_key=True, index=True)
    id_reserva = Column(Integer, ForeignKey("reservas.id_reserva"), nullable=True)
    nit_cliente = Column(String)
    nombre_cliente = Column(String)
    direccion = Column(String, nullable=True)
    fecha_emision = Column(String)
    total = Column(Float)
    detalles_json = Column(Text, nullable=True) # Snapshot JSON de los items cobrados
    tipo = Column(String, default="Hospedaje") # Hospedaje, Restaurante, Mixta

    reserva = relationship("Reserva")

class Insumo(Base):
    __tablename__ = "insumos"
    id_insumo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String)
    unidad_medida = Column(String) # g, ml, ud
    stock_actual = Column(Float, default=0.0)
    punto_reorden = Column(Float, default=10.0)
    costo_unitario = Column(Float, default=0.0)

class Receta(Base):
    __tablename__ = "recetas"
    id_receta = Column(Integer, primary_key=True, index=True)
    id_articulo = Column(Integer, ForeignKey("articulos.id_articulo"))
    id_insumo = Column(Integer, ForeignKey("insumos.id_insumo"))
    cantidad = Column(Float) # Cantidad que se descuenta

    articulo = relationship("Articulo", back_populates="recetas")
    insumo = relationship("Insumo")
