from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base_class import Base # Assuming Base is defined in base_class

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    reseller_id = Column(Integer, ForeignKey("resellers.id"), nullable=False, index=True)
    transaction_type = Column(String(50), nullable=False, index=True) # E.g., 'purchase', 'top_up', 'refund'
    amount = Column(Numeric(10, 2), nullable=False)

    marzban_user_id = Column(Integer, ForeignKey("marzban_users.id"), nullable=True, index=True)
    pricing_plan_id = Column(Integer, ForeignKey("pricing_plans.id"), nullable=True, index=True)
    # Assuming reseller_pricings table name for ResellerPricing model
    reseller_pricing_id = Column(Integer, ForeignKey("reseller_pricings.id"), nullable=True, index=True)
    payment_receipt_id = Column(Integer, ForeignKey("payment_receipts.id"), nullable=True, index=True)

    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    reseller = relationship("Reseller", back_populates="transactions")
    marzban_user = relationship("MarzbanUser", back_populates="transactions")
    pricing_plan = relationship("PricingPlan") # Define back_populates in PricingPlan if needed
    reseller_pricing = relationship("ResellerPricing") # Define back_populates in ResellerPricing if needed
    payment_receipt = relationship("PaymentReceipt", back_populates="transaction") # Assuming one-to-one from receipt side

    # Add __repr__ for debugging if desired
    def __repr__(self):
        return f"<Transaction(id={self.id}, type='{self.transaction_type}', amount={self.amount})>"

# Now, other models (Reseller, MarzbanUser, PaymentReceipt) need to have the 'transactions'
# or 'transaction' back_populates field defined for these relationships to work seamlessly.
# For PricingPlan and ResellerPricing, if they are primarily lookup tables, back_populates might not be strictly necessary
# unless you often query from Plan -> Transactions.
# This subtask is focused on fixing the Transaction model and its imports.
# I'll assume app.db.base_class.Base exists as is common in FastAPI projects.
# If not, that would be another error to fix later.
