import re
from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List, Dict, Any

class CartItem(BaseModel):
    id: Optional[str] = "item"
    name: Optional[str] = None
    title: Optional[str] = None
    article: Optional[str] = None
    diameter: Optional[Any] = None
    sdr: Optional[Any] = None
    form: Optional[str] = None
    unit: Optional[str] = None
    category: Optional[str] = None
    qty: Optional[int] = 1
    quantity: Optional[int] = None
    weightM: Optional[float] = 0.0
    price: Optional[float] = 0.0

    model_config = ConfigDict(extra="allow")

    @property
    def display_name(self) -> str:
        return self.name or self.title or self.id or "Трубная продукция"

    @property
    def display_qty(self) -> int:
        return self.qty or self.quantity or 1

class SpecificationLeadRequest(BaseModel):
    name: Optional[str] = "Заказчик"
    phone: Optional[str] = "Не указан"
    email: Optional[str] = None
    company: Optional[str] = None
    inn: Optional[str] = None
    delivery_address: Optional[str] = None
    comment: Optional[str] = None
    items: List[CartItem] = Field(default_factory=list)
    total_weight_kg: Optional[float] = 0.0

    model_config = ConfigDict(extra="allow")

class CallbackLeadRequest(BaseModel):
    name: Optional[str] = "Специалист"
    phone: Optional[str] = "+7 (999) 000-00-00"
    topic: Optional[str] = "Консультация инженера"
    comment: Optional[str] = None

    model_config = ConfigDict(extra="allow")

class ATRRequest(BaseModel):
    name: Optional[str] = "Инженер-проектировщик"
    phone: Optional[str] = "+7 (999) 000-00-00"
    email: str = Field(..., description="Корпоративный e-mail")
    company: Optional[str] = "Проектная организация"
    inn: Optional[str] = "7728168971"
    purpose: Optional[str] = "Проектирование инженерных сетей"

    model_config = ConfigDict(extra="allow")

    @field_validator('inn')
    def validate_inn(cls, v: Optional[str]) -> str:
        if not v:
            return "7728168971"
        clean = re.sub(r'\D', '', str(v))
        if len(clean) in (10, 12):
            return clean
        return "7728168971"

class LeadResponse(BaseModel):
    success: bool = True
    order_number: str
    message: str
    data: Optional[Dict[str, Any]] = None

class ATRResponse(BaseModel):
    success: bool = True
    order_number: str
    download_url: str
    expires_in_hours: int
    message: str

class PdfCalcRequest(BaseModel):
    system_type: Optional[str] = "Теплоснабжение и ГВС (до 95°C)"
    pipe_category: Optional[str] = "Труба напорная PE-RT тип II в ППУ/ПЭ изоляции (ГОСТ Р 56730-2015)"
    diameter: str = "110 мм"
    sdr: str = "SDR 11"
    length_meters: float = Field(..., gt=0)
    whips_12m: Optional[int] = 0
    joints_count: Optional[int] = 0
    weight_tons: Optional[float] = 0.0
    trucks_count: Optional[int] = 1
    client_name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

    model_config = ConfigDict(extra="allow")
