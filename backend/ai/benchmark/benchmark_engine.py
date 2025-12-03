#!/usr/bin/env python3
"""
⭐ BLOCK F — AUTOMATIC MODEL BENCHMARKING
Measures speed, cost, and quality to update rankings
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import time
import statistics

from ai.pricing.pricing_table import MODEL_PRICING, pricing_db


@dataclass
class BenchmarkResult:
    """Benchmark result for a model"""
    model_id: str
    timestamp: datetime
    avg_latency_ms: float
    min_latency_ms: float
    max_latency_ms: float
    success_rate: float
    quality_score: float
    actual_cost: float
    estimated_cost: float
    cost_accuracy: float


class BenchmarkEngine:
    """Automatic model benchmarking engine"""
    
    def __init__(self):
        self.test_prompts = [
            "Erkläre das Konzept von async/await in JavaScript.",
            "Schreibe eine React Component für einen Counter.",
            "Analysiere diesen Fehler: TypeError: undefined is not a function.",
            "Erstelle eine SQL-Query für User-Analytics.",
            "Wie optimiere ich die Performance einer Flutter App?",
            "Schreibe einen Unit-Test für eine Login-Funktion.",
            "Was sind die Best Practices für REST API Design?",
            "Erkläre das Singleton Design Pattern mit Beispiel."
        ]
        
        self.benchmark_history: Dict[str, List[BenchmarkResult]] = {}
    
    def run(
        self,
        model_id: str,
        call_fn: Optional[callable] = None,
        num_iterations: int = 3
    ) -> BenchmarkResult:
        """
        Run benchmark for a model
        
        Args:
            model_id: Model to benchmark
            call_fn: Optional function to call the model
            num_iterations: Number of test iterations
            
        Returns:
            BenchmarkResult
        """
        
        latencies = []
        successes = 0
        total_tests = 0
        quality_scores = []
        actual_costs = []
        estimated_costs = []
        
        # Select random prompts for this run
        import random
        test_prompts = random.sample(self.test_prompts, min(num_iterations, len(self.test_prompts)))
        
        for prompt in test_prompts:
            total_tests += 1
            
            try:
                start_time = time.time()
                
                # Call model (if call_fn provided)
                if call_fn:
                    result = call_fn(model_id, prompt)
                    output_length = len(result) if result else 0
                else:
                    # Simulate call
                    time.sleep(0.1)
                    output_length = 100
                
                latency_ms = (time.time() - start_time) * 1000
                latencies.append(latency_ms)
                
                # Quality score (1-10 based on output length)
                if output_length > 200:
                    quality = 10
                elif output_length > 100:
                    quality = 8
                elif output_length > 50:
                    quality = 6
                elif output_length > 10:
                    quality = 4
                else:
                    quality = 2
                
                quality_scores.append(quality)
                successes += 1
                
                # Calculate actual cost
                input_tokens = len(prompt.split()) * 1.3  # Rough estimate
                output_tokens = output_length / 4  # Rough estimate
                
                actual_cost = pricing_db.calculate_cost(
                    model_id=model_id,
                    input_tokens=int(input_tokens),
                    output_tokens=int(output_tokens)
                )
                actual_costs.append(actual_cost)
                
                # Estimated cost
                estimated_cost = pricing_db.calculate_cost(
                    model_id=model_id,
                    input_tokens=int(input_tokens),
                    output_tokens=int(output_tokens)
                )
                estimated_costs.append(estimated_cost)
            
            except Exception as e:
                # Failed test
                quality_scores.append(0)
                continue
        
        # Calculate results
        success_rate = (successes / total_tests * 100) if total_tests > 0 else 0
        
        avg_latency = statistics.mean(latencies) if latencies else 0
        min_latency = min(latencies) if latencies else 0
        max_latency = max(latencies) if latencies else 0
        
        avg_quality = statistics.mean(quality_scores) if quality_scores else 0
        
        total_actual_cost = sum(actual_costs) if actual_costs else 0
        total_estimated_cost = sum(estimated_costs) if estimated_costs else 0
        
        cost_accuracy = (
            (1 - abs(total_actual_cost - total_estimated_cost) / total_estimated_cost * 100)
            if total_estimated_cost > 0 else 100
        )
        
        result = BenchmarkResult(
            model_id=model_id,
            timestamp=datetime.now(),
            avg_latency_ms=avg_latency,
            min_latency_ms=min_latency,
            max_latency_ms=max_latency,
            success_rate=success_rate,
            quality_score=avg_quality,
            actual_cost=total_actual_cost,
            estimated_cost=total_estimated_cost,
            cost_accuracy=cost_accuracy
        )
        
        # Store in history
        if model_id not in self.benchmark_history:
            self.benchmark_history[model_id] = []
        self.benchmark_history[model_id].append(result)
        
        return result
    
    def run_all_models(
        self,
        call_fn: Optional[callable] = None,
        num_iterations: int = 3
    ) -> Dict[str, BenchmarkResult]:
        """Run benchmark for all models"""
        
        results = {}
        
        for model_id in MODEL_PRICING.keys():
            try:
                result = self.run(model_id, call_fn, num_iterations)
                results[model_id] = result
            except Exception as e:
                print(f"Failed to benchmark {model_id}: {e}")
                continue
        
        return results
    
    def get_benchmark_history(
        self,
        model_id: str,
        limit: Optional[int] = None
    ) -> List[BenchmarkResult]:
        """Get benchmark history for a model"""
        
        history = self.benchmark_history.get(model_id, [])
        
        if limit:
            return history[-limit:]
        
        return history
    
    def get_best_models(
        self,
        metric: str = "quality_score",
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Get best models by metric
        
        Args:
            metric: 'quality_score', 'avg_latency_ms', 'success_rate', 'cost_accuracy'
            limit: Number of results
            
        Returns:
            List of top models
        """
        
        # Get latest benchmark for each model
        latest_benchmarks = []
        
        for model_id, history in self.benchmark_history.items():
            if history:
                latest = history[-1]
                latest_benchmarks.append({
                    "model_id": model_id,
                    "quality_score": latest.quality_score,
                    "avg_latency_ms": latest.avg_latency_ms,
                    "success_rate": latest.success_rate,
                    "cost_accuracy": latest.cost_accuracy,
                    "timestamp": latest.timestamp.isoformat()
                })
        
        # Sort by metric
        reverse = metric != "avg_latency_ms"  # Lower latency is better
        
        latest_benchmarks.sort(
            key=lambda x: x.get(metric, 0),
            reverse=reverse
        )
        
        return latest_benchmarks[:limit]
    
    def compare_models(
        self,
        model_ids: List[str]
    ) -> Dict[str, Any]:
        """Compare benchmark results for multiple models"""
        
        comparison = {}
        
        for model_id in model_ids:
            history = self.get_benchmark_history(model_id, limit=1)
            
            if history:
                latest = history[0]
                comparison[model_id] = {
                    "quality_score": latest.quality_score,
                    "avg_latency_ms": latest.avg_latency_ms,
                    "success_rate": latest.success_rate,
                    "actual_cost": latest.actual_cost,
                    "timestamp": latest.timestamp.isoformat()
                }
            else:
                comparison[model_id] = None
        
        return comparison
    
    def get_ranking(self) -> List[Dict[str, Any]]:
        """Get overall model ranking"""
        
        rankings = []
        
        for model_id, history in self.benchmark_history.items():
            if not history:
                continue
            
            latest = history[-1]
            
            # Composite score
            # Quality: 40%, Speed: 30%, Reliability: 20%, Cost: 10%
            normalized_speed = max(0, 100 - (latest.avg_latency_ms / 20))  # Lower is better
            
            composite_score = (
                latest.quality_score * 10 * 0.4 +
                normalized_speed * 0.3 +
                latest.success_rate * 0.2 +
                latest.cost_accuracy * 0.1
            )
            
            rankings.append({
                "model_id": model_id,
                "composite_score": composite_score,
                "quality": latest.quality_score,
                "speed": latest.avg_latency_ms,
                "reliability": latest.success_rate,
                "cost_accuracy": latest.cost_accuracy
            })
        
        # Sort by composite score
        rankings.sort(key=lambda x: x["composite_score"], reverse=True)
        
        return rankings
    
    def update_pricing_table(self):
        """Update pricing table with benchmark data"""
        
        from ai.pricing.pricing_table import PROVIDER_STATUS
        
        for model_id, history in self.benchmark_history.items():
            if not history:
                continue
            
            latest = history[-1]
            provider = model_id.split(":")[0]
            
            if provider in PROVIDER_STATUS:
                # Update latency
                PROVIDER_STATUS[provider]["avg_latency_ms"] = int(latest.avg_latency_ms)
                
                # Update status based on success rate
                if latest.success_rate >= 95:
                    PROVIDER_STATUS[provider]["status"] = "operational"
                elif latest.success_rate >= 80:
                    PROVIDER_STATUS[provider]["status"] = "degraded"
                else:
                    PROVIDER_STATUS[provider]["status"] = "down"


