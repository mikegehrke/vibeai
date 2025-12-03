"""
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   VIBEAI BILLING DATABASE MODELS - PRODUCTION COMPLETE                      ║
║                                                                              ║
║   Features:                                                                  ║
║   ✅ SQLAlchemy Database Models                                             ║
║   ✅ Pydantic Response/Request Models                                       ║
║   ✅ Billing Records (per API call tracking)                                ║
║   ✅ Subscriptions (tier management)                                        ║
║   ✅ User Credits (balance tracking)                                        ║
║   ✅ Referral Bonuses                                                       ║
║   ✅ Billing Audit Log                                                      ║
║   ✅ Transaction History                                                    ║
║   ✅ Stripe/PayPal Integration Fields                                       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
"""

from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean, Text, ForeignKey, Index
from sqlalchemy.orm import declarative_base, relationship
import uuid

Base = declarative_base()


# ============================================================================
# SQLALCHEMY DATABASE MODELS
# ============================================================================

class BillingRecordDB(Base):
    """
    Tracks every AI API call with cost and token usage.
    Used for analytics and user billing breakdown.
    """
    __tablename__ = "billing_records"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, nullable=False)
    
    # Model & Provider Info
    model = Column(String, nullable=False)           # gpt-5, claude-4, gemini-2.0, etc.
    provider = Column(String, nullable=False)        # openai, anthropic, google, github, ollama
    
    # Usage Metrics
    tokens_input = Column(Integer, default=0)
    tokens_output = Column(Integer, default=0)
    tokens_total = Column(Integer, default=0)
    
    # Cost (in USD)
    cost_input = Column(Float, default=0.0)
    cost_output = Column(Float, default=0.0)
    cost_total = Column(Float, default=0.0)
    
    # Request Details
    request_type = Column(String)                    # chat, completion, builder, vision, code
    session_id = Column(String, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    user_agent = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    
    # Indexes for fast queries
    __table_args__ = (
        Index('idx_user_created', 'user_id', 'created_at'),
        Index('idx_provider_model', 'provider', 'model'),
    )


class SubscriptionDB(Base):
    """
    Manages user subscription tiers.
    Supports: Free, Pro, Ultra, Enterprise
    """
    __tablename__ = "subscriptions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, unique=True, index=True, nullable=False)
    
    # Tier Info
    tier = Column(String, default="free")            # free, pro, ultra, enterprise
    is_active = Column(Boolean, default=True)
    auto_renew = Column(Boolean, default=True)
    
    # Payment Provider
    payment_provider = Column(String, nullable=True)  # stripe, paypal, manual
    external_subscription_id = Column(String, nullable=True)  # Stripe subscription ID
    
    # Dates
    started_at = Column(DateTime, default=datetime.utcnow)
    renewal_date = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    cancelled_at = Column(DateTime, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class UserCreditsDB(Base):
    """
    Tracks user credit balance.
    Credits can be used for API calls, builder, etc.
    """
    __tablename__ = "user_credits"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, unique=True, index=True, nullable=False)
    
    # Balance
    credits_usd = Column(Float, default=0.0)         # Current balance in USD
    credits_earned = Column(Float, default=0.0)      # Total earned (referrals, etc.)
    credits_purchased = Column(Float, default=0.0)   # Total purchased
    credits_spent = Column(Float, default=0.0)       # Total spent
    
    # Limits
    is_unlimited = Column(Boolean, default=False)    # Enterprise users
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ReferralBonusDB(Base):
    """
    Tracks referral codes and bonuses.
    """
    __tablename__ = "referral_bonuses"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    
    # Referral Relationship
    inviter_user_id = Column(String, index=True, nullable=False)  # Who invited
    invitee_user_id = Column(String, nullable=True)               # Who was invited
    
    # Invite Code
    invite_code = Column(String, unique=True, index=True, nullable=False)
    
    # Rewards
    inviter_bonus_credits = Column(Float, default=0.0)
    inviter_bonus_tokens = Column(Integer, default=0)
    invitee_bonus_credits = Column(Float, default=0.0)
    invitee_bonus_tokens = Column(Integer, default=0)
    
    # Status
    status = Column(String, default="pending")       # pending, redeemed, expired
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    redeemed_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)


class BillingAuditLogDB(Base):
    """
    Audit log for all billing events.
    """
    __tablename__ = "billing_audit_log"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, nullable=False)
    
    # Event
    event_type = Column(String, nullable=False)      # subscription_created, payment_success, etc.
    event_data = Column(Text, nullable=True)         # JSON data
    
    # Payment Details
    amount_usd = Column(Float, nullable=True)
    payment_provider = Column(String, nullable=True)
    transaction_id = Column(String, nullable=True)
    
    # Status
    status = Column(String, default="success")       # success, failed, pending
    error_message = Column(Text, nullable=True)
    
    # Metadata
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class TransactionHistoryDB(Base):
    """
    Complete transaction history for payments.
    """
    __tablename__ = "transaction_history"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, index=True, nullable=False)
    
    # Transaction Type
    transaction_type = Column(String, nullable=False)  # purchase, refund, bonus, deduction
    
    # Amount
    amount_usd = Column(Float, nullable=False)
    currency = Column(String, default="USD")
    
    # Payment Provider
    payment_provider = Column(String, nullable=True)   # stripe, paypal, manual
    payment_method = Column(String, nullable=True)     # card, paypal, bank_transfer
    external_transaction_id = Column(String, nullable=True)
    
    # Description
    description = Column(Text, nullable=True)
    
    # Status
    status = Column(String, default="completed")      # completed, pending, failed, refunded
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    completed_at = Column(DateTime, nullable=True)


