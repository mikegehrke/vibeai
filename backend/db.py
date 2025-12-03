# -------------------------------------------------------------
# VIBEAI – DATABASE LAYER
# -------------------------------------------------------------
# ❗ ORIGINAL: Datei war vollständig leer
#
# 🧠 ANALYSE – Was wird benötigt:
# - SQLAlchemy Setup für SQLite (Dev) + PostgreSQL (Prod)
# - Session Management
# - Database Initialization
# - Connection Pooling
# - Migration Support
# - Context Manager für Sessions
# - Async Support (optional)
#
# Kompatibel mit:
# - User Management (auth.py)
# - Billing System (billing/)
# - Sessions (sessions.py)
# - Models (models.py)
# - 280+ Module Ecosystem
# -------------------------------------------------------------

import os
import enum
from datetime import datetime
from sqlalchemy import (
    create_engine, Column, Integer, String, Boolean,
    DateTime, ForeignKey, Text, Float, Enum as SQLEnum, text
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, scoped_session, relationship
from contextlib import contextmanager

# Database URL aus Environment (SQLite default, PostgreSQL in Produktion)
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./vibeai.db"  # Default: SQLite für Development
)

# Engine erstellen
# SQLite braucht check_same_thread=False für FastAPI
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Test connections before using
    echo=False  # Set True for SQL debugging
)

# Session Factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Scoped Session für Thread-Safety
ScopedSession = scoped_session(SessionLocal)

# Base für Models
Base = declarative_base()


# -------------------------------------------------------------
# DATABASE MODELS
# -------------------------------------------------------------


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUSPENDED = "suspended"


class PlanType(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.USER)
    plan = Column(SQLEnum(PlanType), default=PlanType.FREE)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Billing
    stripe_customer_id = Column(String, nullable=True)
    stripe_subscription_id = Column(String, nullable=True)
    referral_code = Column(String, unique=True, nullable=True)
    referred_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    credits = Column(Float, default=0.0)

    # 2FA
    totp_secret = Column(String, nullable=True)
    is_2fa_enabled = Column(Boolean, default=False)

    # Relationships
    sessions = relationship("ChatSession", back_populates="user")


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, default="New Chat")
    agent_type = Column(String, default="aura")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    user = relationship("User", back_populates="sessions")
    messages = relationship("Message", back_populates="session")


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(
        Integer,
        ForeignKey("chat_sessions.id"),
        nullable=False
    )
    role = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    model_used = Column(String, nullable=True)
    tokens_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")


class Session(Base):
    """User Session für Auth"""
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)


class AuditLog(Base):
    """Audit Trail für Security"""
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# -------------------------------------------------------------
# DATABASE INITIALIZATION
# -------------------------------------------------------------

def init_db():
    """
    Initialisiert die Datenbank.
    Erstellt alle Tabellen basierend auf SQLAlchemy Models.
    """
    # Import aller Models (damit sie registriert werden)
    try:
        import models  # noqa
        from billing.models import BillingRecordDB, SubscriptionDB  # noqa
    except ImportError as e:
        print(f"[DB] Warning: Could not import all models: {e}")
    
    # Tabellen erstellen
    Base.metadata.create_all(bind=engine)
    print("[DB] Database initialized successfully")


def drop_all_tables():
    """
    Löscht alle Tabellen (nur für Development/Testing!).
    """
    Base.metadata.drop_all(bind=engine)
    print("[DB] All tables dropped")


def reset_db():
    """
    Reset: Löscht und erstellt alle Tabellen neu.
    """
    drop_all_tables()
    init_db()
    print("[DB] Database reset complete")


# -------------------------------------------------------------
# SESSION MANAGEMENT
# -------------------------------------------------------------

def get_db():
    """
    Dependency für FastAPI Routes.
    Liefert DB-Session und schließt sie automatisch nach Request.
    
    Usage in FastAPI:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context Manager für manuelle DB-Operationen.
    
    Usage:
        with get_db_context() as db:
            user = db.query(User).first()
    """
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_scoped_session():
    """
    Liefert Thread-safe Scoped Session.
    Nützlich für Multi-Threading oder Background Tasks.
    """
    return ScopedSession()


# -------------------------------------------------------------
# DATABASE UTILITIES
# -------------------------------------------------------------

def check_db_connection():
    """
    Prüft ob Datenbankverbindung funktioniert.
    Returns: True wenn OK, False bei Fehler
    """
    try:
        with get_db_context() as db:
            db.execute(text("SELECT 1"))
        return True
    except Exception as e:
        print(f"[DB] Connection check failed: {e}")
        return False


def get_db_info():
    """
    Liefert Informationen über die Datenbank.
    """
    return {
        "database_url": DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else DATABASE_URL,
        "engine_type": engine.dialect.name,
        "pool_size": engine.pool.size() if hasattr(engine.pool, 'size') else None,
        "tables": list(Base.metadata.tables.keys())
    }


# -------------------------------------------------------------
# MIGRATION HELPERS
# -------------------------------------------------------------

def migrate_add_column(table_name: str, column_sql: str):
    """
    Fügt eine Spalte zu einer Tabelle hinzu (für einfache Migrations).
    
    Example:
        migrate_add_column("users", "is_premium BOOLEAN DEFAULT FALSE")
    
    Note: Für komplexe Migrations nutze Alembic!
    """
    try:
        with get_db_context() as db:
            if DATABASE_URL.startswith("sqlite"):
                db.execute(text(
                    f"ALTER TABLE {table_name} ADD COLUMN {column_sql}"
                ))
            else:
                # PostgreSQL
                db.execute(text(
                    f"ALTER TABLE {table_name} "
                    f"ADD COLUMN IF NOT EXISTS {column_sql}"
                ))
        print(f"[DB] Migration: Added column to {table_name}")
    except Exception as e:
        print(f"[DB] Migration failed: {e}")


# -------------------------------------------------------------
# AUTO-INITIALIZATION
# -------------------------------------------------------------

# Bei Import automatisch Datenbank initialisieren
try:
    if not os.path.exists("vibeai.db") and DATABASE_URL.startswith("sqlite"):
        print("[DB] First run - initializing database...")
        init_db()
except Exception as e:
    print(f"[DB] Auto-init failed: {e}")