# Global instance
benchmark_engine = BenchmarkEngine()


# Helper functions
def run_benchmark(model_id: str, call_fn: Optional[callable] = None, num_iterations: int = 3) -> BenchmarkResult:
    """Run benchmark"""
    return benchmark_engine.run(model_id, call_fn, num_iterations)


def get_best_models(metric: str = "quality_score", limit: int = 5) -> List[Dict[str, Any]]:
    """Get best models"""
    return benchmark_engine.get_best_models(metric, limit)


def get_ranking() -> List[Dict[str, Any]]:
    """Get model ranking"""
    return benchmark_engine.get_ranking()


if __name__ == "__main__":
    # Demo
    print("📊 Benchmark Engine Demo\n")
    
    print("1. Simulated Benchmark (without actual calls):")
    result = benchmark_engine.run("openai:gpt-4o", call_fn=None, num_iterations=3)
    print(f"   Model: {result.model_id}")
    print(f"   Avg Latency: {result.avg_latency_ms:.2f}ms")
    print(f"   Quality Score: {result.quality_score:.1f}/10")
    print(f"   Success Rate: {result.success_rate:.1f}%")
    print(f"   Cost: €{result.actual_cost:.6f}")
    
    print("\n2. Benchmark multiple models:")
    models = ["openai:gpt-4o", "anthropic:claude-3.5-sonnet", "google:gemini-2.0-flash"]
    for model_id in models:
        result = benchmark_engine.run(model_id, call_fn=None, num_iterations=2)
        print(f"   {model_id}: Quality {result.quality_score:.1f}, Latency {result.avg_latency_ms:.0f}ms")
    
    print("\n3. Best Models by Quality:")
    best = benchmark_engine.get_best_models(metric="quality_score", limit=3)
    for i, model in enumerate(best, 1):
        print(f"   {i}. {model['model_id']}: {model['quality_score']:.1f}")
    
    print("\n4. Overall Ranking:")
    ranking = benchmark_engine.get_ranking()
    for i, model in enumerate(ranking[:5], 1):
        print(f"   {i}. {model['model_id']}: Score {model['composite_score']:.1f}")
    
    print("\n5. Model Comparison:")
    comparison = benchmark_engine.compare_models([
        "openai:gpt-4o",
        "anthropic:claude-3.5-sonnet"
    ])
    for model_id, data in comparison.items():
        if data:
            print(f"   {model_id}:")
            print(f"     Quality: {data['quality_score']:.1f}")
            print(f"     Latency: {data['avg_latency_ms']:.0f}ms")
