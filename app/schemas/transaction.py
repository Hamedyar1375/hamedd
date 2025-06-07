from pydantic import BaseModel, condecimal
from typing import Optional, Text
from datetime import datetime

# Assuming these schemas are correctly defined and importable
from app.schemas.reseller import ResellerRead
from app.schemas.pricing_plan import PricingPlanRead
from app.schemas.payment_receipt import PaymentReceiptRead
from app.schemas.marzban_user import MarzbanUserRead
# from app.schemas.reseller_pricing import ResellerPricingRead # This was commented out, keep as is

class TransactionBase(BaseModel):
    reseller_id: int
    transaction_type: str # E.g., 'panel_user_purchase', 'wallet_top_up', 'refund'
    amount: condecimal(decimal_places=2)
    marzban_user_id: Optional[int] = None
    pricing_plan_id: Optional[int] = None
    reseller_pricing_id: Optional[int] = None
    description: Optional[Text] = None
    payment_receipt_id: Optional[int] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: int
    created_at: datetime

    # Nested read schemas
    reseller: Optional[ResellerRead] = None
    pricing_plan: Optional[PricingPlanRead] = None
    # reseller_pricing: Optional[ResellerPricingRead] = None
    payment_receipt: Optional[PaymentReceiptRead] = None
    marzban_user: Optional[MarzbanUserRead] = None

    class Config:
        from_attributes = True
