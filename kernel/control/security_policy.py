# kernel/security_policy.py
# ----------------------------
# Security & Sandboxing (Kernel v1.1)
#
# PHILOSOPHIE:
# - Sicherheit durch Whitelisting
# - API-Keys niemals im Code
# - Rate-Limiting für Kosten-Kontrolle
# - Action-Sandbox für Schutz
#
# FEATURES:
# - API Key Vault (verschlüsselt)
# - Action Whitelisting/Blacklisting
# - Rate Limiting
# - Cost Budget Protection

from dataclasses import dataclass
from typing import Optional, Set
from enum import Enum
import time
from collections import defaultdict


class SecurityLevel(Enum):
    """
    Sicherheits-Level.
    
    STRICT:
        - Nur whitelistete Actions
        - Aggressive Rate-Limits
        - Keine Filesystem-Writes außerhalb Projekt
    
    NORMAL:
        - Blacklist für gefährliche Actions
        - Standard Rate-Limits
        - Filesystem-Zugriff im Projekt
    
    PERMISSIVE:
        - Alles erlaubt außer Blacklist
        - Lockere Rate-Limits
        - Voller Filesystem-Zugriff
    """
    STRICT = "strict"
    NORMAL = "normal"
    PERMISSIVE = "permissive"


@dataclass
class RateLimit:
    """
    Rate-Limit Definition.
    
    Attribute:
    - action: Action-Name oder "*" für alle
    - max_per_minute: Max Aufrufe pro Minute
    - max_per_hour: Max Aufrufe pro Stunde
    - max_cost_per_day: Max Kosten pro Tag (USD)
    """
    action: str
    max_per_minute: int
    max_per_hour: int
    max_cost_per_day: float = 100.0


@dataclass
class SecurityViolation:
    """
    Security-Verletzung.
    
    Attribute:
    - action: Versuchte Aktion
    - reason: Grund der Ablehnung
    - severity: Schwere (0-1)
    - timestamp: Zeitpunkt
    """
    action: str
    reason: str
    severity: float
    timestamp: float


