# -------------------------------------------------------------
# VIBEAI – PYDANTIC SCHEMAS
# -------------------------------------------------------------
"""
Pydantic Models für Request/Response Validation
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from pydantic import BaseModel, EmailStr, Field

# -------------------------------------------------------------
# AUTH SCHEMAS
# -------------------------------------------------------------


class UserRole(str, Enum):
    """User Role Enum"""

    USER = "user"
    ADMIN = "admin"
    MODERATOR = "moderator"
    SUSPENDED = "suspended"


class UserCreate(BaseModel):
    """Schema für User-Erstellung"""

    email: EmailStr
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8)


class UserLogin(BaseModel):
    """Schema für User-Login"""

    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema für User-Response"""

    id: int
    email: str
    username: str
    role: str
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema für JWT Token"""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Schema für Token Payload"""

    user_id: Optional[int] = None
    email: Optional[str] = None


# -------------------------------------------------------------
# EXPORT SCHEMAS
# -------------------------------------------------------------


class ExportFilter(BaseModel):
    """Schema für Export Filter"""

    include_users: bool = True
    include_sessions: bool = True
    include_auth_sessions: bool = False
    include_projects: bool = False
    include_billing: bool = False

    user_id: Optional[int] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    format: str = Field(default="json", pattern="^(json|csv|zip)$")


class ExportResponse(BaseModel):
    """Schema für Export Response"""

    export_date: str
    exported_by: str
    statistics: Dict[str, int]
    data: Dict[str, Any]


# -------------------------------------------------------------
# CHAT SCHEMAS
# -------------------------------------------------------------


class ChatMessage(BaseModel):
    """Schema für Chat Message"""

    role: str = Field(pattern="^(user|assistant|system)$")
    content: str
    timestamp: Optional[datetime] = None


class ChatRequest(BaseModel):
    """Schema für Chat Request"""

    message: str
    agent_type: Optional[str] = "aura"
    session_id: Optional[int] = None
    context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    """Schema für Chat Response"""

    message: str
    agent_type: str
    session_id: int
    timestamp: datetime


# -------------------------------------------------------------
# PROJECT SCHEMAS
# -------------------------------------------------------------


class ProjectCreate(BaseModel):
    """Schema für Project-Erstellung"""

    name: str = Field(min_length=1, max_length=100)
    description: Optional[str] = None
    project_type: str = Field(default="web")
    framework: Optional[str] = None


class ProjectResponse(BaseModel):
    """Schema für Project Response"""

    id: int
    name: str
    description: Optional[str]
    project_type: str
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# -------------------------------------------------------------
# BILLING SCHEMAS
# -------------------------------------------------------------


class UsageRecord(BaseModel):
    """Schema für Usage Tracking"""

    user_id: int
    resource_type: str
    amount: float
    timestamp: datetime


class BillingInfo(BaseModel):
    """Schema für Billing Information"""

    user_id: int
    credits: float
    plan: str
    stripe_customer_id: Optional[str] = None


# -------------------------------------------------------------
# ADMIN SCHEMAS
# -------------------------------------------------------------


class AdminAction(BaseModel):
    """Schema für Admin Actions"""

    action: str
    target_user_id: Optional[int] = None
    reason: Optional[str] = None


class AdminNotificationRequest(BaseModel):
    """Schema für Admin Notification Requests"""

    recipient_email: str
    subject: str
    message: str
    notification_type: str = Field(default="info")
    priority: str = Field(default="normal")


class TicketCreateRequest(BaseModel):
    """Schema für Ticket Creation"""

    subject: str = Field(min_length=1, max_length=200)
    description: str = Field(min_length=1)
    category: Optional[str] = Field(default="support")
    priority: str = Field(default="normal")


class TicketReplyRequest(BaseModel):
    """Schema für Ticket Reply"""

    ticket_id: int
    message: str = Field(min_length=1)
    is_admin_reply: bool = False


class TicketResponse(BaseModel):
    """Schema für Ticket Response"""

    id: int
    user_id: int
    subject: str
    description: str
    status: str
    priority: str
    category: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SystemStats(BaseModel):
    """Schema für System Statistics"""

    total_users: int
    active_users: int
    total_sessions: int
    total_projects: int
    system_health: str
