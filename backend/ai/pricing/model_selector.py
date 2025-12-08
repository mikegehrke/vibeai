#!/usr/bin/env python3
"""
⭐ BLOCK B — MODEL SELECTOR
Intelligent model selection based on Quality vs Price vs Speed
"""

from dataclasses import dataclass
from enum import Enum
from typing import Dict, List, Optional

from .pricing_table import MODEL_PRICING, ModelCapability, ModelSpeed, pricing_db


class OptimizationStrategy(Enum):
    """Optimization strategy"""

    CHEAPEST = "cheapest"  # Minimize cost
    FASTEST = "fastest"  # Minimize latency
    BEST_QUALITY = "best_quality"  # Maximize quality
    BALANCED = "balanced"  # Balance all factors
    COST_PERFORMANCE = "cost_performance"  # Best quality per €


@dataclass
class SelectionCriteria:
    """Model selection criteria"""

    strategy: OptimizationStrategy = OptimizationStrategy.BALANCED
    min_quality: int = 5
    max_price_per_1k: Optional[float] = None
    required_capabilities: Optional[List[ModelCapability]] = None
    min_context_window: Optional[int] = None
    max_latency_ms: Optional[int] = None
    preferred_providers: Optional[List[str]] = None
    excluded_providers: Optional[List[str]] = None


@dataclass
class ModelScore:
    """Model scoring result"""

    model_id: str
    total_score: float
    quality_score: float
    price_score: float
    speed_score: float
    details: Dict


