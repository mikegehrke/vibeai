// ============================================================
// VIBEAI – SCREEN BUILDER
// ============================================================
/**
 * Visual Screen Builder mit Drag & Drop
 * 
 * Features:
 * - Component Library Sidebar
 * - Canvas mit Component Tree
 * - Live Preview Panel
 * - Property Editor
 * - Screen Export/Import
 * 
 * Integration:
 * - POST /preview/render_screen für Live Preview
 * - Echtzeit HTML Rendering
 * - Ohne Build sofort sichtbar
 * 
 * Usage:
 *   <ScreenBuilder projectId="abc123" />
 */

import React, { useState, useCallback } from "react";
import AppBuilderPreview from "./AppBuilderPreview";
import { COMPONENT_LIBRARY, CATEGORIES, getComponentTemplate } from "./ComponentLibrary";
import "./ScreenBuilder.css";

export default function ScreenBuilder({ projectId, onSave }) {
    const [screen, setScreen] = useState({
        name: "NewScreen",
        components: [],
        style: "tailwind",
        metadata: {
            title: "New Screen",
            theme: "light",
            framework: "html"
        }
    });

    const [selectedComponent, setSelectedComponent] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState("layout");
    const [previewKey, setPreviewKey] = useState(0); // Force preview refresh

    // Add Component
    const addComponent = useCallback((type) => {
        const template = getComponentTemplate(type);
        if (!template) {
            console.error(`Unknown component type: ${type}`);
            return;
        }

        const newComponent = {
            id: `comp_${Date.now()}`,
            ...template
        };

        setScreen(prev => ({
            ...prev,
            components: [...prev.components, newComponent]
        }));

        setPreviewKey(k => k + 1); // Trigger preview update
    }, []);

    // Remove Component
    const removeComponent = useCallback((componentId) => {
        setScreen(prev => ({
            ...prev,
            components: prev.components.filter(c => c.id !== componentId)
        }));

        if (selectedComponent?.id === componentId) {
            setSelectedComponent(null);
        }

        setPreviewKey(k => k + 1);
    }, [selectedComponent]);

    // Update Component
    const updateComponent = useCallback((componentId, updates) => {
        setScreen(prev => ({
            ...prev,
            components: prev.components.map(c =>
                c.id === componentId ? { ...c, ...updates } : c
            )
        }));

        if (selectedComponent?.id === componentId) {
            setSelectedComponent(current => ({ ...current, ...updates }));
        }

        setPreviewKey(k => k + 1);
    }, [selectedComponent]);

    // Update Component Props
    const updateComponentProps = useCallback((componentId, propKey, propValue) => {
        setScreen(prev => ({
            ...prev,
            components: prev.components.map(c =>
                c.id === componentId
                    ? { ...c, props: { ...c.props, [propKey]: propValue } }
                    : c
            )
        }));

        setPreviewKey(k => k + 1);
    }, []);

    // Save Screen
    const saveScreen = () => {
        if (onSave) {
            onSave(screen);
        } else {
            // Export as JSON
            const json = JSON.stringify(screen, null, 2);
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${screen.name}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="screen-builder">
            {/* Header */}
            <div className="builder-header">
                <input
                    type="text"
                    value={screen.name}
                    onChange={(e) => setScreen({ ...screen, name: e.target.value })}
                    className="screen-name"
                    placeholder="Screen Name"
                />

                <div className="header-actions">
                    <select
                        value={screen.style}
                        onChange={(e) => setScreen({ ...screen, style: e.target.value })}
                        className="style-select"
                    >
                        <option value="tailwind">Tailwind</option>
                        <option value="bootstrap">Bootstrap</option>
                        <option value="custom">Custom</option>
                    </select>

                    <button onClick={saveScreen} className="save-btn">
                        💾 Save
                    </button>
                </div>
            </div>

            {/* Main Layout */}
            <div className="builder-main">
                {/* Left: Component Library */}
                <div className="library-panel">
                    <h3>Components</h3>

                    {/* Categories */}
                    <div className="category-tabs">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                className={`category-tab ${selectedCategory === cat.id ? "active" : ""}`}
                                onClick={() => setSelectedCategory(cat.id)}
                            >
                                {cat.icon} {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Component List */}
                    <div className="component-list">
                        {COMPONENT_LIBRARY[selectedCategory]?.map(comp => (
                            <button
                                key={comp.type}
                                className="component-item"
                                onClick={() => addComponent(comp.type)}
                                title={comp.description}
                            >
                                <span className="comp-icon">{comp.icon}</span>
                                <div className="comp-info">
                                    <div className="comp-label">{comp.label}</div>
                                    <div className="comp-desc">{comp.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center: Component Tree */}
                <div className="canvas-panel">
                    <h3>Screen Components ({screen.components.length})</h3>

                    {screen.components.length === 0 ? (
                        <div className="canvas-empty">
                            <p>👈 Select components from the library</p>
                            <small>Click to add to your screen</small>
                        </div>
                    ) : (
                        <div className="component-tree">
                            {screen.components.map((component, index) => (
                                <div
                                    key={component.id}
                                    className={`tree-node ${selectedComponent?.id === component.id ? "selected" : ""}`}
                                    onClick={() => setSelectedComponent(component)}
                                >
                                    <div className="node-header">
                                        <span className="node-index">{index + 1}</span>
                                        <span className="node-type">{component.type}</span>
                                        <span className="node-text">
                                            {component.text ? `"${component.text}"` : "(empty)"}
                                        </span>
                                        <button
                                            className="node-remove"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeComponent(component.id);
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Live Preview */}
                <div className="preview-panel">
                    <AppBuilderPreview
                        key={previewKey}
                        screen={screen}
                        autoRefresh={true}
                    />
                </div>
            </div>

            {/* Bottom: Property Editor */}
            {selectedComponent && (
                <div className="property-panel">
                    <h3>Properties: {selectedComponent.type}</h3>

                    <div className="property-grid">
                        {/* Text */}
                        {selectedComponent.type !== "image" && (
                            <div className="prop-field">
                                <label>Text:</label>
                                <input
                                    type="text"
                                    value={selectedComponent.text || ""}
                                    onChange={(e) => updateComponent(selectedComponent.id, { text: e.target.value })}
                                />
                            </div>
                        )}

                        {/* Color */}
                        {selectedComponent.props?.color !== undefined && (
                            <div className="prop-field">
                                <label>Color:</label>
                                <input
                                    type="color"
                                    value={selectedComponent.props.color}
                                    onChange={(e) => updateComponentProps(selectedComponent.id, "color", e.target.value)}
                                />
                            </div>
                        )}

                        {/* Size */}
                        {selectedComponent.props?.size !== undefined && (
                            <div className="prop-field">
                                <label>Size:</label>
                                <select
                                    value={selectedComponent.props.size}
                                    onChange={(e) => updateComponentProps(selectedComponent.id, "size", e.target.value)}
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>
                        )}

                        {/* Placeholder */}
                        {selectedComponent.props?.placeholder !== undefined && (
                            <div className="prop-field">
                                <label>Placeholder:</label>
                                <input
                                    type="text"
                                    value={selectedComponent.props.placeholder}
                                    onChange={(e) => updateComponentProps(selectedComponent.id, "placeholder", e.target.value)}
                                />
                            </div>
                        )}

                        {/* Image URL */}
                        {selectedComponent.type === "image" && (
                            <div className="prop-field">
                                <label>Image URL:</label>
                                <input
                                    type="text"
                                    value={selectedComponent.props.src}
                                    onChange={(e) => updateComponentProps(selectedComponent.id, "src", e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
