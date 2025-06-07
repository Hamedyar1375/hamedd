from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TransactionBase(BaseModel):
    reseller_id: int
    amount: float
    transaction_type: str # e.g., 'credit', 'debit', 'usage_charge', 'refund'
    description: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionRead(TransactionBase):
    id: int
    transaction_date: datetime
    current_balance_after_transaction: Optional[float] = None # This might be calculated or stored

    class Config:
        from_attributes = True # Changed from orm_mode for Pydantic v2
