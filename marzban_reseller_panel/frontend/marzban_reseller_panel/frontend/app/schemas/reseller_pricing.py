from pydantic import BaseModel
from typing import Optional

class ResellerPricingBase(BaseModel):
    reseller_id: int
    pricing_plan_id: int
    custom_price: Optional[float] = None # If null, uses plan's default price

class ResellerPricingCreate(ResellerPricingBase):
    pass

class ResellerPricingRead(ResellerPricingBase):
    id: int
    # Potentially include more details from related objects if needed for responses
    # e.g., plan_name: str (would require a join or separate query in service)

    class Config:
        from_attributes = True
