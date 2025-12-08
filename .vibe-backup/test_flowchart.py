#!/usr/bin/env python3
# -------------------------------------------------------------
# VIBEAI – AI FLOWCHART TEST
# -------------------------------------------------------------
"""
Testet AI Flowchart Analyzer + Routes

Test Cases:
1. Flowchart Analyzer Import
2. Screen Detection from Code
3. Navigation Detection
4. Flow Analysis (unreachable, dead ends)
5. Auth Barrier Detection
6. Auto-Fix: Add Edge
7. Auto-Fix: Add Screen
8. Auto-Fix: Payment Recovery
9. Export to Mermaid
10. Export to JSON
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from ai.flowchart.flowchart_analyzer import (
    AuthLevel,
    FlowIssue,
    NavigationEdge,
    NavigationType,
    Screen,
    flowchart_analyzer,
)


def test_analyzer_import():
    """Test 1: Import"""
    print("✅ Test 1: Flowchart Analyzer importiert")
    assert flowchart_analyzer is not None


def test_screen_detection():
    """Test 2: Screen Detection from Code"""
    print("\n✅ Test 2: Screen Detection from Code")

    flutter_code = """
    class HomeScreen extends StatelessWidget { }
    class ProfileScreen extends StatefulWidget { }
    class SettingsScreen extends StatelessWidget { }
    """

    screens = flowchart_analyzer.detect_screens_from_code(flutter_code, "flutter")

    assert len(screens) == 3
    assert any(s.name == "HomeScreen" for s in screens)
    print(f"   → Detected {len(screens)} screens")


def test_navigation_detection():
    """Test 3: Navigation Detection"""
    print("\n✅ Test 3: Navigation Detection")

    flutter_code = """
    Navigator.pushNamed(context, '/profile');
    Navigator.push(context, MaterialPageRoute(builder: (_) => SettingsScreen()));
    """

    edges = flowchart_analyzer.detect_navigation_from_code(flutter_code, "flutter")

    assert len(edges) >= 1
    print(f"   → Detected {len(edges)} navigation edges")


def test_flow_analysis():
    """Test 4: Flow Analysis"""
    print("\n✅ Test 4: Flow Analysis")

    screens = [
        Screen(
            name="HomeScreen",
            route="/",
            is_entry_point=True,
            auth_level=AuthLevel.PUBLIC,
        ),
        Screen(name="ProfileScreen", route="/profile", auth_level=AuthLevel.AUTH_REQUIRED),
        Screen(name="UnreachableScreen", route="/unreachable", auth_level=AuthLevel.PUBLIC),
    ]

    edges = [
        NavigationEdge(
            from_screen="HomeScreen",
            to_screen="ProfileScreen",
            navigation_type=NavigationType.PUSH,
        )
    ]

    analysis = flowchart_analyzer.analyze_flow(screens, edges)

    assert "valid" in analysis
    assert "issues" in analysis
    assert len(analysis["issues"]) > 0  # Should detect unreachable screen

    print(f"   → Valid: {analysis['valid']}")
    print(f"   → Issues: {len(analysis['issues'])}")
    print(f"   → Metrics: {analysis['metrics']}")


def test_auth_barrier_detection():
    """Test 5: Auth Barrier Detection"""
    print("\n✅ Test 5: Auth Barrier Detection")

    screens = [
        Screen(
            name="HomeScreen",
            route="/",
            is_entry_point=True,
            auth_level=AuthLevel.PUBLIC,
        ),
        Screen(name="ProfileScreen", route="/profile", auth_level=AuthLevel.AUTH_REQUIRED),
    ]

    edges = [
        NavigationEdge(
            from_screen="HomeScreen",
            to_screen="ProfileScreen",
            navigation_type=NavigationType.PUSH,
            requires_auth=False,  # Missing auth guard!
        )
    ]

    analysis = flowchart_analyzer.analyze_flow(screens, edges)

    # Should detect missing auth guard
    auth_issues = [i for i in analysis["issues"] if "auth guard" in i["message"].lower()]

    assert len(auth_issues) > 0
    print(f"   → Auth barrier issues detected: {len(auth_issues)}")


def test_auto_fix_add_edge():
    """Test 6: Auto-Fix - Add Edge"""
    print("\n✅ Test 6: Auto-Fix - Add Edge")

    screens = [
        Screen(name="HomeScreen", route="/", is_entry_point=True),
        Screen(name="ProfileScreen", route="/profile"),
    ]

    flowchart_analyzer.screens = {s.name: s for s in screens}
    flowchart_analyzer.edges = []

    issue = FlowIssue(
        severity="warning",
        screen="ProfileScreen",
        message="Screen unreachable",
        auto_fixable=True,
        fix_data={"action": "add_edge", "from": "HomeScreen", "to": "ProfileScreen"},
    )

    result = flowchart_analyzer.apply_auto_fix(issue)

    assert result["success"] is True
    assert len(flowchart_analyzer.edges) == 1
    print(f"   → {result['message']}")


def test_auto_fix_add_screen():
    """Test 7: Auto-Fix - Add Screen"""
    print("\n✅ Test 7: Auto-Fix - Add Screen")

    flowchart_analyzer.screens = {}

    issue = FlowIssue(
        severity="info",
        screen=None,
        message="Missing Settings screen",
        auto_fixable=True,
        fix_data={
            "action": "add_screen",
            "screen_name": "SettingsScreen",
            "category": "settings",
        },
    )

    result = flowchart_analyzer.apply_auto_fix(issue)

    assert result["success"] is True
    assert "SettingsScreen" in flowchart_analyzer.screens
    print(f"   → {result['message']}")


def test_auto_fix_payment_recovery():
    """Test 8: Auto-Fix - Payment Recovery"""
    print("\n✅ Test 8: Auto-Fix - Payment Recovery")

    flowchart_analyzer.screens = {
        "PaymentScreen": Screen(name="PaymentScreen", route="/payment", auth_level=AuthLevel.AUTH_REQUIRED)
    }
    flowchart_analyzer.edges = []

    issue = FlowIssue(
        severity="error",
        screen="PaymentScreen",
        message="Missing payment recovery",
        auto_fixable=True,
        fix_data={"action": "add_payment_recovery", "payment_screen": "PaymentScreen"},
    )

    result = flowchart_analyzer.apply_auto_fix(issue)

    assert result["success"] is True
    assert "PaymentFailureScreen" in flowchart_analyzer.screens
    assert len(flowchart_analyzer.edges) == 2  # Failure + Retry edges
    print(f"   → {result['message']}")
    print(f"   → Added {len(flowchart_analyzer.edges)} recovery edges")


def test_export_mermaid():
    """Test 9: Export to Mermaid"""
    print("\n✅ Test 9: Export to Mermaid")

    flowchart_analyzer.screens = {
        "HomeScreen": Screen(name="HomeScreen", route="/"),
        "ProfileScreen": Screen(name="ProfileScreen", route="/profile"),
    }
    flowchart_analyzer.edges = [
        NavigationEdge(
            from_screen="HomeScreen",
            to_screen="ProfileScreen",
            navigation_type=NavigationType.PUSH,
            label="View Profile",
        )
    ]

    mermaid = flowchart_analyzer.export_to_mermaid()

    assert "graph TD" in mermaid
    assert "HomeScreen" in mermaid
    assert "ProfileScreen" in mermaid
    print(f"   → Mermaid export successful")
    lines = mermaid.split("\n")
    print(f"   → Lines: {len(lines)}")


def test_export_json():
    """Test 10: Export to JSON"""
    print("\n✅ Test 10: Export to JSON")

    import json

    flowchart_analyzer.screens = {"HomeScreen": Screen(name="HomeScreen", route="/")}
    flowchart_analyzer.edges = []
    flowchart_analyzer.issues = []

    json_str = flowchart_analyzer.export_to_json()
    data = json.loads(json_str)

    assert "screens" in data
    assert "edges" in data
    assert "issues" in data
    assert len(data["screens"]) == 1
    print(f"   → JSON export successful")
    print(f"   → Size: {len(json_str)} bytes")


def run_all_tests():
    """Run All Tests"""
    print("=" * 60)
    print("🎨 VIBEAI AI FLOWCHART TESTS")
    print("=" * 60)

    try:
        test_analyzer_import()
        test_screen_detection()
        test_navigation_detection()
        test_flow_analysis()
        test_auth_barrier_detection()
        test_auto_fix_add_edge()
        test_auto_fix_add_screen()
        test_auto_fix_payment_recovery()
        test_export_mermaid()
        test_export_json()

        print("\n" + "=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print("\n📊 Summary:")
        print("   → Screen Detection: ✅")
        print("   → Navigation Detection: ✅")
        print("   → Flow Analysis: ✅")
        print("   → Auth Barrier Detection: ✅")
        print("   → Auto-Fix (3 types): ✅")
        print("   → Export (Mermaid + JSON): ✅")
        print("   → Total Test Cases: 10")

    except Exception as e:
        print(f"\n❌ TEST FAILED: {str(e)}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    run_all_tests()
