"""
Pricing Models - Centralized pricing definitions for all plans
"""

from typing import Dict, Optional, Any
from enum import Enum


class PlanType(str, Enum):
    """Available plan types"""
    STARTER = "Starter"
    VIBE_AI_CORE = "Vibe AI Core"
    VIBE_AI_PRO_PLUS = "Vibe AI Pro+"
    VIBE_AI_ULTRA = "Vibe AI Ultra"
    VIBE_AI_ULTRA_PLUS = "Vibe AI Ultra+"
    TEAMS = "Teams"
    ON_DEMAND = "On Demand"
    ENTERPRISE = "Enterprise"


class FeatureType(str, Enum):
    """Feature types for pricing"""
    AGENT = "Agent"
    CODE_GENERATION = "Code Generation"
    DEBUGGER = "Debugger"
    AUTONOMY = "Autonomy"
    OUTBOUND_DATA_TRANSFER = "Outbound data transfer (GiB)"
    POSTGRESQL_STORAGE = "PostgreSQL storage (GiB)"
    POSTGRESQL_COMPUTE = "PostgreSQL compute (hours)"
    APP_STORAGE = "App Storage"
    APP_STORAGE_DATA_TRANSFER = "App Storage data transfer (GiB)"
    APP_STORAGE_BASIC_OPS = "App Storage basic operations"
    APP_STORAGE_ADVANCED_OPS = "App Storage advanced operations"
    DEVELOPMENT_TIME = "Development Time (minutes)"
    COLLABORATORS = "Collaborators"
    RESERVED_VM_DEPLOYMENTS = "Reserved VM deployments"
    AUTOSCALE_DEPLOYMENTS = "Autoscale deployments"
    AUTOSCALE_COMPUTE_UNITS = "Autoscale compute units"
    AUTOSCALE_REQUESTS = "Autoscale requests"
    SCHEDULED_DEPLOYMENTS = "Scheduled deployments"
    SCHEDULED_COMPUTE_UNITS = "Scheduled compute units"
    STATIC_DEPLOYMENTS = "Static deployments"


