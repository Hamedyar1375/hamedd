from sqlalchemy import Column, Integer, String, TIMESTAMP, func, DECIMAL, TEXT, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from app.db.base import Base # Assuming Base is in app.db.base
from enum import Enum as PyEnum # For defining Python enums to be used with SQLAlchemy Enum

# Define Python Enum for Transaction Types
class TransactionTypeEnum(PyEnum):
    wallet_top_up = "wallet_top_up"
    usage_charge = "usage_charge" # For when a user's usage is billed
    refund = "refund"
    manual_credit = "manual_credit" # Admin manually adds funds
    manual_debit = "manual_debit"   # Admin manually removes funds
    initial_balance = "initial_balance" # When a reseller is created with an initial balance
    service_fee = "service_fee" # Periodic service fees for the reseller account itself
    # Add other types as needed

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    reseller_id = Column(Integer, ForeignKey("resellers.id", ondelete="CASCADE"), nullable=False, index=True)

    # Use the Enum with SQLAlchemy
    transaction_type = Column(SQLAlchemyEnum(TransactionTypeEnum, name="transaction_type_enum"), nullable=False, index=True)

    amount = Column(DECIMAL(10, 2), nullable=False) # Absolute value; type indicates debit/credit nature

    description = Column(TEXT, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now(), nullable=False, index=True)

    # Optional foreign keys for more context about the transaction
    marzban_user_id = Column(Integer, ForeignKey("marzban_users.id", ondelete="SET NULL"), nullable=True, index=True)
    pricing_plan_id = Column(Integer, ForeignKey("pricing_plans.id", ondelete="SET NULL"), nullable=True)
    # reseller_pricing_id links to the specific pricing agreement if applicable
    reseller_pricing_id = Column(Integer, ForeignKey("reseller_pricings.id", ondelete="SET NULL"), nullable=True)
    payment_receipt_id = Column(Integer, ForeignKey("payment_receipts.id", ondelete="SET NULL"), nullable=True, index=True)

    # Relationships
    reseller = relationship("Reseller", back_populates="transactions")

    # Assuming MarzbanUser model will have a 'transactions' back_populates
    marzban_user = relationship("MarzbanUser", back_populates="transactions")
    
    pricing_plan = relationship("PricingPlan") # This implies a one-way link or back_populates is elsewhere
    reseller_pricing = relationship("ResellerPricing") # Similar
    
    # This defines the 'payment_receipt' attribute on the Transaction model
    payment_receipt = relationship("PaymentReceipt", back_populates="transaction")

    # Stores the reseller's wallet balance *after* this transaction was applied. Useful for auditing.
    balance_after_transaction = Column(DECIMAL(10, 2), nullable=True)

# Ensure related models have their back_populates correctly defined:
# In Reseller (models/reseller.py):
#   transactions = relationship("Transaction", back_populates="reseller", order_by="Transaction.created_at.desc()")
# In MarzbanUser (models/marzban_user.py):
#   transactions = relationship("Transaction", back_populates="marzban_user")
# In PaymentReceipt (models/payment_receipt.py):
#   transaction = relationship("Transaction", back_populates="payment_receipt", uselist=False)