# ============================================================================
# PYDANTIC REQUEST MODELS
# ============================================================================

class BillingRecordCreate(BaseModel):
    """Request model for creating billing record"""
    user_id: str
    model: str
    provider: str
    tokens_input: int = 0
    tokens_output: int = 0
    cost_input: float = 0.0
    cost_output: float = 0.0
    request_type: Optional[str] = None
    session_id: Optional[str] = None


class SubscriptionCreate(BaseModel):
    """Request model for creating subscription"""
    user_id: str
    tier: str
    payment_provider: Optional[str] = None
    auto_renew: bool = True
    
    @validator('tier')
    def validate_tier(cls, v):
        allowed = ["free", "pro", "ultra", "enterprise"]
        if v not in allowed:
            raise ValueError(f"Tier must be one of: {allowed}")
        return v


class CreditsAddRequest(BaseModel):
    """Request to add credits"""
    amount_usd: float = Field(..., gt=0)
    transaction_type: str = "purchase"  # purchase, bonus, manual
    description: Optional[str] = None


class CreditsPurchaseRequest(BaseModel):
    """Request to purchase credits"""
    amount_usd: float = Field(..., gt=0, le=1000)  # Max $1000 per transaction
    payment_method: str  # stripe, paypal


# ============================================================================
# PYDANTIC RESPONSE MODELS
# ============================================================================

class BillingRecordResponse(BaseModel):
    """API response for billing record"""
    id: str
    user_id: str
    model: str
    provider: str
    tokens_total: int
    cost_total: float
    request_type: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    """API response for subscription"""
    id: str
    user_id: str
    tier: str
    is_active: bool
    auto_renew: bool
    payment_provider: Optional[str]
    renewal_date: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserCreditsResponse(BaseModel):
    """API response for user credits"""
    id: str
    user_id: str
    credits_usd: float
    credits_earned: float
    credits_purchased: float
    credits_spent: float
    is_unlimited: bool
    
    class Config:
        from_attributes = True


class ReferralBonusResponse(BaseModel):
    """API response for referral bonus"""
    id: str
    invite_code: str
    inviter_user_id: str
    invitee_user_id: Optional[str]
    status: str
    inviter_bonus_credits: float
    invitee_bonus_credits: float
    created_at: datetime
    redeemed_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    """API response for transaction"""
    id: str
    user_id: str
    transaction_type: str
    amount_usd: float
    payment_provider: Optional[str]
    description: Optional[str]
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class BillingStatsResponse(BaseModel):
    """Billing statistics for user dashboard"""
    total_spent: float
    total_tokens: int
    total_requests: int
    current_month_spent: float
    current_month_tokens: int
    current_tier: str
    credits_balance: float
    top_models: List[dict]
    recent_transactions: List[TransactionResponse]


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def create_billing_record(
    db,
    user_id: str,
    model: str,
    provider: str,
    tokens_input: int,
    tokens_output: int,
    cost_input: float,
    cost_output: float,
    request_type: Optional[str] = None,
    session_id: Optional[str] = None
) -> BillingRecordDB:
    """Helper to create billing record"""
    record = BillingRecordDB(
        user_id=user_id,
        model=model,
        provider=provider,
        tokens_input=tokens_input,
        tokens_output=tokens_output,
        tokens_total=tokens_input + tokens_output,
        cost_input=cost_input,
        cost_output=cost_output,
        cost_total=cost_input + cost_output,
        request_type=request_type,
        session_id=session_id
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_or_create_credits(db, user_id: str) -> UserCreditsDB:
    """Get or create user credits record"""
    credits = db.query(UserCreditsDB).filter(
        UserCreditsDB.user_id == user_id
    ).first()
    
    if not credits:
        credits = UserCreditsDB(user_id=user_id)
        db.add(credits)
        db.commit()
        db.refresh(credits)
    
    return credits


def add_credits(
    db,
    user_id: str,
    amount_usd: float,
    transaction_type: str = "purchase",
    description: Optional[str] = None
):
    """Add credits to user account"""
    credits = get_or_create_credits(db, user_id)
    
    credits.credits_usd += amount_usd
    
    if transaction_type == "purchase":
        credits.credits_purchased += amount_usd
    elif transaction_type in ["bonus", "referral"]:
        credits.credits_earned += amount_usd
    
    db.commit()
    
    # Create transaction record
    transaction = TransactionHistoryDB(
        user_id=user_id,
        transaction_type=transaction_type,
        amount_usd=amount_usd,
        description=description,
        status="completed",
        completed_at=datetime.utcnow()
    )
    db.add(transaction)
    db.commit()
    
    return credits


def deduct_credits(
    db,
    user_id: str,
    amount_usd: float,
    description: Optional[str] = None
):
    """Deduct credits from user account"""
    credits = get_or_create_credits(db, user_id)
    
    if credits.credits_usd < amount_usd:
        raise ValueError("Insufficient credits")
    
    credits.credits_usd -= amount_usd
    credits.credits_spent += amount_usd
    db.commit()
    
    # Create transaction record
    transaction = TransactionHistoryDB(
        user_id=user_id,
        transaction_type="deduction",
        amount_usd=-amount_usd,
        description=description,
        status="completed",
        completed_at=datetime.utcnow()
    )
    db.add(transaction)
    db.commit()
    
    return credits
