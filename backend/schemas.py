from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import date

class HuespedBase(BaseModel):
    nombres_completos: str
    doc_identidad: str
    preferencias_alergias: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None

class HuespedCreate(HuespedBase):
    password: Optional[str] = None

class HuespedRegisterRequest(BaseModel):
    nombres_completos: str
    doc_identidad: str
    email: str
    password: str
    telefono: Optional[str] = None

class HuespedEmailLoginRequest(BaseModel):
    email: str
    password: str

class HuespedResponse(HuespedBase):
    id_huesped: int
    model_config = ConfigDict(from_attributes=True)

class HabitacionResponse(BaseModel):
    id_habitacion: int
    tipo: str
    precio_base: float
    estado: str
    vista: Optional[str] = "Ciudad"
    capacidad: Optional[int] = 2
    descripcion: Optional[str] = ""
    precio_temporada_alta: Optional[float] = 0.0
    incluye_desayuno: Optional[bool] = False
    model_config = ConfigDict(from_attributes=True)

class HabitacionUpdate(BaseModel):
    precio_base: Optional[float] = None
    precio_temporada_alta: Optional[float] = None
    vista: Optional[str] = None
    capacidad: Optional[int] = None
    descripcion: Optional[str] = None
    incluye_desayuno: Optional[bool] = None
    tipo: Optional[str] = None

class ConfiguracionItem(BaseModel):
    clave: str
    valor: str

class ConfiguracionUpdate(BaseModel):
    temporada_alta_inicio: Optional[str] = None
    temporada_alta_fin: Optional[str] = None

class ReservaCreate(BaseModel):
    id_huesped: int
    id_habitacion: int
    fecha_checkin: date
    fecha_checkout: date

class ReservaResponse(ReservaCreate):
    id_reserva: int
    estado: str
    codigo_pin: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class EmpleadoResponse(BaseModel):
    id_empleado: int
    nombre: str
    rol: str
    activo: bool
    model_config = ConfigDict(from_attributes=True)

class LoginRequest(BaseModel):
    pin: str

class GuestLoginRequest(BaseModel):
    doc_identidad: str
    codigo_pin: str

class RecetaResponse(BaseModel):
    id_receta: int
    id_articulo: int
    id_insumo: int
    cantidad: float
    model_config = ConfigDict(from_attributes=True)

class ArticuloResponse(BaseModel):
    id_articulo: int
    nombre: str
    categoria: str
    precio: float
    activo: bool
    recetas: Optional[List[RecetaResponse]] = []
    model_config = ConfigDict(from_attributes=True)

class DetalleComandaCreate(BaseModel):
    id_articulo: int
    cantidad: int

class ComandaCreate(BaseModel):
    id_folio: Optional[int] = None # Puede ser Nulo si es cliente de paso
    num_mesa: int
    detalles: List[DetalleComandaCreate]

class ComandaResponse(BaseModel):
    id_comanda: int
    total: float
    estado: str
    model_config = ConfigDict(from_attributes=True)

class InsumoBase(BaseModel):
    nombre: str
    unidad_medida: str
    stock_actual: float
    punto_reorden: float
    costo_unitario: float

class InsumoCreate(InsumoBase):
    pass

class InsumoUpdate(BaseModel):
    nombre: Optional[str] = None
    unidad_medida: Optional[str] = None
    stock_actual: Optional[float] = None
    punto_reorden: Optional[float] = None
    costo_unitario: Optional[float] = None

class InsumoResponse(InsumoBase):
    id_insumo: int
    model_config = ConfigDict(from_attributes=True)

class RecetaCreate(BaseModel):
    id_insumo: int
    cantidad: float
