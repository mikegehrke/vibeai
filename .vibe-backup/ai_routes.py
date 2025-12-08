#!/usr/bin/env python3
"""
AI Intelligence System - API Routes
Blocks A-F Integration
"""

from typing import Any, Dict, List, Optional

from ai.agent_dispatcher import AgentType, agent_dispatcher
from ai.benchmark.benchmark_engine import benchmark_engine
from ai.budget.budget_engine import BudgetPeriod, budget_engine
from ai.fallback.fallback_system import fallback_system
from ai.model_selector import OptimizationStrategy, SelectionCriteria, model_selector
from ai.pricing.pricing_table import MODEL_PRICING, PROVIDER_STATUS, pricing_db
from ai.providers.model_clients import call_model_with_metadata
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter(prefix="/ai-intelligence", tags=["AI Intelligence"])

# ==================== Pydantic Models ====================


class ModelSelectionRequest(BaseModel):
    strategy: str = "balanced"
    min_quality: int = 5
    max_price_per_1k: Optional[float] = None
    required_capabilities: Optional[List[str]] = None
    min_context_window: Optional[int] = None
    max_latency_ms: Optional[int] = None


class AgentDispatchRequest(BaseModel):
    agent_type: str
    task: str
    max_cost: Optional[float] = None
    quality: Optional[int] = None
    speed: bool = False


class TeamDispatchRequest(BaseModel):
    tasks: List[Dict[str, Any]]
    max_total_cost: Optional[float] = None


class BudgetSetRequest(BaseModel):
    user_id: str
    period: str
    limit_euros: float


class AICallRequest(BaseModel):
    model_id: str
    prompt: str
    user_id: Optional[str] = None
    max_retries: int = 3


class BenchmarkRequest(BaseModel):
    model_id: Optional[str] = None
    num_iterations: int = 3


# ==================== Pricing Endpoints ====================


@router.get("/pricing/models")
async def get_all_models():
    """Get all available models with pricing"""
    return {"total_models": len(MODEL_PRICING), "models": MODEL_PRICING}


@router.get("/pricing/models/{model_id}")
async def get_model_pricing(model_id: str):
    """Get pricing for specific model"""
    price = pricing_db.get_model_price(model_id)
    if not price:
        raise HTTPException(status_code=404, detail="Model not found")
    return price


@router.get("/pricing/providers")
async def get_all_providers():
    """Get all provider status"""
    return {"total_providers": len(PROVIDER_STATUS), "providers": PROVIDER_STATUS}


@router.get("/pricing/cheapest")
async def get_cheapest_model(quality_min: int = 5):
    """Get cheapest model meeting quality requirement"""
    model = pricing_db.get_cheapest_model(quality_min=quality_min)
    return {"model_id": model, "details": pricing_db.get_model_price(model)}


@router.get("/pricing/fastest")
async def get_fastest_model(quality_min: int = 5):
    """Get fastest model meeting quality requirement"""
    model = pricing_db.get_fastest_model(quality_min=quality_min)
    return {"model_id": model, "details": pricing_db.get_model_price(model)}


@router.get("/pricing/best-quality")
async def get_best_quality_model(max_price: Optional[float] = None):
    """Get highest quality model within budget"""
    model = pricing_db.get_best_quality_model(max_price=max_price)
    return {"model_id": model, "details": pricing_db.get_model_price(model)}


@router.post("/pricing/calculate-cost")
async def calculate_cost(model_id: str, input_tokens: int, output_tokens: int):
    """Calculate cost for request"""
    cost = pricing_db.calculate_cost(model_id, input_tokens, output_tokens)
    return {
        "model_id": model_id,
        "input_tokens": input_tokens,
        "output_tokens": output_tokens,
        "cost_euros": cost,
    }


# ==================== Model Selector Endpoints ====================


