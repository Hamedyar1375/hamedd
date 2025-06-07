from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class ResellerBase(BaseModel):
    username: str
    marzban_admin_id: int
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    allow_negative_balance: Optional[bool] = False
    wallet_balance: Optional[Decimal] = Decimal("0.00")

class ResellerCreate(ResellerBase):
    password: str

class ResellerUpdate(BaseModel):
    username: Optional[str] = None
    marzban_admin_id: Optional[int] = None
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    allow_negative_balance: Optional[bool] = None
    wallet_balance: Optional[Decimal] = None

class ResellerRead(ResellerBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResellerPanelAccessRequest(BaseModel):
    marzban_panel_ids: List[int]

class ResellerPasswordUpdate(BaseModel):
    current_password: str
    new_password: str
