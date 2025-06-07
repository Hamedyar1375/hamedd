from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class PaymentReceiptBase(BaseModel):
    reseller_id: int
    amount: float
    payment_method: Optional[str] = "Unknown"
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class PaymentReceiptCreate(PaymentReceiptBase):
    pass

class PaymentReceiptUpdate(BaseModel):
    status: Optional[str] = None # e.g., 'pending', 'approved', 'rejected'
    notes: Optional[str] = None

class PaymentReceiptRead(PaymentReceiptBase):
    id: int
    receipt_date: datetime
    status: str # e.g., 'pending', 'approved', 'rejected'

    class Config:
        from_attributes = True