@router.post("/selector/select")
async def select_model(request: ModelSelectionRequest):
    """Select best model based on criteria"""

    strategy_map = {
        "cheapest": OptimizationStrategy.CHEAPEST,
        "fastest": OptimizationStrategy.FASTEST,
        "best_quality": OptimizationStrategy.BEST_QUALITY,
        "balanced": OptimizationStrategy.BALANCED,
        "cost_performance": OptimizationStrategy.COST_PERFORMANCE,
    }

    criteria = SelectionCriteria(
        strategy=strategy_map.get(request.strategy, OptimizationStrategy.BALANCED),
        min_quality=request.min_quality,
        max_price_per_1k=request.max_price_per_1k,
        min_context_window=request.min_context_window,
        max_latency_ms=request.max_latency_ms,
    )

    model = model_selector.select_model(criteria)

    return {
        "model_id": model,
        "criteria": {
            "strategy": request.strategy,
            "min_quality": request.min_quality,
            "max_price_per_1k": request.max_price_per_1k,
        },
        "details": pricing_db.get_model_price(model),
    }


@router.get("/selector/recommend/{task_type}")
async def recommend_for_task(task_type: str, budget: Optional[float] = None):
    """Recommend model for specific task type"""
    model = model_selector.recommend_for_task(task_type, budget)
    return {
        "task_type": task_type,
        "budget": budget,
        "recommended_model": model,
        "details": pricing_db.get_model_price(model),
    }


@router.post("/selector/compare")
async def compare_models(model_ids: List[str]):
    """Compare multiple models"""
    comparison = model_selector.compare_models(model_ids)
    return comparison


# ==================== Agent Dispatcher Endpoints ====================


@router.get("/agents/all")
async def get_all_agents():
    """Get all available agents"""
    return agent_dispatcher.get_all_agents_info()


@router.get("/agents/{agent_type}")
async def get_agent_info(agent_type: str):
    """Get info for specific agent"""
    try:
        agent_enum = AgentType(agent_type)
        return agent_dispatcher.get_agent_info(agent_enum)
    except ValueError:
        raise HTTPException(status_code=404, detail="Agent type not found")


@router.post("/agents/dispatch")
async def dispatch_agent(request: AgentDispatchRequest):
    """Dispatch task to agent"""
    try:
        agent_enum = AgentType(request.agent_type)
        result = agent_dispatcher.dispatch(
            agent_type=agent_enum,
            task=request.task,
            max_cost=request.max_cost,
            quality=request.quality,
            speed=request.speed,
        )
        return result
    except ValueError:
        raise HTTPException(status_code=404, detail="Agent type not found")


@router.post("/agents/dispatch-team")
async def dispatch_team(request: TeamDispatchRequest):
    """Dispatch tasks to team of agents"""

    # Convert agent_type strings to enums
    tasks = []
    for task in request.tasks:
        try:
            task_copy = task.copy()
            task_copy["agent_type"] = AgentType(task["agent_type"])
            tasks.append(task_copy)
        except (ValueError, KeyError):
            continue

    results = agent_dispatcher.dispatch_team(tasks, max_total_cost=request.max_total_cost)
    return {"total_tasks": len(tasks), "results": results}


@router.get("/agents/recommend")
async def recommend_agent(task_description: str):
    """Recommend agent for task"""
    agent = agent_dispatcher.get_recommended_agent(task_description)
    return {
        "task_description": task_description,
        "recommended_agent": agent.value,
        "agent_info": agent_dispatcher.get_agent_info(agent),
    }


@router.get("/agents/history")
async def get_agent_history(limit: Optional[int] = 10):
    """Get agent task history"""
    history = agent_dispatcher.get_task_history(limit=limit)
    return {"total": len(history), "history": history}


# ==================== Budget Engine Endpoints ====================


