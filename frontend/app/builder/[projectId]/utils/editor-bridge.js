/**
 * Editor Bridge - Sendet Code-Updates vom Editor zum Preview
 * Verbindet Monaco Editor mit Preview iframe
 */

let lastUpdateTime = 0;
const DEBOUNCE_MS = 300; // Verzögerung für Live-Updates

/**
 * Sendet Code-Update zum Preview iframe
 */
export function updatePreview(codeString, language = "html") {
    const frame = document.getElementById("preview-frame");
    if (!frame) {
        console.warn("Preview iframe nicht gefunden");
        return;
    }

    try {
        frame.contentWindow.postMessage(
            {
                type: "RENDER_CODE",
                payload: codeString,
                language: language,
            },
            "*" // Origin: In Production sollte das die echte Domain sein
        );
    } catch (err) {
        console.error("Update Preview Error:", err);
    }
}

/**
 * Debounced Update - Verzögert Updates für bessere Performance
 */
export function updatePreviewDebounced(codeString, language = "html") {
    const now = Date.now();
    if (now - lastUpdateTime < DEBOUNCE_MS) {
        // Zu früh, warte ab
        clearTimeout(window.previewUpdateTimeout);
        window.previewUpdateTimeout = setTimeout(() => {
            updatePreview(codeString, language);
            lastUpdateTime = Date.now();
        }, DEBOUNCE_MS);
    } else {
        // Genug Zeit vergangen, sofortiges Update
        updatePreview(codeString, language);
        lastUpdateTime = now;
    }
}

/**
 * Löscht Preview
 */
export function clearPreview() {
    const frame = document.getElementById("preview-frame");
    if (!frame) return;

    try {
        frame.contentWindow.postMessage(
            {
                type: "CLEAR_PREVIEW",
            },
            "*"
        );
    } catch (err) {
        console.error("Clear Preview Error:", err);
    }
}

/**
 * Aktualisiert Styles im Preview
 */
export function updatePreviewStyles(cssString) {
    const frame = document.getElementById("preview-frame");
    if (!frame) return;

    try {
        frame.contentWindow.postMessage(
            {
                type: "UPDATE_STYLES",
                payload: cssString,
            },
            "*"
        );
    } catch (err) {
        console.error("Update Styles Error:", err);
    }
}

/**
 * Initialisiert Editor Bridge und lädt Preview-Bridge Script in iframe
 */
export function initEditorBridge() {
    const frame = document.getElementById("preview-frame");
    if (!frame) return;

    // Warte auf iframe load
    frame.addEventListener("load", () => {
        console.log("✅ Editor Bridge bereit");
    });
}
