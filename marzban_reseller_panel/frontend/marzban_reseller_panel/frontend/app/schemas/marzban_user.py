from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class MarzbanUserBase(BaseModel):
    username: str

class MarzbanUserCreate(MarzbanUserBase):
    # Fields required by Marzban API for user creation
    proxies: Dict[str, Dict] = Field(default_factory=lambda: {"vmess": {}})
    expire: Optional[int] = None # Days from now, or timestamp
    data_limit: Optional[int] = None # Bytes
    # Add other fields as per Marzban API spec
    inbounds: Optional[Dict[str, List[str]]] = None


class MarzbanUserUpdate(BaseModel):
    # Fields that can be updated via Marzban API
    proxies: Optional[Dict[str, Dict]] = None
    expire: Optional[int] = None
    data_limit: Optional[int] = None
    status: Optional[str] = None # active, disabled, etc.
    # Add other updatable fields
    inbounds: Optional[Dict[str, List[str]]] = None


class MarzbanUserRead(MarzbanUserBase):
    # Fields returned by Marzban API when fetching a user
    status: Optional[str] = None
    used_traffic: Optional[int] = 0
    data_limit: Optional[int] = 0
    expire: Optional[int] = 0
    created_at: Optional[datetime] = None
    online_at: Optional[datetime] = None
    # subscription_url: Optional[str] = None # This is often constructed
    # proxies: Optional[Dict] = None
    # inbounds: Optional[Dict] = None
    # Add all relevant fields

    class Config:
        from_attributes = True

class MarzbanUserResponse(BaseModel):
    username: str
    status: Optional[str] = None
    used_traffic: int
    data_limit: int
    expire: int
    # online_at: Optional[datetime]
    # created_at: datetime
    subscription_url: str
    proxies: Dict
    inbounds: Optional[Dict[str, List[str]]] = None
