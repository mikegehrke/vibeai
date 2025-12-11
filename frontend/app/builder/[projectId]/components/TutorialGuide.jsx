// -------------------------------------------------------------
// VIBEAI – STEP-BY-STEP TUTORIAL GUIDE SYSTEM
// -------------------------------------------------------------
/**
 * Tutorial Guide Component
 * 
 * Features:
 * - Schritt-für-Schritt Anleitungen
 * - Tooltips und Highlights
 * - Geführte Touren
 * - Kontextbezogene Hilfe
 * - Interaktive Tutorials
 */

"use client";

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, HelpCircle, CheckCircle2 } from "lucide-react";

const TUTORIALS = {
  "first-app": {
    title: "🎯 Deine erste App erstellen",
    steps: [
      {
        id: 1,
        title: "Willkommen!",
        content: "Willkommen im VibeAI App Builder! Hier kannst du Apps mit KI erstellen.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Chat öffnen",
        content: "Klicke auf das Chat-Icon rechts, um mit dem AI-Agenten zu sprechen.",
        target: "#chat-panel",
        action: "highlight"
      },
      {
        id: 3,
        title: "App anfordern",
        content: "Sage einfach: 'Erstelle eine Flutter App namens MyApp' oder ähnliches.",
        target: "#chat-input",
        action: "focus"
      },
      {
        id: 4,
        title: "Live-Erstellung beobachten",
        content: "Schaue zu, wie der Agent Schritt für Schritt Dateien erstellt und Code schreibt!",
        target: "#editor",
        action: "highlight"
      },
      {
        id: 5,
        title: "Preview ansehen",
        content: "Die Live-Preview zeigt dir deine App in Echtzeit!",
        target: "#preview-panel",
        action: "highlight"
      }
    ]
  },
  "drag-drop": {
    title: "🎨 Drag & Drop Editor nutzen",
    steps: [
      {
        id: 1,
        title: "Visual Editor öffnen",
        content: "Öffne den Visual Editor für Drag-and-Drop UI-Design.",
        target: "#visual-editor",
        action: "highlight"
      },
      {
        id: 2,
        title: "Komponenten hinzufügen",
        content: "Ziehe Komponenten aus der Palette in den Canvas.",
        target: "#component-palette",
        action: "highlight"
      },
      {
        id: 3,
        title: "Eigenschaften anpassen",
        content: "Klicke auf eine Komponente, um ihre Eigenschaften zu bearbeiten.",
        target: "#property-editor",
        action: "highlight"
      }
    ]
  },
  "code-editing": {
    title: "💻 Code bearbeiten",
    steps: [
      {
        id: 1,
        title: "Datei öffnen",
        content: "Klicke auf eine Datei im File Tree, um sie im Editor zu öffnen.",
        target: "#file-tree",
        action: "highlight"
      },
      {
        id: 2,
        title: "Code schreiben",
        content: "Der Editor unterstützt Autocomplete, Syntax-Highlighting und mehr!",
        target: "#editor",
        action: "highlight"
      },
      {
        id: 3,
        title: "Live Preview",
        content: "Änderungen werden automatisch in der Preview angezeigt!",
        target: "#preview-panel",
        action: "highlight"
      }
    ]
  },
  "navigation": {
    title: "🧭 Navigation im App Builder",
    steps: [
      {
        id: 1,
        title: "Linke Sidebar",
        content: "Die linke Sidebar enthält: Explorer (Dateien), Suche, Git, Run & Debug, Testing, Extensions. Klicke auf die Icons, um zwischen den Panels zu wechseln.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Rechte Sidebar",
        content: "Die rechte Sidebar enthält: Review Panel (Projekt-Info) und Chat Panel (AI-Agenten). Klicke auf die Tabs, um zu wechseln.",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Unteres Panel",
        content: "Das untere Panel enthält: Terminal, Output, Debug Console. Klicke auf die Tabs, um zu wechseln. Du kannst die Höhe anpassen, indem du die obere Kante ziehst.",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Command Palette",
        content: "Drücke Ctrl/Cmd + Shift + P, um die Command Palette zu öffnen. Hier findest du alle verfügbaren Befehle und kannst schnell navigieren.",
        target: null,
        action: null
      }
    ]
  },
  "ai-agents": {
    title: "🤖 AI-Agenten verstehen",
    steps: [
      {
        id: 1,
        title: "Die 4 Agenten",
        content: "Es gibt 4 spezialisierte Agenten: Aura (Allgemein), Cora (Code), Devra (Deep Thinking), Lumi (Kreativität). Wähle den passenden Agenten für deine Aufgabe.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Agent wechseln",
        content: "Klicke auf das Agent-Icon im Chat-Panel, um zwischen den Agenten zu wechseln. Jeder Agent hat spezielle Fähigkeiten.",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Team Mode",
        content: "Aktiviere Team Mode (Shift+Click auf Agent), um mehrere Agenten gleichzeitig zu nutzen. Sie arbeiten parallel für bessere Ergebnisse.",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Model-Auswahl",
        content: "Wähle zwischen GPT-4, Claude, Gemini. Jedes Model hat unterschiedliche Stärken. GPT-4 ist gut für Code, Claude für Reasoning.",
        target: null,
        action: null
      }
    ]
  },
  "smart-agent": {
    title: "🚀 Smart Agent nutzen",
    steps: [
      {
        id: 1,
        title: "Smart Agent starten",
        content: "Sage im Chat: 'Erstelle eine Flutter App namens MyApp'. Der Smart Agent startet automatisch und erstellt die App Schritt für Schritt.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Live-Generierung beobachten",
        content: "Schaue zu, wie der Agent Dateien erstellt und Code Zeichen für Zeichen schreibt. Du siehst alles live im Editor!",
        target: "#editor",
        action: "highlight"
      },
      {
        id: 3,
        title: "Erklärungen lesen",
        content: "Der Agent erklärt jeden Schritt. Lies die Erklärungen, um zu verstehen, was er macht und warum.",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Während Generierung chatten",
        content: "Wichtig: Du kannst während der Generierung weiter chatten! Der Chat funktioniert parallel und blockiert nicht.",
        target: "#chat-panel",
        action: "highlight"
      }
    ]
  },
  "team-agent": {
    title: "👥 Team Agent nutzen",
    steps: [
      {
        id: 1,
        title: "Team Agent starten",
        content: "Sage: 'Erstelle eine App mit Team Agent'. Mehrere spezialisierte Agenten arbeiten dann parallel.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Parallele Arbeit",
        content: "Frontend Agent, Backend Agent, Designer Agent und mehr arbeiten gleichzeitig. Das ist schneller als Smart Agent!",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Team-Modi",
        content: "Wähle zwischen Parallel (alle gleichzeitig), Sequential (nacheinander) oder Consensus (diskutieren und einigen).",
        target: null,
        action: null
      }
    ]
  },
  "file-management": {
    title: "📁 Dateien verwalten",
    steps: [
      {
        id: 1,
        title: "File Tree",
        content: "Der File Tree zeigt alle Dateien deines Projekts. Klicke auf Ordner, um sie zu expandieren/kollabieren.",
        target: "#file-tree",
        action: "highlight"
      },
      {
        id: 2,
        title: "Datei öffnen",
        content: "Klicke auf eine Datei, um sie im Editor zu öffnen. Mehrere Dateien können gleichzeitig in Tabs geöffnet sein.",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Datei erstellen",
        content: "Rechtsklick im File Tree → 'New File'. Oder sage im Chat: 'Erstelle eine Datei namens...'",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Datei umbenennen",
        content: "Rechtsklick auf Datei → 'Rename' oder drücke F2. Der Agent kann auch Dateien umbenennen.",
        target: null,
        action: null
      },
      {
        id: 5,
        title: "Auto-Save",
        content: "Änderungen werden automatisch gespeichert. Du siehst einen Punkt auf dem Tab, wenn es ungespeicherte Änderungen gibt.",
        target: null,
        action: null
      }
    ]
  },
  "search-replace": {
    title: "🔍 Suchen & Ersetzen",
    steps: [
      {
        id: 1,
        title: "Search Panel öffnen",
        content: "Klicke auf das Such-Icon in der linken Sidebar, um das Search Panel zu öffnen.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Projektweite Suche",
        content: "Gebe deinen Suchbegriff ein. Die Suche durchsucht alle Dateien im Projekt. Nutze Ctrl/Cmd + Shift + F als Shortcut.",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Erweiterte Optionen",
        content: "Aktiviere 'Regex' für reguläre Ausdrücke, 'Whole Word' für ganze Wörter, 'Case Sensitive' für Groß-/Kleinschreibung.",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Ersetzen",
        content: "Klicke auf 'Replace', um Text zu ersetzen. Du kannst einzelne Treffer oder alle auf einmal ersetzen.",
        target: null,
        action: null
      },
      {
        id: 5,
        title: "Datei öffnen",
        content: "Klicke auf ein Suchergebnis, um die Datei im Editor zu öffnen und direkt zur Stelle zu springen.",
        target: null,
        action: null
      }
    ]
  },
  "git-integration": {
    title: "🔧 Git verwenden",
    steps: [
      {
        id: 1,
        title: "Git Panel öffnen",
        content: "Klicke auf das Git-Icon in der linken Sidebar, um das Git Panel zu öffnen.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Git Status",
        content: "Sieh alle geänderten, neuen und gelöschten Dateien. Geänderte Dateien sind mit 'M' markiert.",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Staging",
        content: "Klicke auf das '+' Icon, um Dateien zu stagen. Oder klicke auf 'Stage All', um alle zu stagen.",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Commit",
        content: "Gebe eine Commit-Message ein und klicke auf 'Commit'. Deine Änderungen werden committet.",
        target: null,
        action: null
      },
      {
        id: 5,
        title: "Push/Pull",
        content: "Klicke auf 'Push', um zu GitHub/GitLab zu pushen. Oder 'Pull', um Änderungen zu holen.",
        target: null,
        action: null
      },
      {
        id: 6,
        title: "Branch Management",
        content: "Wechsle Branches, erstelle neue Branches oder merge Branches direkt aus dem Git Panel.",
        target: null,
        action: null
      }
    ]
  },
  "terminal": {
    title: "💻 Terminal nutzen",
    steps: [
      {
        id: 1,
        title: "Terminal öffnen",
        content: "Klicke auf das Terminal-Icon in der unteren Sidebar oder drücke Ctrl/Cmd + ` (Backtick).",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Befehle ausführen",
        content: "Führe alle Terminal-Befehle aus: npm install, flutter run, git push, etc. Alles funktioniert wie in einem normalen Terminal.",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Agent-Befehle",
        content: "Der AI-Agent kann Terminal-Befehle vorschlagen. Du musst sie bestätigen, bevor sie ausgeführt werden.",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Multi-Terminal",
        content: "Erstelle mehrere Terminal-Tabs für verschiedene Aufgaben. Jeder Tab ist ein separates Terminal.",
        target: null,
        action: null
      },
      {
        id: 5,
        title: "Command History",
        content: "Nutze die Pfeiltasten (↑/↓), um durch deine Befehls-Historie zu navigieren.",
        target: null,
        action: null
      }
    ]
  },
  "run-debug": {
    title: "▶️ Run & Debug",
    steps: [
      {
        id: 1,
        title: "Run & Debug Panel",
        content: "Klicke auf das Play-Icon in der linken Sidebar, um das Run & Debug Panel zu öffnen.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Launch App",
        content: "Klicke auf 'Launch App', um deine App zu starten. Der Preview-Server startet automatisch und öffnet einen Browser-Tab.",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Run Tests",
        content: "Klicke auf 'Run Tests', um alle Tests auszuführen. Die Ergebnisse werden im Output angezeigt.",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Build",
        content: "Klicke auf 'Build', um dein Projekt zu kompilieren. Für Flutter: flutter build, für React: npm run build.",
        target: null,
        action: null
      },
      {
        id: 5,
        title: "Konfigurationen",
        content: "Das Panel erkennt automatisch dein Projekt (Flutter, React, etc.) und zeigt die passenden Konfigurationen.",
        target: null,
        action: null
      }
    ]
  },
  "preview": {
    title: "📺 Preview System",
    steps: [
      {
        id: 1,
        title: "Preview starten",
        content: "Klicke auf 'Launch App' im Run & Debug Panel. Der Preview-Server startet automatisch.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Browser-Tabs",
        content: "Die Preview öffnet sich direkt im Editor als Browser-Tab, nicht in einem separaten Fenster. Du kannst mehrere Tabs öffnen.",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Hot Reload",
        content: "Änderungen im Code werden automatisch in der Preview angezeigt. Kein manuelles Neuladen nötig!",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "URL Navigation",
        content: "Du kannst URLs direkt in den Browser-Tabs eingeben, um andere Seiten zu öffnen oder externe URLs zu testen.",
        target: null,
        action: null
      },
      {
        id: 5,
        title: "Reload",
        content: "Klicke auf den Reload-Button im Browser-Tab, um die Seite neu zu laden.",
        target: null,
        action: null
      }
    ]
  },
  "keyboard-shortcuts": {
    title: "⌨️ Keyboard Shortcuts",
    steps: [
      {
        id: 1,
        title: "Command Palette",
        content: "Ctrl/Cmd + Shift + P oder Ctrl/Cmd + K - Öffnet die Command Palette mit allen Befehlen.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Datei-Operationen",
        content: "Ctrl/Cmd + N (Neu), Ctrl/Cmd + O (Öffnen), Ctrl/Cmd + S (Speichern), Ctrl/Cmd + W (Schließen)",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Suche",
        content: "Ctrl/Cmd + F (In Datei), Ctrl/Cmd + Shift + F (Projektweit), Ctrl/Cmd + G (Gehe zu Zeile)",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Editor",
        content: "Ctrl/Cmd + / (Kommentar), Alt + ↑/↓ (Zeile verschieben), Ctrl/Cmd + D (Wort auswählen)",
        target: null,
        action: null
      },
      {
        id: 5,
        title: "Panels",
        content: "Ctrl/Cmd + ` (Terminal), Ctrl/Cmd + L (Chat), Ctrl/Cmd + , (Settings)",
        target: null,
        action: null
      }
    ]
  },
  "extensions": {
    title: "📦 Extensions",
    steps: [
      {
        id: 1,
        title: "Extensions Panel",
        content: "Klicke auf das Extensions-Icon in der linken Sidebar, um das Extensions Panel zu öffnen.",
        target: null,
        action: null
      },
      {
        id: 2,
        title: "Installierte Extensions",
        content: "Sieh alle installierten Extensions. Beispiele: ESLint, Prettier, GitLens.",
        target: null,
        action: null
      },
      {
        id: 3,
        title: "Marketplace",
        content: "Durchsuche den Extension Marketplace. Suche nach Extensions und installiere sie mit einem Klick.",
        target: null,
        action: null
      },
      {
        id: 4,
        title: "Extension Details",
        content: "Jede Extension zeigt Name, Publisher, Version, Beschreibung, Ratings und Downloads.",
        target: null,
        action: null
      },
      {
        id: 5,
        title: "Deinstallation",
        content: "Klicke auf 'Uninstall', um eine Extension zu entfernen.",
        target: null,
        action: null
      }
    ]
  }
};

