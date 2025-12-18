"""
Pricing Calculator - Calculate costs based on usage
"""

from typing import Dict, Optional
from .models import PricingModel, PlanType, FeatureType


class PricingCalculator:
    """Calculate pricing based on plan and usage"""
    
    @staticmethod
    def calculate_monthly_cost(
        plan: PlanType,
        usage: Dict[str, float]
    ) -> Dict[str, float]:
        """
        Calculate monthly cost based on plan and usage
        
        Args:
            plan: The plan type
            usage: Dictionary of usage metrics (e.g., {"outbound_data_transfer_gib": 150, "postgresql_storage_gib": 10})
        
        Returns:
            Dictionary with cost breakdown
        """
        base_price = PricingModel.get_monthly_price(plan)
        costs = {
            "base_price": base_price,
            "feature_costs": {},
            "total": base_price
        }
        
        pricing = PricingModel.FEATURE_PRICING.get(plan, {})
        
        # Outbound data transfer
        if "outbound_data_transfer_gib" in usage:
            used = usage["outbound_data_transfer_gib"]
            included = pricing.get("outbound_data_transfer_included", 0) or 0
            if used > included:
                overage = used - included
                price_per_gib = pricing.get("outbound_data_transfer_price", 0.10)
                costs["feature_costs"]["outbound_data_transfer"] = overage * price_per_gib
                costs["total"] += costs["feature_costs"]["outbound_data_transfer"]
        
        # PostgreSQL storage
        if "postgresql_storage_gib" in usage:
            used = usage["postgresql_storage_gib"]
            price_per_gib = pricing.get("postgresql_storage_price", 1.5)
            costs["feature_costs"]["postgresql_storage"] = used * price_per_gib
            costs["total"] += costs["feature_costs"]["postgresql_storage"]
        
        # PostgreSQL compute
        if "postgresql_compute_hours" in usage:
            used = usage["postgresql_compute_hours"]
            price_per_hour = pricing.get("postgresql_compute_price", 0.16)
            costs["feature_costs"]["postgresql_compute"] = used * price_per_hour
            costs["total"] += costs["feature_costs"]["postgresql_compute"]
        
        # App Storage data transfer
        if "app_storage_data_transfer_gib" in usage:
            used = usage["app_storage_data_transfer_gib"]
            price_per_gib = pricing.get("app_storage_data_transfer_price", 0.03)
            costs["feature_costs"]["app_storage_data_transfer"] = used * price_per_gib
            costs["total"] += costs["feature_costs"]["app_storage_data_transfer"]
        
        # App Storage basic operations
        if "app_storage_basic_ops_thousands" in usage:
            used = usage["app_storage_basic_ops_thousands"]
            price = pricing.get("app_storage_basic_ops_price")
            if price is not None:
                costs["feature_costs"]["app_storage_basic_ops"] = used * price
                costs["total"] += costs["feature_costs"]["app_storage_basic_ops"]
        
        # App Storage advanced operations
        if "app_storage_advanced_ops_thousands" in usage:
            used = usage["app_storage_advanced_ops_thousands"]
            price = pricing.get("app_storage_advanced_ops_price", 0.0075)
            costs["feature_costs"]["app_storage_advanced_ops"] = used * price
            costs["total"] += costs["feature_costs"]["app_storage_advanced_ops"]
        
        return costs
    
    @staticmethod
    def get_plan_limits(plan: PlanType) -> Dict[str, Optional[float]]:
        """Get limits for a plan"""
        pricing = PricingModel.FEATURE_PRICING.get(plan, {})
        return {
            "outbound_data_transfer_included": pricing.get("outbound_data_transfer_included"),
            "development_time_minutes": pricing.get("development_time_minutes"),
            "collaborators": pricing.get("collaborators"),
        }

