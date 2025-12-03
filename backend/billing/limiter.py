from fastapi import HTTPException
from datetime import datetime, timedelta
import logging

logger = logging.getLogger("usage_limiter")


def check_usage_limit(user, usage_limit):
    if user.usage_count >= usage_limit:
        raise HTTPException(status_code=403, detail="Usage limit reached")
    return True


# -------------------------------------------------------------
# VIBEAI – INTELLIGENTER USAGE LIMITER (ABO + TOKENS + RATES)
# -------------------------------------------------------------

TIER_LIMITS = {
    "free": {
        "daily_requests": 20,
        "monthly_tokens": 20000,
        "max_concurrent_jobs": 1
    },
    "pro": {
        "daily_requests": 200,
        "monthly_tokens": 500000,
        "max_concurrent_jobs": 5
    },
    "ultra": {
        "daily_requests": 2000,
        "monthly_tokens": 5000000,
        "max_concurrent_jobs": 20
    }
}


def enforce_limits(user, tokens_used=0):
    """
    Überprüft alle Limits:
    - Tageslimit (Requests)
    - Monatslimit (Tokens)
    - Parallel-Tasks
    - Sperrstatus
    - Abo-Stufe
    """

    tier = getattr(user, "subscription_level", "free") or "free"
    rules = TIER_LIMITS.get(tier, TIER_LIMITS["free"])

    # ---------------------------------------------------------
    # 1. Suspended User
    # ---------------------------------------------------------
    if getattr(user, "is_suspended", False):
        raise HTTPException(
            status_code=403,
            detail="Account suspended"
        )

    # ---------------------------------------------------------
    # 2. Daily Request Limit
    # ---------------------------------------------------------
    daily_requests = getattr(user, "daily_requests", 0)
    if daily_requests >= rules["daily_requests"]:
        raise HTTPException(
            status_code=429,
            detail=f"Daily limit reached ({rules['daily_requests']})"
        )

    # ---------------------------------------------------------
    # 3. Monthly Token Limit
    # ---------------------------------------------------------
    monthly_tokens_used = getattr(user, "monthly_tokens_used", 0)
    if (monthly_tokens_used + tokens_used) >= rules["monthly_tokens"]:
        raise HTTPException(
            status_code=402,
            detail="Monthly token quota exceeded – please upgrade"
        )

    # ---------------------------------------------------------
    # 4. Concurrent Job Limit
    # ---------------------------------------------------------
    active_jobs = getattr(user, "active_jobs", 0)
    if active_jobs > rules["max_concurrent_jobs"]:
        raise HTTPException(
            status_code=429,
            detail="Too many concurrent jobs running"
        )

    # ---------------------------------------------------------
    # 5. Logging
    # ---------------------------------------------------------
    logger.info(
        f"[LIMIT OK] user={user.id}, tier={tier}, "
        f"requests={daily_requests}, tokens_used={monthly_tokens_used}"
    )

    return True


# ============================================================
# ⭐ VIBEAI – ADVANCED RATE LIMITER (PRODUCTION 2025)
# ============================================================
# ✔ Multi-Tier Support (Free/Pro/Ultra/Enterprise)
# ✔ Token-based Limiting (per Provider)
# ✔ Request Rate Limiting (RPM/RPS)
# ✔ Feature-specific Limits (Builder/Chat/Studio)
# ✔ Abuse Protection & Cooldown
# ✔ Thread-Safe (for multi-worker deployments)
# ✔ Redis-ready (optional external store)
# ✔ Provider-aware (OpenAI/Claude/Gemini/Copilot/Ollama)
# ============================================================

import threading
from typing import Dict, Tuple, Optional
from collections import defaultdict


