from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime # Assuming expire might be a datetime

class MarzbanUserBase(BaseModel):
    username: str = Field(..., min_length=1)
    # These fields are typically what Marzban API might return for a user
    status: Optional[str] = None # e.g., "active", "disabled", "expired", "limited"
    data_limit: Optional[float] = Field(None, ge=0) # Data limit in GB
    expire: Optional[datetime] = None # Expiration timestamp
    used_traffic: Optional[float] = Field(None, ge=0) # Used traffic in GB
    # online_at: Optional[datetime] = None # Last online time
    # created_at: Optional[datetime] = None # User creation time on panel

    # Custom fields for reseller panel context, if any
    # For now, assuming it mirrors Marzban panel user details primarily.

class MarzbanUserCreate(MarzbanUserBase):
    # Fields required to create a user on Marzban via API
    # Often just username, data_limit, expire, etc.
    # This schema might not be used if users are only read.
    pass

class MarzbanUserUpdate(BaseModel):
    # Fields that can be updated on Marzban via API
    username: Optional[str] = Field(None, min_length=1)
    status: Optional[str] = None
    data_limit: Optional[float] = Field(None, ge=0)
    expire: Optional[datetime] = None
    # Other modifiable fields like proxies, inbound/outbound settings etc.
    # For now, keeping it aligned with Base.

class MarzbanUserRead(MarzbanUserBase):
    # 'id' might not exist for a Marzban user if identified by username.
    # If there's a local DB representation, it would have an id.
    # For now, assuming username is the key identifier from Marzban panel.
    # No 'id: int' here unless it's a local DB surrogate key.
    # The model 'MarzbanUser' in db/models has an id, panel_user_id, and reseller_id.
    # So MarzbanUserRead should probably reflect the DB model more closely for internal use.
    id: int # Local database ID for the MarzbanUser record
    reseller_id: int
    marzban_panel_id: int
    panel_user_id: Optional[int] = None # ID from the Marzban panel itself, if available & stored

    # Including fields from MarzbanUserBase via inheritance

    class Config:
        from_attributes = True

class ResellerMarzbanUserUpdateRequest(BaseModel):
    # Fields a reseller is allowed to update for a Marzban user they manage.
    # This might be a subset of MarzbanUserUpdate or have specific logic.
    # For now, let's assume they can update similar fields, but this needs review.
    username: Optional[str] = Field(None, min_length=1) # Might be unchangeable by reseller
    status: Optional[str] = None # e.g., active, disabled
    data_limit: Optional[float] = Field(None, ge=0) # Data limit in GB
    expire: Optional[datetime] = None # Expiration timestamp
    # Resellers might not be able to change 'proxies' or 'inbounds' directly.
    # Those are typically admin-level or template-based.

class ResellerMarzbanUserCreateRequest(BaseModel):
    # Fields a reseller provides to create a new Marzban user.
    username: str = Field(..., min_length=1, max_length=50)
    # data_limit and expire could come from an assigned pricing plan,
    # or be set directly by the reseller if allowed.
    # For simplicity, let's assume they can be optionally specified here,
    # potentially overriding or supplementing a selected plan.
    data_limit_gb: Optional[float] = Field(None, ge=0) # Data limit in GB
    duration_days: Optional[int] = Field(None, gt=0) # Duration in days for the user to be active

    # A reseller might assign a user to a specific pricing plan they offer
    reseller_pricing_id: Optional[int] = None
    # Or directly to a base pricing plan if the structure allows
    # pricing_plan_id: Optional[int] = None

    # Any other initial settings a reseller can define
    # status: Optional[str] = "active" # Usually active by default on creation
