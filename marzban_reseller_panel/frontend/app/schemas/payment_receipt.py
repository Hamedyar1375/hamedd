from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime

class PaymentReceiptBase(BaseModel):
    reseller_id: int
    amount: float = Field(..., gt=0)
    payment_method: str = Field(..., min_length=1, max_length=50)
    transaction_id: Optional[str] = Field(None, max_length=255)
    status: str = Field("pending", max_length=50) # Default status
    notes: Optional[str] = None

class PaymentReceiptCreate(PaymentReceiptBase):
    # Could have reseller-specific creation fields if needed
    pass

class PaymentReceiptUpdateAdmin(BaseModel):
    status: Optional[str] = Field(None, max_length=50)
    notes: Optional[str] = None
    # Admin might update other fields like transaction_id if it was missing
    transaction_id: Optional[str] = Field(None, max_length=255)
    amount: Optional[float] = Field(None, gt=0)
    payment_method: Optional[str] = Field(None, min_length=1, max_length=50)


class PaymentReceiptRead(PaymentReceiptBase):
    id: int
    created_at: datetime
    updated_at: datetime
    # Potentially include reseller info
    # reseller: Optional[ResellerRead] = None # Assuming ResellerRead exists

    class Config:
        from_attributes = True
