/**
 * Renderer - Code Evaluation Engine
 * Injiziert Code sicher in iframe Preview
 */

export function renderHTML(codeString) {
    const frame = document.getElementById("preview-frame");
    if (!frame) {
        console.error("Preview iframe nicht gefunden");
        return;
    }

    try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.open();
        doc.write(codeString);
        doc.close();
    } catch (err) {
        console.error("Render Error:", err);
        // Fallback: Zeige Fehler im iframe
        try {
            const doc = frame.contentDocument || frame.contentWindow.document;
            doc.open();
            doc.write(`
                <html>
                <body style="font-family: monospace; padding: 20px; background: #1e1e1e; color: #fff;">
                    <h2>❌ Render Fehler</h2>
                    <pre style="background: #2d2d2d; padding: 15px; border-radius: 5px;">
${err.message}
                    </pre>
                </body>
                </html>
            `);
            doc.close();
        } catch (fallbackErr) {
            console.error("Fallback Render Error:", fallbackErr);
        }
    }
}

/**
 * Rendert Flutter/Dart Code (wenn Flutter Web Preview später kommt)
 */
export function renderFlutter(dartCode) {
    const frame = document.getElementById("preview-frame");
    if (!frame) return;

    // Placeholder für Flutter Web Rendering
    try {
        const doc = frame.contentDocument || frame.contentWindow.document;
        doc.open();
        doc.write(`
            <html>
            <body style="font-family: monospace; padding: 20px; background: #fff; color: #000;">
                <h3>📱 Flutter Preview</h3>
                <p>Flutter Web Preview wird geladen...</p>
                <pre style="background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; max-height: 500px;">
${dartCode}
                </pre>
            </body>
            </html>
        `);
        doc.close();
    } catch (err) {
        console.error("Flutter Render Error:", err);
    }
}
