from pydantic import BaseModel, HttpUrl
from typing import Optional
from datetime import datetime

class MarzbanPanelBase(BaseModel):
    name: str
    api_url: HttpUrl
    admin_username: str

class MarzbanPanelCreate(MarzbanPanelBase):
    admin_password: str

class MarzbanPanelUpdate(BaseModel):
    name: Optional[str] = None
    api_url: Optional[HttpUrl] = None
    admin_username: Optional[str] = None
    admin_password: Optional[str] = None

class MarzbanPanelRead(MarzbanPanelBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MarzbanPanelLogin(BaseModel):
    username: Optional[str] = None
    password: Optional[str] = None

class MarzbanPanelLoginTestResponse(BaseModel):
    success: bool
    message: Optional[str] = None
