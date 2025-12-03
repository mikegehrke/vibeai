#!/usr/bin/env python3
"""
⭐ BLOCK D — BUDGET-LIMIT ENGINE
Prevents agents from spending too much money
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
from enum import Enum

from ai.pricing.pricing_table import pricing_db


class BudgetPeriod(Enum):
    """Budget period types"""
    HOURLY = "hourly"
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    TOTAL = "total"


@dataclass
class BudgetLimit:
    """Budget limit configuration"""
    user_id: str
    period: BudgetPeriod
    limit_euros: float
    current_spend: float = 0.0
    last_reset: datetime = None
    
    def __post_init__(self):
        if self.last_reset is None:
            self.last_reset = datetime.now()


@dataclass
class Transaction:
    """Budget transaction record"""
    user_id: str
    model_id: str
    input_tokens: int
    output_tokens: int
    cost_euros: float
    timestamp: datetime
    task_description: Optional[str] = None


class BudgetEngine:
    """Budget management and cost tracking"""
    
    def __init__(self):
        self.user_budgets: Dict[str, Dict[BudgetPeriod, BudgetLimit]] = {}
        self.transactions: List[Transaction] = []
        self.pricing_db = pricing_db
    
    def set_budget(
        self,
        user_id: str,
        period: BudgetPeriod,
        limit_euros: float
    ):
        """Set budget limit for user"""
        
        if user_id not in self.user_budgets:
            self.user_budgets[user_id] = {}
        
        self.user_budgets[user_id][period] = BudgetLimit(
            user_id=user_id,
            period=period,
            limit_euros=limit_euros,
            current_spend=0.0,
            last_reset=datetime.now()
        )
    
    def allow(
        self,
        user_id: str,
        estimated_cost: float,
        period: BudgetPeriod = BudgetPeriod.DAILY
    ) -> bool:
        """
        Check if user can spend estimated cost
        
        Args:
            user_id: User identifier
            estimated_cost: Estimated cost in euros
            period: Budget period to check
            
        Returns:
            True if within budget, False otherwise
        """
        
        # Reset budget if period expired
        self._reset_if_needed(user_id, period)
        
        # Get budget limit
        budget = self._get_budget(user_id, period)
        if not budget:
            return True  # No limit set
        
        # Check if within budget
        return (budget.current_spend + estimated_cost) <= budget.limit_euros
    
    def add_cost(
        self,
        user_id: str,
        model_id: str,
        input_tokens: int,
        output_tokens: int,
        task_description: Optional[str] = None
    ) -> float:
        """
        Add cost to user's spend
        
        Args:
            user_id: User identifier
            model_id: Model used
            input_tokens: Number of input tokens
            output_tokens: Number of output tokens
            task_description: Optional task description
            
        Returns:
            Cost in euros
        """
        
        # Calculate cost
        cost = self.pricing_db.calculate_cost(
            model_id=model_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens
        )
        
        # Add to all budget periods
        for period in BudgetPeriod:
            self._reset_if_needed(user_id, period)
            budget = self._get_budget(user_id, period)
            if budget:
                budget.current_spend += cost
        
        # Record transaction
        transaction = Transaction(
            user_id=user_id,
            model_id=model_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cost_euros=cost,
            timestamp=datetime.now(),
            task_description=task_description
        )
        self.transactions.append(transaction)
        
        return cost
    
    def get_spend(
        self,
        user_id: str,
        period: BudgetPeriod = BudgetPeriod.DAILY
    ) -> float:
        """Get current spend for user in period"""
        
        self._reset_if_needed(user_id, period)
        budget = self._get_budget(user_id, period)
        
        if not budget:
            return 0.0
        
        return budget.current_spend
    
    def get_remaining(
        self,
        user_id: str,
        period: BudgetPeriod = BudgetPeriod.DAILY
    ) -> Optional[float]:
        """Get remaining budget for user in period"""
        
        self._reset_if_needed(user_id, period)
        budget = self._get_budget(user_id, period)
        
        if not budget:
            return None  # No limit set
        
        return max(0, budget.limit_euros - budget.current_spend)
    
    def estimate_cost(
        self,
        model_id: str,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """Estimate cost for request"""
        
        return self.pricing_db.calculate_cost(
            model_id=model_id,
            input_tokens=input_tokens,
            output_tokens=output_tokens
        )
    
    def get_budget_status(self, user_id: str) -> Dict[str, Any]:
        """Get budget status for all periods"""
        
        status = {}
        
        for period in BudgetPeriod:
            self._reset_if_needed(user_id, period)
            budget = self._get_budget(user_id, period)
            
            if budget:
                status[period.value] = {
                    "limit": budget.limit_euros,
                    "spent": budget.current_spend,
                    "remaining": max(0, budget.limit_euros - budget.current_spend),
                    "percentage_used": (budget.current_spend / budget.limit_euros * 100) if budget.limit_euros > 0 else 0,
                    "last_reset": budget.last_reset.isoformat()
                }
            else:
                status[period.value] = {
                    "limit": None,
                    "spent": 0.0,
                    "remaining": None,
                    "percentage_used": 0,
                    "last_reset": None
                }
        
        return status
    
    def get_transactions(
        self,
        user_id: str,
        limit: Optional[int] = None,
        since: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Get transaction history"""
        
        user_txs = [
            tx for tx in self.transactions
            if tx.user_id == user_id
        ]
        
        if since:
            user_txs = [tx for tx in user_txs if tx.timestamp >= since]
        
        # Sort by timestamp (newest first)
        user_txs.sort(key=lambda x: x.timestamp, reverse=True)
        
        if limit:
            user_txs = user_txs[:limit]
        
        return [
            {
                "model_id": tx.model_id,
                "input_tokens": tx.input_tokens,
                "output_tokens": tx.output_tokens,
                "cost_euros": tx.cost_euros,
                "timestamp": tx.timestamp.isoformat(),
                "task_description": tx.task_description
            }
            for tx in user_txs
        ]
    
    def get_total_spent(self, user_id: str) -> float:
        """Get total spent by user (all time)"""
        
        return sum(
            tx.cost_euros
            for tx in self.transactions
            if tx.user_id == user_id
        )
    
    def downgrade_model_if_needed(
        self,
        user_id: str,
        current_model: str,
        min_quality: int = 5
    ) -> str:
        """
        Downgrade model if budget is running low
        
        Args:
            user_id: User identifier
            current_model: Current model ID
            min_quality: Minimum acceptable quality
            
        Returns:
            Recommended model (may be downgraded)
        """
        
        # Check remaining budget
        remaining = self.get_remaining(user_id, BudgetPeriod.DAILY)
        
        if remaining is None:
            return current_model  # No limit
        
        # Get current model price
        current_price = self.pricing_db.get_model_price(current_model)
        if not current_price:
            return current_model
        
        avg_price = (current_price["input"] + current_price["output"]) / 2
        
        # If very low budget, find cheapest model
        if remaining < 0.01:
            return self.pricing_db.get_cheapest_model(
                quality_min=min_quality,
                capabilities=None
            )
        
        # If budget is tight, find cheaper model
        if remaining < 0.05 and avg_price > 0.003:
            cheaper = self.pricing_db.get_cheapest_model(
                quality_min=min_quality,
                capabilities=None
            )
            return cheaper
        
        return current_model
    
    def _get_budget(
        self,
        user_id: str,
        period: BudgetPeriod
    ) -> Optional[BudgetLimit]:
        """Get budget for user and period"""
        
        if user_id not in self.user_budgets:
            return None
        
        return self.user_budgets[user_id].get(period)
    
    def _reset_if_needed(self, user_id: str, period: BudgetPeriod):
        """Reset budget if period has expired"""
        
        budget = self._get_budget(user_id, period)
        if not budget:
            return
        
        now = datetime.now()
        should_reset = False
        
        if period == BudgetPeriod.HOURLY:
            should_reset = (now - budget.last_reset) >= timedelta(hours=1)
        
        elif period == BudgetPeriod.DAILY:
            should_reset = (now - budget.last_reset) >= timedelta(days=1)
        
        elif period == BudgetPeriod.WEEKLY:
            should_reset = (now - budget.last_reset) >= timedelta(weeks=1)
        
        elif period == BudgetPeriod.MONTHLY:
            should_reset = (now - budget.last_reset) >= timedelta(days=30)
        
        # TOTAL never resets
        
        if should_reset:
            budget.current_spend = 0.0
            budget.last_reset = now