@router.post("/budget/set")
async def set_budget(request: BudgetSetRequest):
    """Set budget limit for user"""

    period_map = {
        "hourly": BudgetPeriod.HOURLY,
        "daily": BudgetPeriod.DAILY,
        "weekly": BudgetPeriod.WEEKLY,
        "monthly": BudgetPeriod.MONTHLY,
        "total": BudgetPeriod.TOTAL,
    }

    period = period_map.get(request.period)
    if not period:
        raise HTTPException(status_code=400, detail="Invalid period")

    budget_engine.set_budget(request.user_id, period, request.limit_euros)

    return {
        "user_id": request.user_id,
        "period": request.period,
        "limit_euros": request.limit_euros,
    }


@router.get("/budget/status/{user_id}")
async def get_budget_status(user_id: str):
    """Get budget status for user"""
    status = budget_engine.get_budget_status(user_id)
    return status


@router.get("/budget/transactions/{user_id}")
async def get_transactions(user_id: str, limit: Optional[int] = 10):
    """Get transaction history"""
    transactions = budget_engine.get_transactions(user_id, limit=limit)
    return {
        "user_id": user_id,
        "total_transactions": len(transactions),
        "transactions": transactions,
    }


@router.get("/budget/total-spent/{user_id}")
async def get_total_spent(user_id: str):
    """Get total spent by user"""
    total = budget_engine.get_total_spent(user_id)
    return {"user_id": user_id, "total_spent_euros": total}


@router.post("/budget/check-allow")
async def check_allow(user_id: str, estimated_cost: float, period: str = "daily"):
    """Check if user can spend estimated cost"""

    period_map = {
        "hourly": BudgetPeriod.HOURLY,
        "daily": BudgetPeriod.DAILY,
        "weekly": BudgetPeriod.WEEKLY,
        "monthly": BudgetPeriod.MONTHLY,
        "total": BudgetPeriod.TOTAL,
    }

    period_enum = period_map.get(period, BudgetPeriod.DAILY)
    allowed = budget_engine.allow(user_id, estimated_cost, period_enum)

    return {
        "user_id": user_id,
        "estimated_cost": estimated_cost,
        "period": period,
        "allowed": allowed,
        "remaining_budget": budget_engine.get_remaining(user_id, period_enum),
    }


# ==================== Fallback System Endpoints ====================


@router.get("/fallback/providers")
async def get_provider_status():
    """Get all provider status"""
    return fallback_system.get_all_provider_status()


@router.get("/fallback/providers/{provider}")
async def get_specific_provider_status(provider: str):
    """Get specific provider status"""
    status = fallback_system.get_provider_status(provider)
    if not status:
        raise HTTPException(status_code=404, detail="Provider not found")
    return status


@router.get("/fallback/chain")
async def get_fallback_chain():
    """Get current fallback chain"""
    chain = fallback_system.get_fallback_chain()
    return {"fallback_chain": chain}


@router.post("/fallback/chain")
async def set_fallback_chain(providers: List[str]):
    """Set custom fallback chain"""
    fallback_system.set_fallback_chain(providers)
    return {"fallback_chain": providers}


@router.get("/fallback/health/{provider}")
async def check_provider_health(provider: str):
    """Check if provider is healthy"""
    healthy = fallback_system.is_provider_healthy(provider)
    return {
        "provider": provider,
        "healthy": healthy,
        "status": fallback_system.get_provider_status(provider),
    }


# ==================== Benchmark Endpoints ====================


@router.post("/benchmark/run")
async def run_benchmark(request: BenchmarkRequest):
    """Run benchmark for model(s)"""

    if request.model_id:
        # Single model
        result = benchmark_engine.run(request.model_id, num_iterations=request.num_iterations)
        return {
            "model_id": result.model_id,
            "avg_latency_ms": result.avg_latency_ms,
            "quality_score": result.quality_score,
            "success_rate": result.success_rate,
            "cost": result.actual_cost,
            "timestamp": result.timestamp.isoformat(),
        }
    else:
        # All models
        results = benchmark_engine.run_all_models(num_iterations=request.num_iterations)
        return {
            "total_models": len(results),
            "results": {
                model_id: {
                    "avg_latency_ms": result.avg_latency_ms,
                    "quality_score": result.quality_score,
                    "success_rate": result.success_rate,
                }
                for model_id, result in results.items()
            },
        }