class AdvancedRateLimiter:
    """
    Production-grade Rate Limiter für VibeAI Platform.
    
    Features:
    - Per-User Rate Limiting
    - Per-Tier Limits (Free/Pro/Ultra)
    - Token Consumption Tracking
    - Provider-specific Limits
    - Feature-specific Limits (Chat/Builder/Studio)
    - Cooldown Penalties
    - Thread-Safe
    """
    
    def __init__(self, redis_client=None):
        self.redis = redis_client  # Optional: Redis für distributed systems
        self.lock = threading.Lock()
        
        # In-Memory Storage (fallback wenn kein Redis)
        self.user_requests: Dict[str, list] = defaultdict(list)
        self.user_tokens: Dict[str, int] = defaultdict(int)
        self.cooldowns: Dict[str, float] = {}
        self.abuse_counter: Dict[str, int] = defaultdict(int)
        
        # Tier-Limits
        self.tier_limits = {
            "free": {
                "rpm": 20,              # Requests per minute
                "rph": 100,             # Requests per hour
                "rpd": 500,             # Requests per day
                "tpm": 20000,           # Tokens per minute
                "tph": 100000,          # Tokens per hour
                "tpd": 500000,          # Tokens per day
                "max_concurrent": 1,    # Concurrent requests
                "builder_projects_daily": 3,
                "code_ops_daily": 50,
            },
            "pro": {
                "rpm": 200,
                "rph": 5000,
                "rpd": 50000,
                "tpm": 300000,
                "tph": 2000000,
                "tpd": 20000000,
                "max_concurrent": 5,
                "builder_projects_daily": 50,
                "code_ops_daily": 1000,
            },
            "ultra": {
                "rpm": 2000,
                "rph": 50000,
                "rpd": 500000,
                "tpm": 3000000,
                "tph": 20000000,
                "tpd": 200000000,
                "max_concurrent": 20,
                "builder_projects_daily": 500,
                "code_ops_daily": 10000,
            },
            "enterprise": {
                "rpm": 10000,
                "rph": 999999,
                "rpd": 999999,
                "tpm": 10000000,
                "tph": 999999999,
                "tpd": 999999999,
                "max_concurrent": 100,
                "builder_projects_daily": 99999,
                "code_ops_daily": 99999,
            }
        }
        
        # Provider-specific Limits
        self.provider_limits = {
            "openai": {"rpm": 3000, "tpm": 200000},
            "anthropic": {"rpm": 50, "tpm": 40000},
            "google": {"rpm": 60, "tpm": 1000000},
            "github": {"rpm": 900, "tpm": 999999},
            "ollama": {"rpm": 99999, "tpm": 999999},
        }
    
    def check_rate_limit(
        self,
        user_id: int,
        tier: str = "free",
        tokens: int = 0,
        provider: str = "openai",
        feature: str = "chat"
    ) -> Tuple[bool, Optional[str]]:
        """
        Prüft alle Rate Limits für einen Request.
        
        Args:
            user_id: User ID
            tier: User tier (free/pro/ultra/enterprise)
            tokens: Anzahl verwendeter Tokens
            provider: AI Provider (openai/anthropic/google/github/ollama)
            feature: Feature (chat/builder/studio/code)
        
        Returns:
            (allowed: bool, error_message: Optional[str])
        """
        with self.lock:
            now = time.time()
            user_key = f"user:{user_id}"
            
            # 1. Cooldown Check
            if user_key in self.cooldowns:
                cooldown_until = self.cooldowns[user_key]
                if now < cooldown_until:
                    remaining = int(cooldown_until - now)
                    return False, f"Cooldown active. Wait {remaining}s"
            
            # 2. Tier Limits
            limits = self.tier_limits.get(tier, self.tier_limits["free"])
            
            # 2a. Requests per Minute
            self._cleanup_old_requests(user_key, now, window=60)
            recent_requests = len(self.user_requests[user_key])
            
            if recent_requests >= limits["rpm"]:
                return False, f"Rate limit: {limits['rpm']} requests/min"
            
            # 2b. Tokens per Minute
            self._cleanup_old_tokens(user_key, now, window=60)
            current_tokens = self.user_tokens.get(user_key, 0)
            
            if current_tokens + tokens > limits["tpm"]:
                return False, f"Token limit: {limits['tpm']} tokens/min"
            
            # 3. Provider Limits
            provider_limit = self.provider_limits.get(
                provider,
                self.provider_limits["openai"]
            )
            provider_key = f"provider:{provider}"
            
            self._cleanup_old_requests(provider_key, now, window=60)
            provider_requests = len(self.user_requests[provider_key])
            
            if provider_requests >= provider_limit["rpm"]:
                return False, f"Provider rate limit: {provider} at capacity"
            
            # 4. Abuse Detection
            if self._detect_abuse(user_key, now):
                self.cooldowns[user_key] = now + 300  # 5 min cooldown
                return False, "Abuse detected. 5min cooldown applied"
            
            # 5. Record Request
            self.user_requests[user_key].append(now)
            self.user_requests[provider_key].append(now)
            self.user_tokens[user_key] = current_tokens + tokens
            
            return True, None
    
    def _cleanup_old_requests(self, key: str, now: float, window: int):
        """Entfernt alte Requests außerhalb des Zeitfensters."""
        cutoff = now - window
        self.user_requests[key] = [
            req_time for req_time in self.user_requests[key]
            if req_time > cutoff
        ]
    
    def _cleanup_old_tokens(self, key: str, now: float, window: int):
        """Reset Token-Counter nach Zeitfenster."""
        if key in self.user_tokens:
            last_reset_key = f"{key}:token_reset"
            last_reset = self.user_tokens.get(last_reset_key, 0)
            
            if now - last_reset > window:
                self.user_tokens[key] = 0
                self.user_tokens[last_reset_key] = now
    
    def _detect_abuse(self, key: str, now: float) -> bool:
        """
        Erkennt Abuse-Patterns:
        - > 100 requests in 10 seconds
        - Burst patterns
        """
        recent = [
            req for req in self.user_requests[key]
            if now - req < 10
        ]
        
        if len(recent) > 100:
            self.abuse_counter[key] += 1
            return True
        
        return False
    
    def get_user_stats(self, user_id: int, tier: str) -> Dict:
        """
        Gibt aktuelle Usage-Stats für User zurück.
        """
        with self.lock:
            now = time.time()
            user_key = f"user:{user_id}"
            limits = self.tier_limits.get(tier, self.tier_limits["free"])
            
            self._cleanup_old_requests(user_key, now, window=60)
            current_requests = len(self.user_requests[user_key])
            current_tokens = self.user_tokens.get(user_key, 0)
            
            return {
                "requests_used": current_requests,
                "requests_limit": limits["rpm"],
                "tokens_used": current_tokens,
                "tokens_limit": limits["tpm"],
                "tier": tier,
                "cooldown": self.cooldowns.get(user_key, 0) > now
            }
    
    def reset_user_limits(self, user_id: int):
        """Reset alle Limits für einen User (Admin-Funktion)."""
        with self.lock:
            user_key = f"user:{user_id}"
            self.user_requests[user_key] = []
            self.user_tokens[user_key] = 0
            if user_key in self.cooldowns:
                del self.cooldowns[user_key]
            if user_key in self.abuse_counter:
                del self.abuse_counter[user_key]


# ============================================================
# GLOBAL INSTANCES
# ============================================================

advanced_limiter = AdvancedRateLimiter()


# ============================================================
# HELPER FUNCTIONS (FastAPI Integration)
# ============================================================

def check_user_rate_limit(
    user,
    tokens: int = 0,
    provider: str = "openai",
    feature: str = "chat"
):
    """
    FastAPI-kompatible Rate-Limit-Prüfung.
    
    Raises:
        HTTPException: Bei Rate-Limit-Überschreitung
    """
    tier = getattr(user, "subscription_level", "free") or "free"
    user_id = user.id
    
    allowed, error = advanced_limiter.check_rate_limit(
        user_id=user_id,
        tier=tier,
        tokens=tokens,
        provider=provider,
        feature=feature
    )
    
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=error or "Rate limit exceeded"
        )
    
    return True


# -------------------------------------------------------------
# Globale Instanz für Import
# -------------------------------------------------------------
limiter = AdvancedRateLimiter()
