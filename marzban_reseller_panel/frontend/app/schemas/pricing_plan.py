from typing import Optional
from pydantic import BaseModel, Field

class PricingPlanBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)  # Price must be positive
    data_limit_gb: Optional[int] = Field(None, ge=0) # Data limit in GB, optional, non-negative
    duration_days: int = Field(..., gt=0) # Duration in days, must be positive
    is_active: bool = True

class PricingPlanCreate(PricingPlanBase):
    pass

class PricingPlanUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    price: Optional[float] = Field(None, gt=0)
    data_limit_gb: Optional[int] = Field(None, ge=0)
    duration_days: Optional[int] = Field(None, gt=0)
    is_active: Optional[bool] = None

class PricingPlanRead(PricingPlanBase):
    id: int

    class Config:
        from_attributes = True

# If Pydantic v1 is used by the project, orm_mode = True is correct.
# If Pydantic v2 is used, from_attributes = True is the new way.
# The requirements.txt showed:
# pydantic[email]==2.11.5
# pydantic-settings==2.9.1
# So, from_attributes = True should be used. I'll correct this in the file.
