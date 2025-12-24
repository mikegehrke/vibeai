"""
Pricing API Routes
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Optional
from pydantic import BaseModel

from .models import PricingModel, PlanType, FeatureType
from .calculator import PricingCalculator


router = APIRouter(prefix="/api/pricing", tags=["Pricing"])


class UsageRequest(BaseModel):
    """Usage data for cost calculation"""
    plan: str
    usage: Dict[str, float]


class TooltipRequest(BaseModel):
    """Request for tooltip text"""
    plan: str
    feature: str


@router.get("/plans")
async def get_all_plans():
    """Get all available plans with pricing"""
    plans = []
    for plan_type in PlanType:
        plans.append({
            "name": plan_type.value,
            "monthly_price": PricingModel.get_monthly_price(plan_type),
            "yearly_price": PricingModel.get_yearly_price(plan_type),
            "yearly_discount": PricingModel.YEARLY_DISCOUNT * 100,
        })
    return {"plans": plans}


@router.get("/plans/{plan_name}")
async def get_plan_details(plan_name: str):
    """Get detailed pricing for a specific plan"""
    try:
        plan = PlanType(plan_name.replace(" ", "_").replace("+", "_PLUS").upper())
    except ValueError:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    pricing = PricingModel.FEATURE_PRICING.get(plan, {})
    return {
        "plan": plan.value,
        "monthly_price": PricingModel.get_monthly_price(plan),
        "yearly_price": PricingModel.get_yearly_price(plan),
        "yearly_discount": PricingModel.YEARLY_DISCOUNT * 100,
        "features": pricing,
        "limits": PricingCalculator.get_plan_limits(plan),
    }


@router.get("/tooltip")
async def get_tooltip(plan: str, feature: str):
    """Get tooltip text for a feature in a plan"""
    # WICHTIG: Alle Exceptions müssen abgefangen werden, um 500-Fehler zu vermeiden
    try:
        # Konvertiere Plan-Name zu Enum
        plan_normalized = plan.replace(" ", "_").replace("+", "_PLUS").upper()
        try:
            plan_type = PlanType[plan_normalized]
        except (KeyError, AttributeError, TypeError) as e:
            # Plan nicht gefunden - gib generischen Fallback zurück
            return {
                "plan": plan,
                "feature": feature,
                "tooltip": f"Feature '{feature}' is available in the {plan} plan. Contact us for more details."
            }
        
        # Konvertiere Feature-Name zu Enum
        # Feature-Namen können Leerzeichen enthalten, müssen aber exakt übereinstimmen
        try:
            feature_type = FeatureType(feature)
        except (ValueError, AttributeError, TypeError):
            # Feature nicht gefunden - gib generischen Fallback zurück
            return {
                "plan": plan,
                "feature": feature,
                "tooltip": f"Feature '{feature}' is available in the {plan} plan. Contact us for more details."
            }
        
        # Generiere Tooltip-Text
        try:
            tooltip_text = PricingModel.get_tooltip_text(plan_type, feature_type)
            return {
                "plan": plan,
                "feature": feature,
                "tooltip": tooltip_text
            }
        except Exception as e:
            # Fehler beim Generieren des Tooltip-Texts - gib generischen Fallback zurück
            return {
                "plan": plan,
                "feature": feature,
                "tooltip": f"Additional information about '{feature}' in the {plan} plan. Contact us for details."
            }
    except Exception as e:
        # Unerwarteter Fehler - logge den Fehler und gib generischen Fallback zurück
        # WICHTIG: Niemals einen 500-Fehler werfen, immer einen Fallback zurückgeben
        import logging
        logging.error(f"Unexpected error in get_tooltip for plan='{plan}', feature='{feature}': {str(e)}", exc_info=True)
        return {
            "plan": plan,
            "feature": feature,
            "tooltip": f"Additional information about '{feature}' in the {plan} plan. Contact us for details."
        }


@router.post("/calculate")
async def calculate_cost(request: UsageRequest):
    """Calculate cost based on plan and usage"""
    try:
        plan = PlanType(request.plan.replace(" ", "_").replace("+", "_PLUS").upper())
    except ValueError:
        raise HTTPException(status_code=404, detail="Plan not found")
    
    costs = PricingCalculator.calculate_monthly_cost(plan, request.usage)
    return costs


@router.get("/features")
async def get_all_features():
    """Get all available features"""
    features = [feature.value for feature in FeatureType]
    return {"features": features}

