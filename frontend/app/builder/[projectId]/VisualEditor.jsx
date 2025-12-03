// -------------------------------------------------------------
// VIBEAI – DRAG & DROP VISUAL EDITOR ⭐ BLOCK 17
// -------------------------------------------------------------
/**
 * Visual Editor - Figma-Style UI Builder
 * 
 * BLOCK 17: DRAG-AND-DROP VISUAL EDITOR
 * 
 * Features:
 * - Real drag & drop (HTML5 API)
 * - Component palette with draggable items
 * - Canvas with drop zones
 * - Live property editor
 * - Component reordering
 * - Visual feedback during drag
 * - Auto-save to screen state
 * 
 * Layout:
 * - Left: Component Palette (draggable)
 * - Center: Canvas (drop zone)
 * - Right: Property Editor
 */

"use client";

import { useState, useEffect } from "react";

export default function VisualEditor({ screen, setScreen, projectId }) {
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [draggedComponent, setDraggedComponent] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    // Component palette
    const components = [
        { type: "text", label: "📝 Text", icon: "📝" },
        { type: "button", label: "🔘 Button", icon: "🔘" },
        { type: "input", label: "⌨️ Input", icon: "⌨️" },
        { type: "image", label: "🖼️ Image", icon: "🖼️" },
        { type: "container", label: "📦 Container", icon: "📦" }
    ];

    useEffect(() => {
        // Initialize with empty screen if not provided
        if (!screen || !screen.components) {
            setScreen({
                title: screen?.title || "New Screen",
                components: []
            });
        }
    }, [screen, setScreen]);

    /**
     * Add component from palette
     */
    function addComponent(type) {
        const newComp = {
            type,
            id: `comp_${Date.now()}`,
            value: type === "text" ? "Text Label" : "",
            label: type === "button" ? "Click Me" : "",
            placeholder: type === "input" ? "Enter value" : "",
            url: type === "image" ? "https://placehold.co/200" : "",
            size: type === "text" ? 16 : 14,
            color: type === "button" ? "#007AFF" : "#000000",
            padding: 12,
            margin: 8
        };

        const updated = {
            ...screen,
            components: [...(screen.components || []), newComp]
        };

        setScreen(updated);
        setSelectedIndex((screen.components || []).length);
    }

    /**
     * Update component property
     */
    function updateProperty(key, value) {
        if (selectedIndex === null) return;

        const updated = { ...screen };
        updated.components[selectedIndex][key] = value;
        setScreen(updated);
    }

    /**
     * Delete component
     */
    function deleteComponent(index) {
        const updated = {
            ...screen,
            components: screen.components.filter((_, i) => i !== index)
        };
        setScreen(updated);
        setSelectedIndex(null);
    }

    // ========================================
    // DRAG & DROP HANDLERS
    // ========================================

    /**
     * Handle drag start from palette
     */
    function handleDragStartPalette(e, type) {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('componentType', type);
        setDraggedComponent({ source: 'palette', type });
    }

    /**
     * Handle drag start from canvas (reordering)
     */
    function handleDragStartCanvas(e, index) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('componentIndex', index.toString());
        setDraggedComponent({ source: 'canvas', index });
    }

    /**
     * Handle drag over canvas
     */
    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = draggedComponent?.source === 'palette' ? 'copy' : 'move';
    }

    /**
     * Handle drag over specific component (for reordering)
     */
    function handleDragOverComponent(e, index) {
        e.preventDefault();
        e.stopPropagation();
        setDragOverIndex(index);
    }

    /**
     * Handle drag leave
     */
    function handleDragLeave() {
        setDragOverIndex(null);
    }

    /**
     * Handle drop on canvas
     */
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();

        const type = e.dataTransfer.getData('componentType');
        const sourceIndex = e.dataTransfer.getData('componentIndex');

        if (type) {
            // Drop from palette - add new component
            addComponent(type);
        } else if (sourceIndex !== '') {
            // Drop from canvas - reorder (at end)
            const index = parseInt(sourceIndex);
            reorderComponent(index, screen.components.length - 1);
        }

        setDraggedComponent(null);
        setDragOverIndex(null);
    }

    /**
     * Handle drop on specific component (reordering)
     */
    function handleDropOnComponent(e, targetIndex) {
        e.preventDefault();
        e.stopPropagation();

        const sourceIndex = e.dataTransfer.getData('componentIndex');

        if (sourceIndex !== '') {
            const index = parseInt(sourceIndex);
            reorderComponent(index, targetIndex);
        }

        setDraggedComponent(null);
        setDragOverIndex(null);
    }

    /**
     * Reorder components
     */
    function reorderComponent(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;

        const updated = { ...screen };
        const components = [...updated.components];
        const [removed] = components.splice(fromIndex, 1);
        components.splice(toIndex, 0, removed);
        updated.components = components;

        setScreen(updated);
        setSelectedIndex(toIndex);
    }

    /**
     * Render component preview on canvas
     */
    function renderComponentPreview(comp, index) {
        const isSelected = selectedIndex === index;
        const isDragOver = dragOverIndex === index;

        const baseStyle = {
            padding: `${comp.padding || 12}px`,
            margin: `${comp.margin || 8}px 0`,
            background: isSelected ? "#444" : "#333",
            cursor: "pointer",
            borderRadius: 6,
            border: isDragOver ? "2px solid #007AFF" : "1px solid #555",
            transition: "all 0.2s",
            position: "relative"
        };

        return (
            <div
                key={comp.id || index}
                draggable
                onDragStart={(e) => handleDragStartCanvas(e, index)}
                onDragOver={(e) => handleDragOverComponent(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDropOnComponent(e, index)}
                onClick={() => setSelectedIndex(index)}
                style={baseStyle}
            >
                {/* Component Type Badge */}
                <div style={{
                    position: "absolute",
                    top: 4,
                    right: 4,
                    fontSize: 10,
                    background: "#007AFF",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: 3
                }}>
                    {comp.type}
                </div>

                {/* Component Preview */}
                {comp.type === "text" && (
                    <div style={{ 
                        fontSize: `${comp.size}px`, 
                        color: comp.color || "white" 
                    }}>
                        {comp.value || "Text"}
                    </div>
                )}

                {comp.type === "button" && (
                    <button style={{
                        padding: `${comp.padding}px`,
                        background: comp.color || "#007AFF",
                        color: "white",
                        border: "none",
                        borderRadius: 6,
                        fontSize: `${comp.size}px`,
                        cursor: "pointer"
                    }}>
                        {comp.label || "Button"}
                    </button>
                )}

                {comp.type === "input" && (
                    <input
                        placeholder={comp.placeholder || "Input"}
                        style={{
                            width: "100%",
                            padding: `${comp.padding}px`,
                            fontSize: `${comp.size}px`,
                            background: "#000",
                            color: "white",
                            border: "1px solid #666",
                            borderRadius: 4
                        }}
                        readOnly
                    />
                )}

                {comp.type === "image" && (
                    <img
                        src={comp.url || "https://placehold.co/200"}
                        alt="preview"
                        style={{
                            maxWidth: "100%",
                            height: "auto",
                            borderRadius: 4
                        }}
                    />
                )}

                {comp.type === "container" && (
                    <div style={{
                        padding: `${comp.padding}px`,
                        background: "#222",
                        borderRadius: 4,
                        border: "1px dashed #666"
                    }}>
                        📦 Container (drop components here)
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={styles.container}>
            
            {/* ===== LEFT PANEL - Component Palette ===== */}
            <div style={styles.palette}>
                <h3 style={styles.paletteTitle}>🎨 Components</h3>
                <div style={styles.paletteGrid}>
                    {components.map((c) => (
                        <div
                            key={c.type}
                            draggable
                            onDragStart={(e) => handleDragStartPalette(e, c.type)}
                            style={styles.paletteItem}
                        >
                            <div style={styles.paletteIcon}>{c.icon}</div>
                            <div style={styles.paletteLabel}>{c.label}</div>
                        </div>
                    ))}
                </div>

                {/* Quick Add Buttons */}
                <div style={styles.quickAdd}>
                    <h4 style={styles.quickAddTitle}>Quick Add</h4>
                    {components.map((c) => (
                        <button
                            key={`btn-${c.type}`}
                            onClick={() => addComponent(c.type)}
                            style={styles.quickAddButton}
                        >
                            {c.icon} {c.type}
                        </button>
                    ))}
                </div>
            </div>

            {/* ===== CENTER PANEL - Canvas ===== */}
            <div 
                style={styles.canvas}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div style={styles.canvasHeader}>
                    <h3 style={styles.canvasTitle}>
                        📱 {screen?.title || "New Screen"}
                    </h3>
                    <div style={styles.canvasInfo}>
                        {screen?.components?.length || 0} components
                    </div>
                </div>

                <div style={styles.canvasContent}>
                    {(!screen?.components || screen.components.length === 0) ? (
                        <div style={styles.emptyState}>
                            <div style={styles.emptyIcon}>🎨</div>
                            <div style={styles.emptyTitle}>Drag & Drop Components</div>
                            <div style={styles.emptyText}>
                                Drag components from the left palette or use Quick Add buttons
                            </div>
                        </div>
                    ) : (
                        screen.components.map((comp, i) => renderComponentPreview(comp, i))
                    )}
                </div>
            </div>

            {/* ===== RIGHT PANEL - Properties ===== */}
            <div style={styles.properties}>
                <h3 style={styles.propertiesTitle}>⚙️ Properties</h3>

                {selectedIndex === null ? (
                    <div style={styles.noSelection}>
                        <div style={styles.noSelectionIcon}>👆</div>
                        <div>Select a component</div>
                    </div>
                ) : (
                    <div style={styles.propertyList}>
                        {/* Component Info */}
                        <div style={styles.propertySection}>
                            <div style={styles.propertySectionTitle}>
                                Component Type
                            </div>
                            <div style={styles.componentType}>
                                {screen.components[selectedIndex].type}
                            </div>
                        </div>

                        {/* Properties */}
                        <div style={styles.propertySection}>
                            <div style={styles.propertySectionTitle}>
                                Properties
                            </div>
                            {Object.keys(screen.components[selectedIndex])
                                .filter(key => key !== 'id' && key !== 'type')
                                .map((key) => (
                                    <div key={key} style={styles.propertyField}>
                                        <label style={styles.propertyLabel}>
                                            {key}
                                        </label>
                                        <input
                                            style={styles.propertyInput}
                                            value={screen.components[selectedIndex][key]}
                                            onChange={(e) => updateProperty(key, e.target.value)}
                                        />
                                    </div>
                                ))
                            }
                        </div>

                        {/* Actions */}
                        <div style={styles.propertySection}>
                            <button
                                onClick={() => deleteComponent(selectedIndex)}
                                style={styles.deleteButton}
                            >
                                🗑️ Delete Component
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ========================================
// STYLES
// ========================================

const styles = {
    container: {
        display: "flex",
        height: "100%",
        background: "#1a1a1a",
        color: "#fff",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    },

    // ===== PALETTE =====
    palette: {
        width: 220,
        borderRight: "1px solid #333",
        padding: 15,
        overflowY: "auto",
        background: "#1e1e1e"
    },
    paletteTitle: {
        margin: "0 0 15px 0",
        fontSize: 16,
        fontWeight: 600,
        color: "#fff"
    },
    paletteGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
        marginBottom: 20
    },
    paletteItem: {
        padding: 15,
        background: "#2a2a2a",
        borderRadius: 8,
        textAlign: "center",
        cursor: "grab",
        border: "2px solid transparent",
        transition: "all 0.2s",
        userSelect: "none"
    },
    paletteIcon: {
        fontSize: 32,
        marginBottom: 8
    },
    paletteLabel: {
        fontSize: 11,
        color: "#aaa"
    },
    quickAdd: {
        marginTop: 20,
        paddingTop: 20,
        borderTop: "1px solid #333"
    },
    quickAddTitle: {
        margin: "0 0 10px 0",
        fontSize: 13,
        fontWeight: 600,
        color: "#999"
    },
    quickAddButton: {
        display: "block",
        width: "100%",
        marginBottom: 8,
        padding: "8px 12px",
        background: "#007AFF",
        color: "white",
        border: "none",
        borderRadius: 6,
        fontSize: 12,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.2s"
    },

    // ===== CANVAS =====
    canvas: {
        flex: 1,
        background: "#222",
        overflowY: "auto",
        position: "relative"
    },
    canvasHeader: {
        padding: "15px 20px",
        background: "#2a2a2a",
        borderBottom: "1px solid #333",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 10
    },
    canvasTitle: {
        margin: 0,
        fontSize: 16,
        fontWeight: 600,
        color: "#fff"
    },
    canvasInfo: {
        fontSize: 12,
        color: "#999"
    },
    canvasContent: {
        padding: 20,
        minHeight: "calc(100% - 60px)"
    },
    emptyState: {
        textAlign: "center",
        padding: "60px 20px",
        color: "#666"
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 20
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 600,
        marginBottom: 10,
        color: "#999"
    },
    emptyText: {
        fontSize: 14,
        color: "#666"
    },

    // ===== PROPERTIES =====
    properties: {
        width: 280,
        borderLeft: "1px solid #333",
        padding: 15,
        overflowY: "auto",
        background: "#1e1e1e"
    },
    propertiesTitle: {
        margin: "0 0 20px 0",
        fontSize: 16,
        fontWeight: 600,
        color: "#fff"
    },
    noSelection: {
        textAlign: "center",
        padding: "40px 20px",
        color: "#666"
    },
    noSelectionIcon: {
        fontSize: 48,
        marginBottom: 15
    },
    propertyList: {
        display: "flex",
        flexDirection: "column",
        gap: 20
    },
    propertySection: {
        paddingBottom: 15,
        borderBottom: "1px solid #333"
    },
    propertySectionTitle: {
        fontSize: 12,
        fontWeight: 600,
        color: "#999",
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: "0.5px"
    },
    componentType: {
        padding: "10px 12px",
        background: "#007AFF",
        color: "white",
        borderRadius: 6,
        fontSize: 14,
        fontWeight: 600,
        textAlign: "center"
    },
    propertyField: {
        marginBottom: 12
    },
    propertyLabel: {
        display: "block",
        fontSize: 12,
        color: "#aaa",
        marginBottom: 6,
        textTransform: "capitalize"
    },
    propertyInput: {
        width: "100%",
        padding: "8px 10px",
        background: "#000",
        color: "white",
        border: "1px solid #444",
        borderRadius: 4,
        fontSize: 13,
        outline: "none",
        transition: "border 0.2s"
    },
    deleteButton: {
        width: "100%",
        padding: "10px 12px",
        background: "#ff3b30",
        color: "white",
        border: "none",
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s"
    }
};