class ModelSelector:
    """Intelligent model selector"""

    def __init__(self):
        self.pricing_db = pricing_db

    def select_model(self, criteria: SelectionCriteria) -> str:
        """
        Select best model based on criteria

        Args:
            criteria: Selection criteria

        Returns:
            Model ID of best match
        """

        if criteria.strategy == OptimizationStrategy.CHEAPEST:
            return self._select_cheapest(criteria)

        elif criteria.strategy == OptimizationStrategy.FASTEST:
            return self._select_fastest(criteria)

        elif criteria.strategy == OptimizationStrategy.BEST_QUALITY:
            return self._select_best_quality(criteria)

        elif criteria.strategy == OptimizationStrategy.COST_PERFORMANCE:
            return self._select_cost_performance(criteria)

        else:  # BALANCED
            return self._select_balanced(criteria)

    def _select_cheapest(self, criteria: SelectionCriteria) -> str:
        """Select cheapest model meeting requirements"""

        candidates = self._filter_candidates(criteria)
        if not candidates:
            return "openai:gpt-4o-mini"

        # Sort by average price
        candidates.sort(key=lambda x: (x["input"] + x["output"]) / 2)
        return candidates[0]["model_id"]

    def _select_fastest(self, criteria: SelectionCriteria) -> str:
        """Select fastest model meeting requirements"""

        candidates = self._filter_candidates(criteria)
        if not candidates:
            return "groq:llama3-70b"

        # Speed ranking
        speed_scores = {
            ModelSpeed.VERY_FAST: 4,
            ModelSpeed.FAST: 3,
            ModelSpeed.MEDIUM: 2,
            ModelSpeed.SLOW: 1,
        }

        # Sort by speed score, then latency
        candidates.sort(
            key=lambda x: (
                -speed_scores.get(x["speed"], 0),
                self.pricing_db.get_provider_latency(x["provider"]),
            )
        )

        return candidates[0]["model_id"]

    def _select_best_quality(self, criteria: SelectionCriteria) -> str:
        """Select highest quality model meeting requirements"""

        candidates = self._filter_candidates(criteria)
        if not candidates:
            return "openai:gpt-5.1"

        # Sort by quality (descending)
        candidates.sort(key=lambda x: -x["quality"])
        return candidates[0]["model_id"]

    def _select_cost_performance(self, criteria: SelectionCriteria) -> str:
        """Select best quality per euro"""

        candidates = self._filter_candidates(criteria)
        if not candidates:
            return "anthropic:claude-3.5-sonnet"

        # Calculate quality per euro
        scored = []
        for c in candidates:
            avg_price = (c["input"] + c["output"]) / 2
            if avg_price > 0:
                score = c["quality"] / avg_price
            else:
                score = c["quality"] * 1000  # Free models get bonus
            scored.append((c["model_id"], score))

        # Sort by score (descending)
        scored.sort(key=lambda x: -x[1])
        return scored[0][0]

    def _select_balanced(self, criteria: SelectionCriteria) -> str:
        """Select balanced model (quality + speed + price)"""

        candidates = self._filter_candidates(criteria)
        if not candidates:
            return "openai:gpt-4o"

        # Calculate composite score
        scored = []
        for c in candidates:
            score = self._calculate_composite_score(c, criteria)
            scored.append((c["model_id"], score))

        # Sort by score (descending)
        scored.sort(key=lambda x: -x[1])
        return scored[0][0]

    def _calculate_composite_score(self, model_data: Dict, criteria: SelectionCriteria) -> float:
        """Calculate composite score for balanced selection"""

        # Quality score (0-100)
        quality_score = model_data["quality"] * 10

        # Price score (0-100, inverted - cheaper is better)
        avg_price = (model_data["input"] + model_data["output"]) / 2
        max_price = 0.03  # Reference max price
        if avg_price == 0:
            price_score = 100  # Free is best
        else:
            price_score = max(0, 100 - (avg_price / max_price * 100))

        # Speed score (0-100)
        speed_scores = {
            ModelSpeed.VERY_FAST: 100,
            ModelSpeed.FAST: 75,
            ModelSpeed.MEDIUM: 50,
            ModelSpeed.SLOW: 25,
        }
        speed_score = speed_scores.get(model_data["speed"], 50)

        # Provider health score (0-100)
        provider = model_data["provider"]
        if self.pricing_db.is_provider_healthy(provider):
            health_score = 100
        else:
            health_score = 0

        # Weighted average
        weights = {"quality": 0.4, "price": 0.3, "speed": 0.2, "health": 0.1}

        total = (
            quality_score * weights["quality"]
            + price_score * weights["price"]
            + speed_score * weights["speed"]
            + health_score * weights["health"]
        )

        return total

    def _filter_candidates(self, criteria: SelectionCriteria) -> List[Dict]:
        """Filter models based on criteria"""

        candidates = []

        for model_id, data in MODEL_PRICING.items():
            # Check quality
            if data["quality"] < criteria.min_quality:
                continue

            # Check price
            if criteria.max_price_per_1k:
                avg_price = (data["input"] + data["output"]) / 2
                if avg_price > criteria.max_price_per_1k:
                    continue

            # Check capabilities
            if criteria.required_capabilities:
                model_caps = set(data["capabilities"])
                required_caps = set(criteria.required_capabilities)
                if not required_caps.issubset(model_caps):
                    continue

            # Check context window
            if criteria.min_context_window:
                if data["context_window"] < criteria.min_context_window:
                    continue

            # Check latency
            if criteria.max_latency_ms:
                provider_latency = self.pricing_db.get_provider_latency(data["provider"])
                if provider_latency > criteria.max_latency_ms:
                    continue

            # Check provider preferences
            if criteria.preferred_providers:
                if data["provider"] not in criteria.preferred_providers:
                    continue

            # Check provider exclusions
            if criteria.excluded_providers:
                if data["provider"] in criteria.excluded_providers:
                    continue

            # Check provider health
            if not self.pricing_db.is_provider_healthy(data["provider"]):
                continue

            # Add to candidates
            candidates.append({"model_id": model_id, **data})

        return candidates

    def score_all_models(self, criteria: SelectionCriteria) -> List[ModelScore]:
        """Score all models based on criteria"""

        candidates = self._filter_candidates(criteria)
        scores = []

        for c in candidates:
            # Calculate individual scores
            quality_score = c["quality"] * 10

            avg_price = (c["input"] + c["output"]) / 2
            if avg_price == 0:
                price_score = 100
            else:
                price_score = max(0, 100 - (avg_price / 0.03 * 100))

            speed_scores_map = {
                ModelSpeed.VERY_FAST: 100,
                ModelSpeed.FAST: 75,
                ModelSpeed.MEDIUM: 50,
                ModelSpeed.SLOW: 25,
            }
            speed_score = speed_scores_map.get(c["speed"], 50)

            # Total score
            total = quality_score * 0.4 + price_score * 0.3 + speed_score * 0.3

            score = ModelScore(
                model_id=c["model_id"],
                total_score=total,
                quality_score=quality_score,
                price_score=price_score,
                speed_score=speed_score,
                details={
                    "quality": c["quality"],
                    "input_price": c["input"],
                    "output_price": c["output"],
                    "speed": c["speed"].value,
                    "provider": c["provider"],
                },
            )
            scores.append(score)

        # Sort by total score
        scores.sort(key=lambda x: -x.total_score)

        return scores

    def compare_models(self, model_ids: List[str]) -> Dict:
        """Compare multiple models"""

        comparison = {
            "models": {},
            "winner": {
                "cheapest": None,
                "fastest": None,
                "best_quality": None,
                "best_value": None,
            },
        }

        for model_id in model_ids:
            data = MODEL_PRICING.get(model_id)
            if not data:
                continue

            avg_price = (data["input"] + data["output"]) / 2

            comparison["models"][model_id] = {
                "quality": data["quality"],
                "avg_price": avg_price,
                "speed": data["speed"].value,
                "provider": data["provider"],
                "capabilities": [c.value for c in data["capabilities"]],
            }

            # Track winners
            if not comparison["winner"]["cheapest"]:
                comparison["winner"]["cheapest"] = model_id
            elif avg_price < comparison["models"][comparison["winner"]["cheapest"]]["avg_price"]:
                comparison["winner"]["cheapest"] = model_id

            if not comparison["winner"]["best_quality"]:
                comparison["winner"]["best_quality"] = model_id
            elif data["quality"] > comparison["models"][comparison["winner"]["best_quality"]]["quality"]:
                comparison["winner"]["best_quality"] = model_id

        # Calculate best value (quality per euro)
        for model_id in comparison["models"]:
            model = comparison["models"][model_id]
            if model["avg_price"] > 0:
                value = model["quality"] / model["avg_price"]
            else:
                value = model["quality"] * 1000

            if not comparison["winner"]["best_value"]:
                comparison["winner"]["best_value"] = model_id
            else:
                best_value_model = comparison["models"][comparison["winner"]["best_value"]]
                if best_value_model["avg_price"] > 0:
                    best_value = best_value_model["quality"] / best_value_model["avg_price"]
                else:
                    best_value = best_value_model["quality"] * 1000

                if value > best_value:
                    comparison["winner"]["best_value"] = model_id

        return comparison

    def recommend_for_task(self, task_type: str, budget: Optional[float] = None) -> str:
        """Recommend model for specific task type"""

        task_requirements = {
            "code_generation": SelectionCriteria(
                strategy=OptimizationStrategy.BEST_QUALITY,
                min_quality=8,
                required_capabilities=[ModelCapability.CODE],
                max_price_per_1k=budget,
            ),
            "chat": SelectionCriteria(
                strategy=OptimizationStrategy.BALANCED,
                min_quality=7,
                required_capabilities=[ModelCapability.TEXT],
                max_price_per_1k=budget,
            ),
            "quick_response": SelectionCriteria(
                strategy=OptimizationStrategy.FASTEST,
                min_quality=6,
                max_latency_ms=800,
                max_price_per_1k=budget,
            ),
            "analysis": SelectionCriteria(
                strategy=OptimizationStrategy.BEST_QUALITY,
                min_quality=9,
                min_context_window=50000,
                max_price_per_1k=budget,
            ),
            "bulk_processing": SelectionCriteria(
                strategy=OptimizationStrategy.CHEAPEST,
                min_quality=5,
                max_price_per_1k=budget or 0.002,
            ),
        }

        criteria = task_requirements.get(task_type, SelectionCriteria(strategy=OptimizationStrategy.BALANCED))

        return self.select_model(criteria)


