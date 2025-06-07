from typing import Optional
from pydantic import BaseModel, Field

class ResellerPricingBase(BaseModel):
    reseller_id: int
    marzban_panel_id: Optional[int] = None # Nullable for generic pricing
    pricing_plan_id: int
    custom_price: Optional[float] = Field(None, gt=0) # Must be positive if set
    is_active: bool = True

class ResellerPricingCreate(ResellerPricingBase):
    pass

class ResellerPricingUpdate(BaseModel):
    reseller_id: Optional[int] = None
    marzban_panel_id: Optional[int] = None # Allow setting to None explicitly
    pricing_plan_id: Optional[int] = None
    custom_price: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None

class ResellerPricingRead(ResellerPricingBase):
    id: int
    # Potential relationship fields to load, e.g., pricing plan details
    # pricing_plan: Optional[PricingPlanRead] = None # Assuming PricingPlanRead is available

    class Config:
        from_attributes = True
        # Pydantic V2 uses from_attributes instead of orm_mode
