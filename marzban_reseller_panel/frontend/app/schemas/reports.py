from pydantic import BaseModel
from datetime import date
from typing import List, Optional # Added Optional

class SalesSummary(BaseModel):
    total_sales: float
    total_transactions: int
    # Add other summary fields as needed, e.g.,
    # average_transaction_value: Optional[float] = None
    # total_refunds: Optional[float] = None
    # net_sales: Optional[float] = None
    start_date: date
    end_date: date
    reseller_id: Optional[int] = None # If the summary is filtered by reseller

    class Config:
        from_attributes = True

class DailySale(BaseModel):
    sale_date: date
    total_amount: float
    transaction_count: int

    class Config:
        from_attributes = True

class MonthlySale(BaseModel):
    year: int
    month: int
    total_amount: float
    transaction_count: int

    class Config:
        from_attributes = True