# Global instance
model_selector = ModelSelector()


# Helper functions
def select_model(criteria: SelectionCriteria) -> str:
    """Select best model"""
    return model_selector.select_model(criteria)


def recommend_for_task(task_type: str, budget: Optional[float] = None) -> str:
    """Recommend model for task"""
    return model_selector.recommend_for_task(task_type, budget)


def compare_models(model_ids: List[str]) -> Dict:
    """Compare models"""
    return model_selector.compare_models(model_ids)


if __name__ == "__main__":
    # Demo
    print("🎯 Model Selector Demo\n")

    print("1. Cheapest model (Quality ≥ 7):")
    criteria = SelectionCriteria(strategy=OptimizationStrategy.CHEAPEST, min_quality=7)
    model = select_model(criteria)
    print(f"   → {model}\n")

    print("2. Best quality (Max €0.005/1K):")
    criteria = SelectionCriteria(strategy=OptimizationStrategy.BEST_QUALITY, max_price_per_1k=0.005)
    model = select_model(criteria)
    print(f"   → {model}\n")

    print("3. Balanced (Code + Vision):")
    criteria = SelectionCriteria(
        strategy=OptimizationStrategy.BALANCED,
        min_quality=8,
        required_capabilities=[ModelCapability.CODE, ModelCapability.VISION],
    )
    model = select_model(criteria)
    print(f"   → {model}\n")

    print("4. Task Recommendations:")
    print(f"   Code Generation: {recommend_for_task('code_generation')}")
    print(f"   Quick Chat: {recommend_for_task('quick_response')}")
    print(f"   Analysis: {recommend_for_task('analysis')}")
    print(f"   Bulk Processing: {recommend_for_task('bulk_processing', budget=0.001)}\n")

    print("5. Model Comparison:")
    comparison = compare_models(["openai:gpt-5.1", "anthropic:claude-3.5-sonnet", "google:gemini-2.0-flash"])
    print(f"   Cheapest: {comparison['winner']['cheapest']}")
    print(f"   Best Quality: {comparison['winner']['best_quality']}")
    print(f"   Best Value: {comparison['winner']['best_value']}")