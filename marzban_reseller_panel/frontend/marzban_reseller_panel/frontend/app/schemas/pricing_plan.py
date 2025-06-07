from pydantic import BaseModel
from typing import Optional

class PricingPlanBase(BaseModel):
    name: str
    price: float # Monthly price
    data_limit_gb: int # Data limit in GB
    duration_days: int # Duration of the plan in days
    description: Optional[str] = None

class PricingPlanCreate(PricingPlanBase):
    pass

class PricingPlanUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    data_limit_gb: Optional[int] = None
    duration_days: Optional[int] = None
    description: Optional[str] = None

class PricingPlanRead(PricingPlanBase):
    id: int

    class Config:
        from_attributes = True