class SecurityPolicy:
    """
    Security Policy (Kernel v1.1) - Sicherheits-Layer.
    
    FEATURES:
    - API Key Management (vault)
    - Action Whitelisting/Blacklisting
    - Rate Limiting
    - Cost Budget Protection
    - Filesystem Sandbox
    
    VORTEILE:
    - Keys nie im Code
    - Schutz vor Missbrauch
    - Kosten-Kontrolle
    - Audit-Trail
    """
    
    def __init__(self, kernel, level: SecurityLevel = SecurityLevel.NORMAL):
        """
        Args:
            kernel: Kernel-Instanz
            level: Security-Level
        """
        self.kernel = kernel
        self.level = level
        
        # API Keys (in-memory, sollte encrypted storage sein)
        self._api_keys: dict = {}
        
        # Whitelists/Blacklists
        self.action_whitelist: Set[str] = set()
        self.action_blacklist: Set[str] = {
            "rm -rf /",
            "format",
            "dd if=/dev/zero",
            ":(){ :|:& };:",  # Fork bomb
            "chmod 000",
            "shutdown",
            "reboot"
        }
        
        # Filesystem Sandbox
        self.allowed_paths: Set[str] = set()
        self.forbidden_paths: Set[str] = {
            "/System",
            "/private",
            "/etc/passwd",
            "/etc/shadow",
            "~/.ssh",
            "~/.aws"
        }
        
        # Rate Limiting
        self.rate_limits: list = [
            RateLimit("*", max_per_minute=60, max_per_hour=1000, max_cost_per_day=50.0),
            RateLimit("model_request", max_per_minute=30, max_per_hour=500, max_cost_per_day=20.0),
            RateLimit("file_write", max_per_minute=20, max_per_hour=200),
            RateLimit("terminal_exec", max_per_minute=10, max_per_hour=100)
        ]
        
        # Tracking
        self._action_counts = defaultdict(lambda: defaultdict(int))  # {action: {minute: count}}
        self._action_costs = defaultdict(float)  # {day: total_cost}
        self._violations: list = []
    
    def add_api_key(self, service: str, key: str):
        """
        Fügt API-Key hinzu (Vault).
        
        Args:
            service: Service-Name (openai, anthropic, etc.)
            key: API-Key
        """
        # TODO: Verschlüsselung
        self._api_keys[service] = key
    
    def get_api_key(self, service: str) -> Optional[str]:
        """
        Holt API-Key aus Vault.
        
        Args:
            service: Service-Name
            
        Returns:
            API-Key oder None
        """
        return self._api_keys.get(service)
    
    def check_action(self, action: str) -> tuple[bool, Optional[str]]:
        """
        Prüft ob Action erlaubt ist.
        
        Args:
            action: Action-Name
            
        Returns:
            (allowed, reason)
        """
        # Blacklist
        if action in self.action_blacklist:
            self._record_violation(action, "Blacklisted action", 1.0)
            return False, f"Action '{action}' is blacklisted"
        
        # Whitelist (nur bei STRICT)
        if self.level == SecurityLevel.STRICT:
            if action not in self.action_whitelist:
                self._record_violation(action, "Not whitelisted", 0.5)
                return False, f"Action '{action}' not in whitelist"
        
        return True, None
    
    def check_file_access(self, path: str, write: bool = False) -> tuple[bool, Optional[str]]:
        """
        Prüft Filesystem-Zugriff.
        
        Args:
            path: Datei-Pfad
            write: Write-Zugriff?
            
        Returns:
            (allowed, reason)
        """
        # Forbidden Paths
        for forbidden in self.forbidden_paths:
            if path.startswith(forbidden):
                self._record_violation(
                    f"file_access:{path}",
                    f"Access to {forbidden}",
                    0.9
                )
                return False, f"Access to {forbidden} is forbidden"
        
        # Allowed Paths (nur bei STRICT)
        if self.level == SecurityLevel.STRICT and self.allowed_paths:
            allowed = any(path.startswith(p) for p in self.allowed_paths)
            if not allowed:
                self._record_violation(
                    f"file_access:{path}",
                    "Not in allowed paths",
                    0.6
                )
                return False, "Path not in allowed list"
        
        return True, None
    
    def check_rate_limit(self, action: str, cost: float = 0.0) -> tuple[bool, Optional[str]]:
        """
        Prüft Rate-Limit.
        
        Args:
            action: Action-Name
            cost: Kosten in USD
            
        Returns:
            (allowed, reason)
        """
        now = time.time()
        minute = int(now / 60)
        hour = int(now / 3600)
        day = int(now / 86400)
        
        # Count erhöhen
        self._action_counts[action][minute] += 1
        self._action_costs[day] += cost
        
        # Limits prüfen
        for limit in self.rate_limits:
            if limit.action != "*" and limit.action != action:
                continue
            
            # Per-Minute
            if self._action_counts[action][minute] > limit.max_per_minute:
                self._record_violation(
                    action,
                    f"Rate limit exceeded: {limit.max_per_minute}/min",
                    0.3
                )
                return False, f"Rate limit: max {limit.max_per_minute}/min"
            
            # Per-Hour
            hourly = sum(
                count for m, count in self._action_counts[action].items()
                if hour == int(m * 60 / 3600)
            )
            if hourly > limit.max_per_hour:
                self._record_violation(
                    action,
                    f"Rate limit exceeded: {limit.max_per_hour}/hour",
                    0.5
                )
                return False, f"Rate limit: max {limit.max_per_hour}/hour"
            
            # Cost Budget
            daily_cost = self._action_costs[day]
            if daily_cost > limit.max_cost_per_day:
                self._record_violation(
                    action,
                    f"Cost budget exceeded: ${limit.max_cost_per_day}/day",
                    0.8
                )
                return False, f"Daily budget exceeded: ${daily_cost:.2f} > ${limit.max_cost_per_day}"
        
        return True, None
    
    def add_to_whitelist(self, action: str):
        """Fügt Action zur Whitelist hinzu."""
        self.action_whitelist.add(action)
    
    def add_to_blacklist(self, action: str):
        """Fügt Action zur Blacklist hinzu."""
        self.action_blacklist.add(action)
    
    def add_allowed_path(self, path: str):
        """Fügt erlaubten Pfad hinzu."""
        self.allowed_paths.add(path)
    
    def add_forbidden_path(self, path: str):
        """Fügt verbotenen Pfad hinzu."""
        self.forbidden_paths.add(path)
    
    def set_rate_limit(self, limit: RateLimit):
        """Fügt Rate-Limit hinzu."""
        # Ersetze existierende
        self.rate_limits = [l for l in self.rate_limits if l.action != limit.action]
        self.rate_limits.append(limit)
    
    def _record_violation(self, action: str, reason: str, severity: float):
        """Zeichnet Security-Verletzung auf."""
        violation = SecurityViolation(
            action=action,
            reason=reason,
            severity=severity,
            timestamp=time.time()
        )
        self._violations.append(violation)
        
        # Max 1000 Violations speichern
        if len(self._violations) > 1000:
            self._violations = self._violations[-1000:]
    
    def get_violations(self, hours: int = 24) -> list:
        """
        Gibt Security-Verletzungen zurück.
        
        Args:
            hours: Letzte N Stunden
            
        Returns:
            Liste von SecurityViolation
        """
        cutoff = time.time() - (hours * 3600)
        return [v for v in self._violations if v.timestamp >= cutoff]
    
    def get_stats(self) -> dict:
        """Gibt Statistiken zurück."""
        now = time.time()
        day = int(now / 86400)
        
        return {
            "level": self.level.value,
            "api_keys_count": len(self._api_keys),
            "whitelist_size": len(self.action_whitelist),
            "blacklist_size": len(self.action_blacklist),
            "allowed_paths": len(self.allowed_paths),
            "forbidden_paths": len(self.forbidden_paths),
            "rate_limits": len(self.rate_limits),
            "violations_24h": len(self.get_violations(24)),
            "daily_cost": self._action_costs.get(day, 0.0)
        }


# Singleton
_security_policy: Optional[SecurityPolicy] = None


def init_security_policy(kernel, level: SecurityLevel = SecurityLevel.NORMAL) -> SecurityPolicy:
    """Initialisiert globale Security Policy."""
    global _security_policy
    _security_policy = SecurityPolicy(kernel, level)
    return _security_policy


def get_security_policy() -> SecurityPolicy:
    """Gibt globale Security Policy zurück."""
    if _security_policy is None:
        raise RuntimeError("Security Policy not initialized")
    return _security_policy
