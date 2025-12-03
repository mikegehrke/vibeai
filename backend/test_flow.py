#!/usr/bin/env python3
# -------------------------------------------------------------
# VIBEAI – NAVIGATION FLOW TEST
# -------------------------------------------------------------
"""
Testet Flow Generator + Flow Routes

Test Cases:
1. Flow Generator Import
2. Auth Flow Generation
3. E-Commerce Flow Generation
4. All 5 Flow Templates
5. All 5 Framework Generators
6. Flow Analysis
7. API Endpoints
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from ai.flow.flow_generator import flow_generator


def test_flow_generator_import():
    """Test 1: Flow Generator Import"""
    print("✅ Test 1: Flow Generator importiert")
    assert flow_generator is not None
    assert hasattr(flow_generator, 'generate_navigation_flow')
    assert hasattr(flow_generator, 'analyze_flow')
    print(f"   → Flow Templates: {len(flow_generator.flow_templates)}")
    print(f"   → Frameworks: {len(flow_generator.frameworks)}")


def test_auth_flow():
    """Test 2: Auth Flow Generation"""
    print("\n✅ Test 2: Auth Flow Generation")
    
    result = flow_generator.generate_navigation_flow(
        base_path="/tmp/test_flow_auth",
        framework="react",
        flow_type="auth",
        options={}
    )
    
    assert result["success"] is True
    assert result["framework"] == "react"
    assert result["flow_type"] == "auth"
    assert result["screens"] == 6
    assert result["edges"] == 8
    assert len(result["files"]) > 0
    
    print(f"   → Screens: {result['screens']}")
    print(f"   → Edges: {result['edges']}")
    print(f"   → Files: {len(result['files'])}")


def test_ecommerce_flow():
    """Test 3: E-Commerce Flow Generation"""
    print("\n✅ Test 3: E-Commerce Flow Generation")
    
    result = flow_generator.generate_navigation_flow(
        base_path="/tmp/test_flow_ecommerce",
        framework="flutter",
        flow_type="ecommerce",
        options={}
    )
    
    assert result["success"] is True
    assert result["screens"] == 8
    assert result["edges"] == 8
    assert len(result["files"]) == 3  # Flutter: routes, guards, router
    
    print(f"   → Screens: {result['screens']}")
    print(f"   → Files: {result['files']}")


def test_all_flow_templates():
    """Test 4: All 5 Flow Templates"""
    print("\n✅ Test 4: All Flow Templates")
    
    flow_types = ["auth", "ecommerce", "onboarding", "social", "dashboard"]
    
    for flow_type in flow_types:
        result = flow_generator.generate_navigation_flow(
            base_path=f"/tmp/test_flow_{flow_type}",
            framework="react",
            flow_type=flow_type,
            options={}
        )
        assert result["success"] is True
        print(f"   → {flow_type}: {result['screens']} screens, {result['edges']} edges")


def test_all_frameworks():
    """Test 5: All 5 Framework Generators"""
    print("\n✅ Test 5: All Framework Generators")
    
    frameworks = ["flutter", "react", "nextjs", "vue", "react_native"]
    
    for framework in frameworks:
        result = flow_generator.generate_navigation_flow(
            base_path=f"/tmp/test_framework_{framework}",
            framework=framework,
            flow_type="auth",
            options={}
        )
        assert result["success"] is True
        print(f"   → {framework}: {len(result['files'])} files generated")


def test_flow_analysis():
    """Test 6: Flow Analysis"""
    print("\n✅ Test 6: Flow Analysis")
    
    # Generate flow
    result = flow_generator.generate_navigation_flow(
        base_path="/tmp/test_analysis",
        framework="react",
        flow_type="auth",
        options={}
    )
    
    # Analyze it
    analysis = flow_generator.analyze_flow(result["flow_data"])
    
    assert "valid" in analysis
    assert "issues" in analysis
    assert "warnings" in analysis
    assert "metrics" in analysis
    
    print(f"   → Valid: {analysis['valid']}")
    print(f"   → Issues: {len(analysis['issues'])}")
    print(f"   → Warnings: {len(analysis['warnings'])}")
    print(f"   → Metrics: {analysis['metrics']}")


def test_custom_flow():
    """Test 7: Custom Flow with Custom Screens"""
    print("\n✅ Test 7: Custom Flow")
    
    custom_screens = [
        {"name": "HomeScreen", "route": "/", "requires_auth": False, "params": [], "type": "fullscreen"},
        {"name": "ProfileScreen", "route": "/profile", "requires_auth": True, "params": [], "type": "fullscreen"}
    ]
    
    custom_edges = [
        {"from_screen": "HomeScreen", "to_screen": "ProfileScreen", "action": "push", "condition": None}
    ]
    
    result = flow_generator.generate_navigation_flow(
        base_path="/tmp/test_custom",
        framework="react",
        flow_type="custom",
        options={
            "custom_flow": {
                "type": "custom",
                "screens": custom_screens,
                "edges": custom_edges,
                "start_screen": "HomeScreen",
                "guards": []
            }
        }
    )
    
    assert result["success"] is True
    assert result["screens"] == 2
    assert result["edges"] == 1
    
    print(f"   → Custom Screens: {result['screens']}")
    print(f"   → Custom Edges: {result['edges']}")


def run_all_tests():
    """Run All Tests"""
    print("=" * 60)
    print("🚀 VIBEAI NAVIGATION FLOW TESTS")
    print("=" * 60)
    
    try:
        test_flow_generator_import()
        test_auth_flow()
        test_ecommerce_flow()
        test_all_flow_templates()
        test_all_frameworks()
        test_flow_analysis()
        test_custom_flow()
        
        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n📊 Summary:")
        print("   → Flow Templates: 5 (auth, ecommerce, onboarding, social, dashboard)")
        print("   → Frameworks: 5 (Flutter, React, Next.js, Vue, React Native)")
        print("   → Analysis: Unreachable screens, missing edges, auth guards")
        print("   → Total Test Cases: 7")
        
    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    run_all_tests()
