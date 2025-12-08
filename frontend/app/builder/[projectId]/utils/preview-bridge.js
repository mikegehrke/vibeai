/**
 * Preview Bridge - Message Listener für iframe
 * Läuft im iframe-Kontext und empfängt Code-Updates
 */

import { renderFlutter, renderHTML } from "./renderer.js";

let isInitialized = false;

export function initPreviewBridge() {
    if (isInitialized) return;
    isInitialized = true;

    window.addEventListener("message", (event) => {
        // Security: Prüfe Origin
        if (!event.data || typeof event.data !== "object") return;

        const { type, payload, language } = event.data;

        switch (type) {
            case "RENDER_CODE":
                if (language === "dart" || language === "flutter") {
                    renderFlutter(payload);
                } else {
                    renderHTML(payload);
                }
                break;

            case "CLEAR_PREVIEW":
                clearPreview();
                break;

            case "UPDATE_STYLES":
                updateStyles(payload);
                break;

            default:
                console.log("Unknown message type:", type);
        }
    });

    console.log("✅ Preview Bridge initialisiert");
}

function clearPreview() {
    const frame = document.getElementById("preview-frame");
    if (!frame) return;

    try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.open();
        doc.write(`
            <html>
            <body style="display: flex; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif; background: #f5f5f5; color: #666;">
                <div style="text-align: center;">
                    <h2>📱 Preview</h2>
                    <p>Code wird hier angezeigt...</p>
                </div>
            </body>
            </html>
        `);
        doc.close();
    } catch (err) {
        console.error("Clear Preview Error:", err);
    }
}

function updateStyles(cssString) {
    const frame = document.getElementById("preview-frame");
    if (!frame) return;

    try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        const style = doc.createElement("style");
        style.textContent = cssString;
        doc.head.appendChild(style);
    } catch (err) {
        console.error("Update Styles Error:", err);
    }
}

// Auto-Initialize wenn als Script geladen
if (typeof window !== "undefined") {
    initPreviewBridge();
}