# Global instance
budget_engine = BudgetEngine()


# Helper functions
def set_budget(user_id: str, period: BudgetPeriod, limit_euros: float):
    """Set budget limit"""
    budget_engine.set_budget(user_id, period, limit_euros)


def allow(user_id: str, estimated_cost: float, period: BudgetPeriod = BudgetPeriod.DAILY) -> bool:
    """Check if cost is allowed"""
    return budget_engine.allow(user_id, estimated_cost, period)


def add_cost(user_id: str, model_id: str, input_tokens: int, output_tokens: int, task_description: Optional[str] = None) -> float:
    """Add cost"""
    return budget_engine.add_cost(user_id, model_id, input_tokens, output_tokens, task_description)


if __name__ == "__main__":
    # Demo
    print("💰 Budget Engine Demo\n")
    
    # Set budgets
    budget_engine.set_budget("user123", BudgetPeriod.DAILY, 1.0)
    budget_engine.set_budget("user123", BudgetPeriod.MONTHLY, 20.0)
    
    print("1. Budget Status (Initial):")
    status = budget_engine.get_budget_status("user123")
    print(f"   Daily: €{status['daily']['remaining']:.2f} / €{status['daily']['limit']:.2f}")
    print(f"   Monthly: €{status['monthly']['remaining']:.2f} / €{status['monthly']['limit']:.2f}")
    
    print("\n2. Check if cost allowed:")
    can_spend = budget_engine.allow("user123", 0.05, BudgetPeriod.DAILY)
    print(f"   Can spend €0.05? {can_spend}")
    
    print("\n3. Add some costs:")
    cost1 = budget_engine.add_cost("user123", "openai:gpt-4o", 10000, 2000, "Generate code")
    cost2 = budget_engine.add_cost("user123", "anthropic:claude-3-haiku", 5000, 1000, "Review code")
    print(f"   Cost 1: €{cost1:.4f}")
    print(f"   Cost 2: €{cost2:.4f}")
    
    print("\n4. Budget Status (After spending):")
    status = budget_engine.get_budget_status("user123")
    print(f"   Daily: €{status['daily']['spent']:.4f} / €{status['daily']['limit']:.2f} ({status['daily']['percentage_used']:.1f}%)")
    print(f"   Remaining: €{status['daily']['remaining']:.4f}")
    
    print("\n5. Transaction History:")
    txs = budget_engine.get_transactions("user123", limit=5)
    for tx in txs:
        print(f"   {tx['model_id']}: €{tx['cost_euros']:.4f} - {tx['task_description']}")
    
    print("\n6. Model Downgrade Check:")
    current = "openai:gpt-5.1"
    recommended = budget_engine.downgrade_model_if_needed("user123", current)
    print(f"   Current: {current}")
    print(f"   Recommended: {recommended}")