export default function TutorialGuide({ projectId, onClose }) {
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true); // Start visible when opened via button
  const [completedTutorials, setCompletedTutorials] = useState([]);

  useEffect(() => {
    // Start tutorial when component is shown
    if (isVisible && !currentTutorial) {
      startTutorial("first-app");
    }
  }, [isVisible]);

  const startTutorial = (tutorialId) => {
    setCurrentTutorial(tutorialId);
    setCurrentStep(0);
    setIsVisible(true);
    highlightTarget(TUTORIALS[tutorialId].steps[0]);
  };

  const nextStep = () => {
    if (!currentTutorial) return;
    
    const tutorial = TUTORIALS[currentTutorial];
    if (currentStep < tutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      highlightTarget(tutorial.steps[currentStep + 1]);
    } else {
      // Tutorial completed
      completeTutorial(currentTutorial);
    }
  };

  const prevStep = () => {
    if (!currentTutorial || currentStep === 0) return;
    
    const tutorial = TUTORIALS[currentTutorial];
    setCurrentStep(currentStep - 1);
    highlightTarget(tutorial.steps[currentStep - 1]);
  };

  const completeTutorial = (tutorialId) => {
    setCompletedTutorials(prev => [...prev, tutorialId]);
    localStorage.setItem(`tutorial_completed_${tutorialId}`, "true");
    setIsVisible(false);
    setCurrentTutorial(null);
    setCurrentStep(0);
    removeHighlight();
  };

  const highlightTarget = (step) => {
    if (!step.target) return;
    
    removeHighlight();
    
    const element = document.querySelector(step.target);
    if (element) {
      element.classList.add("tutorial-highlight");
      
      if (step.action === "focus") {
        element.focus();
      }
      
      // Scroll into view
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const removeHighlight = () => {
    document.querySelectorAll(".tutorial-highlight").forEach(el => {
      el.classList.remove("tutorial-highlight");
    });
  };

  const closeTutorial = () => {
    removeHighlight();
    setIsVisible(false);
    setCurrentTutorial(null);
    setCurrentStep(0);
    if (onClose) onClose();
  };

  const [showTutorialList, setShowTutorialList] = useState(false);

  if (!isVisible) {
    return (
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 10000
      }}>
        {!showTutorialList ? (
          <button
            onClick={() => setShowTutorialList(true)}
            style={{
              padding: "12px 20px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            <HelpCircle size={18} />
            Tutorial starten
          </button>
        ) : (
          <div style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
            padding: "20px",
            width: "400px",
            maxHeight: "600px",
            overflow: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>📚 Tutorials</h3>
              <button
                onClick={() => setShowTutorialList(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(TUTORIALS).map(([id, tutorial]) => {
                const isCompleted = completedTutorials.includes(id);
                return (
                  <button
                    key={id}
                    onClick={() => {
                      setShowTutorialList(false);
                      startTutorial(id);
                    }}
                    style={{
                      padding: "12px 16px",
                      background: isCompleted ? "#f0f9ff" : "#f9fafb",
                      border: `2px solid ${isCompleted ? "#3b82f6" : "#e5e7eb"}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "all 0.2s"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isCompleted ? "#dbeafe" : "#f3f4f6";
                      e.currentTarget.style.borderColor = "#667eea";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isCompleted ? "#f0f9ff" : "#f9fafb";
                      e.currentTarget.style.borderColor = isCompleted ? "#3b82f6" : "#e5e7eb";
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: "500", color: "#1f2937" }}>
                        {tutorial.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
                        {tutorial.steps.length} Schritte
                      </div>
                    </div>
                    {isCompleted && (
                      <CheckCircle2 size={18} color="#3b82f6" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  const tutorial = TUTORIALS[currentTutorial];
  const step = tutorial.steps[currentStep];
  const isLastStep = currentStep === tutorial.steps.length - 1;

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          zIndex: 9998,
          pointerEvents: "none"
        }}
      />

      {/* Tutorial Card */}
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "400px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          zIndex: 9999,
          padding: "24px",
          animation: "slideInUp 0.3s ease-out"
        }}
      >
        <style>{`
          @keyframes slideInUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }
          .tutorial-highlight {
            outline: 3px solid #667eea !important;
            outline-offset: 4px !important;
            border-radius: 4px !important;
            z-index: 9999 !important;
            position: relative !important;
          }
        `}</style>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
            {tutorial.title}
          </h3>
          <button
            onClick={closeTutorial}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{ display: "flex", gap: "4px", marginBottom: "8px" }}>
            {tutorial.steps.map((_, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  height: "4px",
                  background: idx <= currentStep ? "#667eea" : "#e5e7eb",
                  borderRadius: "2px",
                  transition: "background 0.3s"
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>
            Schritt {currentStep + 1} von {tutorial.steps.length}
          </div>
        </div>

        {/* Step Content */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: "600" }}>
            {step.title}
          </h4>
          <p style={{ margin: 0, fontSize: "14px", color: "#4b5563", lineHeight: "1.6" }}>
            {step.content}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            style={{
              padding: "8px 16px",
              background: currentStep === 0 ? "#f3f4f6" : "#f9fafb",
              color: currentStep === 0 ? "#9ca3af" : "#374151",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              cursor: currentStep === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "14px"
            }}
          >
            <ChevronLeft size={16} />
            Zurück
          </button>

          <button
            onClick={isLastStep ? () => completeTutorial(currentTutorial) : nextStep}
            style={{
              padding: "8px 16px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "14px",
              fontWeight: "500"
            }}
          >
            {isLastStep ? (
              <>
                <CheckCircle2 size={16} />
                Fertig
              </>
            ) : (
              <>
                Weiter
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}

