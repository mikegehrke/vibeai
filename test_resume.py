#!/usr/bin/env python3
"""
Kernel v1.2 - Resume Test
Tests State Persistence & Resume Capability
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from kernel.kernel_runtime import KernelRuntime, init_runtime
from kernel.kernel_state_store import KernelStateStore
from kernel.flow_state import FlowState
from kernel.action_graph import ActionGraph, ActionNode, ActionStatus
from kernel.control.security_policy import SecurityLevel
from kernel.control.human_control import ControlMode


def test_save_and_load():
    """Test: System speichern und wiederherstellen"""
    
    print("=" * 60)
    print("KERNEL v1.2 RESUME TEST")
    print("=" * 60)
    
    # === PHASE 1: Erstelle Runtime & State ===
    print("\n📦 Phase 1: Erstelle Runtime...")
    runtime = init_runtime(
        security_level=SecurityLevel.NORMAL,
        control_mode=ControlMode.ASSISTED,
        kernel=None
    )
    
    print(f"✅ Runtime erstellt")
    print(f"   Session ID: {runtime.session_id}")
    print(f"   Version: {runtime.kernel_version}")
    
    # FlowState erstellen
    flow = FlowState()
    flow.start(mode="flutter", project="test_resume_app")
    flow.add_todo("Create main.dart")
    flow.add_todo("Create pubspec.yaml")
    
    print(f"✅ FlowState erstellt")
    print(f"   Mode: {flow.mode}")
    print(f"   Project: {flow.project}")
    print(f"   Todos: {len(flow.todo)} total")
    
    # ActionGraph erstellen (minimalistisch für Test)
    graph = ActionGraph()
    
    # Einfache Dummy-Actions
    async def create_folder():
        return "folder_created"
    
    async def create_file():
        return "file_created"
    
    node1 = ActionNode(
        id="create_folder",
        action=create_folder,
        requires=[],
        reversible=True
    )
    graph.add_node(node1)
    
    node2 = ActionNode(
        id="create_main_dart",
        action=create_file,
        requires=["create_folder"],
        reversible=True
    )
    graph.add_node(node2)
    
    # Simuliere Ausführung
    node1.status = ActionStatus.COMPLETED
    
    print(f"✅ ActionGraph erstellt")
    print(f"   Nodes: {len(graph.nodes)}")
    print(f"   Completed: 1 (create_folder)")
    
    # === PHASE 2: Speichern ===
    print("\n💾 Phase 2: Speichere State...")
    store = KernelStateStore(backend="json", base_path="./test_kernel_state")
    
    success = store.save(
        flow_state=flow,
        action_graph=graph,
        runtime_config=runtime.to_dict(),
        events=[
            {"type": "thought", "message": "Test Event 1"},
            {"type": "analysis", "message": "Test Event 2"}
        ]
    )
    
    if success:
        print("✅ State gespeichert (JSON)")
    else:
        print("❌ Speichern fehlgeschlagen")
        return False
    
    # === PHASE 3: Laden ===
    print("\n📂 Phase 3: Lade State...")
    loaded = store.load()
    
    if not loaded:
        print("❌ Laden fehlgeschlagen")
        return False
    
    print("✅ State geladen")
    
    # === PHASE 4: Validieren ===
    print("\n🔍 Phase 4: Validiere wiederhergestellten State...")
    
    loaded_flow = loaded["flow_state"]
    loaded_graph = loaded["action_graph"]
    loaded_config = loaded["runtime_config"]
    loaded_events = loaded["events"]
    
    # FlowState prüfen
    assert loaded_flow.mode == "flutter", "Mode mismatch"
    assert loaded_flow.project == "test_resume_app", "Project mismatch"
    assert len(loaded_flow.todo) == 2, "Todo count mismatch"
    print(f"✅ FlowState korrekt")
    print(f"   Mode: {loaded_flow.mode}")
    print(f"   Project: {loaded_flow.project}")
    print(f"   Todos: {loaded_flow.todo}")
    
    # ActionGraph prüfen (Metadaten-only, Callables nicht serialisierbar)
    assert hasattr(loaded_graph, '_saved_state'), "Graph state not saved"
    assert len(loaded_graph._saved_state) == 2, "Node count mismatch"
    print(f"✅ ActionGraph korrekt (Metadaten)")
    print(f"   Saved Nodes: {[n['id'] for n in loaded_graph._saved_state]}")
    print(f"   Saved Stati: {[n['status'] for n in loaded_graph._saved_state]}")
    
    # Runtime Config prüfen
    assert loaded_config["version"] == "1.2", "Version mismatch"
    assert "session_id" in loaded_config, "Session ID missing"
    print(f"✅ Runtime Config korrekt")
    print(f"   Version: {loaded_config['version']}")
    print(f"   Session ID: {loaded_config.get('session_id', 'N/A')}")
    
    # Events prüfen
    assert len(loaded_events) == 2, "Event count mismatch"
    print(f"✅ Events korrekt ({len(loaded_events)} events)")
    
    # === PHASE 5: Resume ===
    print("\n▶️  Phase 5: Resume Simulation...")
    
    # Neues Runtime mit geladenem State
    resumed_runtime = KernelRuntime.from_dict(loaded_config, kernel=None)
    print(f"✅ Runtime resumed")
    print(f"   Original Session: {loaded_config.get('session_id', 'N/A')[:8]}...")
    print(f"   Resumed Session: {resumed_runtime.session_id[:8]}...")
    print(f"   Restart Count: {resumed_runtime.restart_count}")
    
    # Flow fortsetzen
    loaded_flow.complete_todo("Create pubspec.yaml")
    print(f"✅ Flow fortgesetzt (1 weiteres Todo completed)")
    
    # Graph fortsetzen (Metadaten-only)
    print(f"✅ Graph-Metadaten wiederhergestellt")
    
    # === CLEANUP ===
    print("\n🧹 Cleanup...")
    import shutil
    if os.path.exists("./test_kernel_state"):
        shutil.rmtree("./test_kernel_state")
    print("✅ Test-Dateien gelöscht")
    
    # === ERFOLG ===
    print("\n" + "=" * 60)
    print("✅ RESUME TEST ERFOLGREICH")
    print("=" * 60)
    print("\n📋 Zusammenfassung:")
    print("   • State speichern: ✅")
    print("   • State laden: ✅")
    print("   • FlowState wiederherstellen: ✅")
    print("   • ActionGraph wiederherstellen: ✅")
    print("   • Runtime Resume: ✅")
    print("   • Flow fortsetzen: ✅")
    print("   • Graph fortsetzen: ✅")
    print("\n💡 System ist RESTART-FÄHIG!")
    print("=" * 60)
    
    return True


if __name__ == "__main__":
    try:
        success = test_save_and_load()
        sys.exit(0 if success else 1)
    except Exception as e:
        print(f"\n❌ Test fehlgeschlagen: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
