from pydantic import BaseModel
from datetime import datetime

class AdminBase(BaseModel):
    username: str

class AdminRead(AdminBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AdminCreate(AdminBase):
    password: str
