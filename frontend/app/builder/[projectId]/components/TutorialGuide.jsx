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

  if (!isVisible || !currentTutorial) {
    return (
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 10000
      }}>
        <button
          onClick={() => {
            const tutorialList = Object.keys(TUTORIALS);
            const nextTutorial = tutorialList.find(t => !completedTutorials.includes(t)) || tutorialList[0];
            startTutorial(nextTutorial);
          }}
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