@router.get("/benchmark/ranking")
async def get_model_ranking():
    """Get overall model ranking"""
    ranking = benchmark_engine.get_ranking()
    return {"total_models": len(ranking), "ranking": ranking}


@router.get("/benchmark/best")
async def get_best_models(metric: str = "quality_score", limit: int = 5):
    """Get best models by metric"""
    best = benchmark_engine.get_best_models(metric=metric, limit=limit)
    return {"metric": metric, "limit": limit, "models": best}


@router.get("/benchmark/history/{model_id}")
async def get_benchmark_history(model_id: str, limit: Optional[int] = 10):
    """Get benchmark history for model"""
    history = benchmark_engine.get_benchmark_history(model_id, limit=limit)

    return {
        "model_id": model_id,
        "total_benchmarks": len(history),
        "history": [
            {
                "avg_latency_ms": r.avg_latency_ms,
                "quality_score": r.quality_score,
                "success_rate": r.success_rate,
                "timestamp": r.timestamp.isoformat(),
            }
            for r in history
        ],
    }


@router.post("/benchmark/compare")
async def compare_benchmark_results(model_ids: List[str]):
    """Compare benchmark results"""
    comparison = benchmark_engine.compare_models(model_ids)
    return comparison


# ==================== AI Call Endpoint (All-in-One) ====================


@router.post("/call")
async def call_ai(request: AICallRequest):
    """
    Call AI model with full intelligence system
    - Automatic fallback
    - Budget tracking
    - Cost calculation
    """

    # Check budget if user_id provided
    if request.user_id:
        # Estimate cost
        estimated_cost = pricing_db.calculate_cost(
            model_id=request.model_id,
            input_tokens=len(request.prompt.split()) * 1.3,
            output_tokens=500,  # Estimate
        )

        allowed = budget_engine.allow(request.user_id, estimated_cost)
        if not allowed:
            raise HTTPException(status_code=402, detail="Budget limit exceeded")

    # Call model with fallback
    try:
        result = call_model_with_metadata(
            model_id=request.model_id,
            prompt=request.prompt,
            max_retries=request.max_retries,
        )

        # Track cost if user_id provided
        if request.user_id and result["success"]:
            output_length = len(result["result"]) if result.get("result") else 0
            output_tokens = output_length / 4  # Rough estimate
            input_tokens = len(request.prompt.split()) * 1.3

            actual_cost = budget_engine.add_cost(
                user_id=request.user_id,
                model_id=result.get("model_used", request.model_id),
                input_tokens=int(input_tokens),
                output_tokens=int(output_tokens),
                task_description=request.prompt[:100],
            )

            result["cost_euros"] = actual_cost

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== System Stats Endpoint ====================


@router.get("/stats")
async def get_system_stats():
    """Get overall system statistics"""

    return {
        "pricing": {
            "total_models": len(MODEL_PRICING),
            "total_providers": len(PROVIDER_STATUS),
            "cheapest_model": pricing_db.get_cheapest_model(quality_min=5),
            "fastest_model": pricing_db.get_fastest_model(quality_min=5),
        },
        "agents": {
            "total_agents": len(AgentType),
            "available_agents": [a.value for a in AgentType],
        },
        "fallback": {
            "fallback_chain": fallback_system.get_fallback_chain(),
            "healthy_providers": [
                p for p in fallback_system.get_all_provider_status().keys() if fallback_system.is_provider_healthy(p)
            ],
        },
        "benchmark": {
            "total_benchmarks": len(benchmark_engine.benchmark_history),
            "top_3_models": benchmark_engine.get_best_models(limit=3),
        },
    }