class PricingModel:
    """Central pricing model for all plans and features"""
    
    # Base monthly prices (in EUR)
    BASE_PRICES: Dict[PlanType, float] = {
        PlanType.STARTER: 0.0,
        PlanType.VIBE_AI_CORE: 24.99,
        PlanType.VIBE_AI_PRO_PLUS: 39.99,
        PlanType.VIBE_AI_ULTRA: 54.99,
        PlanType.VIBE_AI_ULTRA_PLUS: 79.99,
        PlanType.TEAMS: 149.99,
        PlanType.ON_DEMAND: 0.0,  # Pay-as-you-go
        PlanType.ENTERPRISE: 0.0,  # Custom pricing
    }
    
    # Yearly discount (20% for all plans)
    YEARLY_DISCOUNT = 0.20
    
    # Feature pricing per plan
    FEATURE_PRICING: Dict[PlanType, Dict[str, Any]] = {
        PlanType.STARTER: {
            "agent_access": "limited",
            "code_generation": "chat_agent_only",
            "debugger": "chat_agent_only",
            "autonomy": "basic",
            "outbound_data_transfer_included": 1,  # GiB
            "outbound_data_transfer_price": 0.15,  # per GiB (höchster Preis für Free Plan)
            "postgresql_storage_price": 2.0,  # per GiB per month (höchster Preis)
            "postgresql_compute_price": 0.20,  # per compute hour (höchster Preis)
            "app_storage_data_transfer_price": 0.12,  # per GiB (höchster Preis)
            "app_storage_basic_ops_price": None,  # Card required
            "app_storage_advanced_ops_price": 0.01,  # per 1 thousand (höchster Preis)
            "development_time_minutes": 1200,
            "collaborators": 1,
        },
        PlanType.VIBE_AI_CORE: {
            "agent_access": "full",
            "code_generation": "chat_core_smart",
            "debugger": "chat_core_smart",
            "autonomy": "advanced",
            "outbound_data_transfer_included": 100,  # GiB
            "outbound_data_transfer_price": 0.10,  # per GiB (günstiger als Starter)
            "postgresql_storage_price": 1.5,  # per GiB per month (günstiger)
            "postgresql_compute_price": 0.16,  # per compute hour (günstiger)
            "app_storage_data_transfer_price": 0.05,  # per GiB per month (günstiger)
            "app_storage_basic_ops_price": None,  # Included
            "app_storage_advanced_ops_price": 0.008,  # per 1 thousand (günstiger)
            "development_time_minutes": None,  # Unlimited
            "collaborators": 3,
        },
        PlanType.VIBE_AI_PRO_PLUS: {
            "agent_access": "full",
            "code_generation": "chat_core_smart_fix",
            "debugger": "chat_core_smart_fix",
            "autonomy": "advanced",
            "outbound_data_transfer_included": 1000,  # GiB
            "outbound_data_transfer_price": 0.08,  # per GiB (noch günstiger)
            "postgresql_storage_price": 1.3,  # per GiB per month (noch günstiger)
            "postgresql_compute_price": 0.14,  # per compute hour (noch günstiger)
            "app_storage_data_transfer_price": 0.04,  # per GiB per month (noch günstiger)
            "app_storage_basic_ops_price": None,  # Included
            "app_storage_advanced_ops_price": 0.007,  # per 1 thousand (noch günstiger)
            "development_time_minutes": None,  # Unlimited
            "collaborators": None,  # All team members
        },
        PlanType.VIBE_AI_ULTRA: {
            "agent_access": "full",
            "code_generation": "chat_core_smart_fix_theme",
            "debugger": "chat_core_smart_fix_theme",
            "autonomy": "advanced",
            "outbound_data_transfer_included": 1000,  # GiB
            "outbound_data_transfer_price": 0.07,  # per GiB (noch günstiger)
            "postgresql_storage_price": 1.2,  # per GiB per month (noch günstiger)
            "postgresql_compute_price": 0.13,  # per compute hour (noch günstiger)
            "app_storage_data_transfer_price": 0.035,  # per GiB per month (noch günstiger)
            "app_storage_basic_ops_price": None,  # Included
            "app_storage_advanced_ops_price": 0.0065,  # per 1 thousand (noch günstiger)
            "development_time_minutes": None,  # Unlimited
            "collaborators": None,  # All team members
        },
        PlanType.VIBE_AI_ULTRA_PLUS: {
            "agent_access": "full",
            "code_generation": "all_agents",
            "debugger": "all_agents",
            "autonomy": "advanced",
            "outbound_data_transfer_included": 1000,  # GiB
            "outbound_data_transfer_price": 0.06,  # per GiB (sehr günstig)
            "postgresql_storage_price": 1.1,  # per GiB per month (sehr günstig)
            "postgresql_compute_price": 0.12,  # per compute hour (sehr günstig)
            "app_storage_data_transfer_price": 0.03,  # per GiB per month (sehr günstig)
            "app_storage_basic_ops_price": None,  # Included
            "app_storage_advanced_ops_price": 0.006,  # per 1 thousand (sehr günstig)
            "development_time_minutes": None,  # Unlimited
            "collaborators": None,  # All team members
        },
        PlanType.TEAMS: {
            "agent_access": "full",
            "code_generation": "all_agents",
            "debugger": "all_agents",
            "autonomy": "advanced",
            "outbound_data_transfer_included": 1000,  # GiB
            "outbound_data_transfer_price": 0.05,  # per GiB (günstigster Preis)
            "postgresql_storage_price": 1.0,  # per GiB per month (günstigster Preis)
            "postgresql_compute_price": 0.10,  # per compute hour (günstigster Preis)
            "app_storage_data_transfer_price": 0.025,  # per GiB per month (günstigster Preis)
            "app_storage_basic_ops_price": None,  # Included
            "app_storage_advanced_ops_price": 0.005,  # per 1 thousand (günstigster Preis)
            "development_time_minutes": None,  # Unlimited
            "collaborators": None,  # All team members
        },
        PlanType.ENTERPRISE: {
            "agent_access": "full",
            "code_generation": "all_agents",
            "debugger": "all_agents",
            "autonomy": "advanced",
            "outbound_data_transfer_included": None,  # Custom
            "outbound_data_transfer_price": 0.08,  # per GiB (Enterprise-Preis)
            "postgresql_storage_price": 1.4,  # per GiB per month (Enterprise-Preis)
            "postgresql_compute_price": 0.15,  # per compute hour (Enterprise-Preis)
            "app_storage_data_transfer_price": 0.10,  # per GiB (Enterprise-Preis)
            "app_storage_basic_ops_price": 0.0006,  # per 1 thousand (Enterprise-Preis)
            "app_storage_advanced_ops_price": 0.0075,  # per 1 thousand (Enterprise-Preis)
            "development_time_minutes": None,  # Unlimited
            "collaborators": None,  # All team members
        },
    }
    
    @staticmethod
    def get_monthly_price(plan: PlanType) -> float:
        """Get monthly price for a plan"""
        return PricingModel.BASE_PRICES.get(plan, 0.0)
    
    @staticmethod
    def get_yearly_price(plan: PlanType) -> float:
        """Get yearly price with discount"""
        monthly = PricingModel.get_monthly_price(plan)
        if monthly == 0:
            return 0.0
        yearly = monthly * 12
        return yearly * (1 - PricingModel.YEARLY_DISCOUNT)
    
    @staticmethod
    def get_feature_pricing(plan: PlanType, feature: str) -> Optional[Any]:
        """Get pricing for a specific feature in a plan"""
        return PricingModel.FEATURE_PRICING.get(plan, {}).get(feature)
    
    @staticmethod
    def get_tooltip_text(plan: PlanType, feature: FeatureType) -> str:
        """Generate tooltip text for a feature in a plan"""
        try:
            pricing = PricingModel.FEATURE_PRICING.get(plan, {})
            
            if feature == FeatureType.AGENT:
                if plan == PlanType.STARTER:
                    return "Eingeschränkter Zugriff auf Vibe AI Agent für Testzwecke"
                return "Vollzugriff auf alle Vibe AI Agents mit unbegrenzten Anfragen"
            
            elif feature == FeatureType.CODE_GENERATION:
                agents = pricing.get("code_generation", "")
                agent_map = {
                    "chat_agent_only": "Zugriff auf Chat Agent",
                    "chat_core_smart": "Zugriff auf Chat Agent, Core Agent und Smart Agent",
                    "chat_core_smart_fix": "Zugriff auf Chat Agent, Core Agent, Smart Agent und Fix Agent",
                    "chat_core_smart_fix_theme": "Zugriff auf Chat Agent, Core Agent, Smart Agent, Fix Agent und Theme Agent",
                    "all_agents": "Zugriff auf alle AI Agents: Chat, Core, Smart, Fix, Theme und Code Agent"
                }
                return agent_map.get(agents, "Zugriff auf Chat Agent")
            
            elif feature == FeatureType.DEBUGGER:
                agents = pricing.get("debugger", "")
                agent_map = {
                    "chat_agent_only": "Zugriff auf Chat Agent",
                    "chat_core_smart": "Zugriff auf Chat Agent, Core Agent und Smart Agent",
                    "chat_core_smart_fix": "Zugriff auf Chat Agent, Core Agent, Smart Agent und Fix Agent",
                    "chat_core_smart_fix_theme": "Zugriff auf Chat Agent, Core Agent, Smart Agent, Fix Agent und Theme Agent",
                    "all_agents": "Zugriff auf alle AI Agents: Chat, Core, Smart, Fix, Theme und Code Agent"
                }
                return agent_map.get(agents, "Zugriff auf Chat Agent")
            
            elif feature == FeatureType.AUTONOMY:
                return "Unbegrenzter Basis-Chat. Schnelle Code-Änderungen für 0,05€ pro Anfrage."
            
            elif feature == FeatureType.OUTBOUND_DATA_TRANSFER:
                included = pricing.get("outbound_data_transfer_included")
                price = pricing.get("outbound_data_transfer_price", 0.10)
                if plan == PlanType.STARTER:
                    return f"1 GiB inklusive. Danach {price:.2f}€ pro GiB."
                if included is None:
                    return f"Individuelle Limits. Danach {price:.2f}€ pro GiB."
                return f"{included} GiB inklusive. Danach {price:.2f}€ pro GiB."
            
            elif feature == FeatureType.POSTGRESQL_STORAGE:
                price = pricing.get("postgresql_storage_price", 1.5)
                if plan == PlanType.STARTER:
                    return f"Kreditkarte erforderlich für Deployment. {price:.2f}€ pro GiB pro Monat."
                return f"{price:.2f}€ pro GiB pro Monat."
            
            elif feature == FeatureType.POSTGRESQL_COMPUTE:
                price = pricing.get("postgresql_compute_price", 0.16)
                if plan == PlanType.STARTER:
                    return f"Kreditkarte erforderlich für Deployment. {price:.2f}€ pro Compute-Stunde."
                return f"{price:.2f}€ pro Compute-Stunde."
            
            elif feature == FeatureType.APP_STORAGE:
                if plan == PlanType.STARTER:
                    return "Kreditkarte erforderlich für Nutzung."
                return "App Storage für Datei-Uploads und Verwaltung"
            
            elif feature == FeatureType.APP_STORAGE_DATA_TRANSFER:
                price = pricing.get("app_storage_data_transfer_price", 0.03)
                if plan == PlanType.STARTER:
                    return f"Kreditkarte erforderlich für Nutzung. {price:.2f}€ pro GiB."
                if plan == PlanType.ENTERPRISE:
                    return f"{price:.2f}€ pro GiB."
                return f"{price:.2f}€ pro GiB pro Monat."
            
            elif feature == FeatureType.APP_STORAGE_BASIC_OPS:
                price = pricing.get("app_storage_basic_ops_price")
                if plan == PlanType.STARTER:
                    return "Kreditkarte erforderlich für Nutzung."
                if price is None:
                    return "Basis App Storage Operationen inklusive"
                return f"{price:.4f}€ pro 1.000 Operationen."
            
            elif feature == FeatureType.APP_STORAGE_ADVANCED_OPS:
                price = pricing.get("app_storage_advanced_ops_price", 0.0075)
                if plan == PlanType.STARTER:
                    return f"Kreditkarte erforderlich für Nutzung. {price:.4f}€ pro 1.000 Operationen."
                return f"{price:.4f}€ pro 1.000 Operationen."
            
            elif feature == FeatureType.RESERVED_VM_DEPLOYMENTS:
                if plan == PlanType.STARTER:
                    return "Nicht verfügbar im Starter-Plan. Upgrade erforderlich."
                if plan == PlanType.VIBE_AI_CORE:
                    return "Reservierte VM-Deployments verfügbar. Dedizierte Ressourcen für konsistente Performance."
                return "Reservierte VM-Deployments inklusive. Dedizierte Ressourcen mit garantierter Verfügbarkeit."
            
            elif feature == FeatureType.AUTOSCALE_DEPLOYMENTS:
                if plan == PlanType.STARTER:
                    return "Nicht verfügbar im Starter-Plan. Upgrade erforderlich."
                return "Automatische Skalierung basierend auf Traffic. Deployments passen sich automatisch der Last an."
            
            elif feature == FeatureType.AUTOSCALE_COMPUTE_UNITS:
                if plan == PlanType.STARTER:
                    return "Nicht verfügbar im Starter-Plan. Upgrade erforderlich."
                if plan == PlanType.VIBE_AI_CORE:
                    return "Bis zu 10 Compute-Einheiten mit automatischer Skalierung."
                if plan == PlanType.VIBE_AI_PRO_PLUS:
                    return "Bis zu 50 Compute-Einheiten mit automatischer Skalierung."
                return "Unbegrenzte Compute-Einheiten mit automatischer Skalierung."
            
            elif feature == FeatureType.AUTOSCALE_REQUESTS:
                if plan == PlanType.STARTER:
                    return "Nicht verfügbar im Starter-Plan. Upgrade erforderlich."
                return "Automatische Skalierung von Anfragen. System passt sich automatisch an die Last an."
            
            elif feature == FeatureType.SCHEDULED_DEPLOYMENTS:
                if plan == PlanType.STARTER:
                    return "Nicht verfügbar im Starter-Plan. Upgrade erforderlich."
                return "Zeitgesteuerte Deployments verfügbar. Automatische Deployments zu festgelegten Zeiten."
            
            elif feature == FeatureType.SCHEDULED_COMPUTE_UNITS:
                if plan == PlanType.STARTER:
                    return "Nicht verfügbar im Starter-Plan. Upgrade erforderlich."
                return "Zeitgesteuerte Compute-Einheiten. Ressourcen werden zu festgelegten Zeiten aktiviert."
            
            elif feature == FeatureType.STATIC_DEPLOYMENTS:
                if plan == PlanType.STARTER:
                    return "1 statisches Deployment verfügbar."
                return "Unbegrenzte statische Deployments. Perfekt für statische Websites und Frontend-Apps."
            
            elif feature == FeatureType.DEVELOPMENT_TIME:
                minutes = pricing.get("development_time_minutes")
                if minutes is None:
                    return "Unbegrenzte Entwicklungszeit"
                if plan == PlanType.VIBE_AI_CORE:
                    return "Anzahl gleichzeitiger Nutzer kann Performance beeinflussen"
                return f"{minutes} Minuten pro Monat"
            
            elif feature == FeatureType.COLLABORATORS:
                count = pricing.get("collaborators")
                if count is None:
                    return "Alle Teammitglieder"
                return f"Bis zu {count} Mitarbeiter pro Projekt"
            
            return "Additional information available"
        except Exception as e:
            # Fallback bei jedem Fehler
            return f"Additional information about {feature.value} in the {plan.value} plan"


class FeaturePricing:
    """Individual feature pricing details"""
    pass


class PlanLimits:
    """Plan limits and quotas"""
    pass

