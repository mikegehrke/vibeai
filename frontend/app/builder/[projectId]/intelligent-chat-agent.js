/**
 * INTELLIGENT CHAT AGENT - Genau wie GitHub Copilot
 * 
 * Features:
 * - Versteht natürliche Sprache
 * - Erkennt automatisch Projekt-Anfragen
 * - Startet Generator automatisch
 * - WebSocket für Live-Updates
 * - Zeigt Datei-für-Datei Generierung
 */

export class IntelligentChatAgent {
    constructor() {
        this.ws = null;
        this.isConnected = false;
        this.messageCallbacks = [];
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    /**
     * Verbindet mit WebSocket Server
     */
    connect() {
        try {
            this.ws = new WebSocket('ws://localhost:8001');

            this.ws.onopen = () => {
                console.log('✅ WebSocket connected');
                this.isConnected = true;
                this.reconnectAttempts = 0;
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.handleMessage(data);
                } catch (err) {
                    console.error('WebSocket message parse error:', err);
                }
            };

            this.ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            this.ws.onclose = () => {
                console.log('❌ WebSocket disconnected');
                this.isConnected = false;
                this.attemptReconnect();
            };
        } catch (err) {
            console.error('WebSocket connection failed:', err);
        }
    }

    /**
     * Auto-Reconnect
     */
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => this.connect(), 2000 * this.reconnectAttempts);
        }
    }

    /**
     * Handle WebSocket Messages
     */
    handleMessage(data) {
        console.log('📨 WebSocket Message:', data.event);

        // Notify all callbacks
        this.messageCallbacks.forEach(callback => {
            try {
                callback(data);
            } catch (err) {
                console.error('Callback error:', err);
            }
        });
    }

    /**
     * Subscribe to WebSocket messages
     */
    onMessage(callback) {
        this.messageCallbacks.push(callback);
    }

    /**
     * Analysiert User-Prompt und erkennt Absicht
     */
    analyzePrompt(prompt) {
        const lower = prompt.toLowerCase();

        // Project Generation Keywords
        const projectKeywords = [
            'erstelle', 'erstell', 'mach', 'bau', 'generiere', 'generier',
            'vollständig', 'komplett', 'projekt', 'app', 'anwendung'
        ];

        const isProjectRequest = projectKeywords.some(keyword => lower.includes(keyword));

        // Framework Detection
        let framework = null;
        if (lower.includes('flutter')) framework = 'flutter';
        else if (lower.includes('react native')) framework = 'react-native';
        else if (lower.includes('nextjs') || lower.includes('next.js')) framework = 'nextjs';
        else if (lower.includes('react')) framework = 'react';
        else if (lower.includes('vue')) framework = 'vue';
        else if (lower.includes('angular')) framework = 'angular';

        // Extract Project Name
        let projectName = 'my_app';
        const nameMatch = prompt.match(/namens?\s+([a-zA-Z0-9_]+)/i) ||
            prompt.match(/genannt\s+([a-zA-Z0-9_]+)/i) ||
            prompt.match(/"([a-zA-Z0-9_]+)"/);
        if (nameMatch) {
            projectName = nameMatch[1];
        }

        return {
            isProjectRequest,
            framework,
            projectName,
            description: prompt,
            intent: isProjectRequest ? 'generate_project' : 'question'
        };
    }

    /**
     * Generiert Projekt via Backend API
     */
    async generateProject(analysis) {
        if (!analysis.framework) {
            throw new Error('Kein Framework erkannt. Bitte spezifiziere: Flutter, React, Next.js, etc.');
        }

        const response = await fetch('http://localhost:8000/api/builder/build-project-live', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_name: analysis.projectName,
                project_type: analysis.framework,
                description: analysis.description,
                model: 'gpt-4o'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Build failed');
        }

        return await response.json();
    }

    /**
     * Intelligente Chat-Antwort
     */
    async processMessage(userMessage, onUpdate) {
        const analysis = this.analyzePrompt(userMessage);

        if (analysis.intent === 'generate_project') {
            // PROJECT GENERATION
            try {
                // Confirmation Message
                onUpdate({
                    role: 'assistant',
                    content: `🚀 **Verstanden!** Ich generiere jetzt:\n\n` +
                        `- **Framework:** ${analysis.framework.toUpperCase()}\n` +
                        `- **Projekt:** ${analysis.projectName}\n` +
                        `- **Beschreibung:** ${analysis.description}\n\n` +
                        `⏱️ Einen Moment, ich starte die Generierung...`,
                    timestamp: new Date().toISOString()
                });

                // Start Generation
                const result = await this.generateProject(analysis);

                // Success Message
                onUpdate({
                    role: 'assistant',
                    content: `✅ **Projekt erfolgreich generiert!**\n\n` +
                        `📁 **${result.total_files} Dateien erstellt:**\n` +
                        result.files.slice(0, 10).map(f => `- ${f.path}`).join('\n') +
                        (result.files.length > 10 ? `\n- ... und ${result.files.length - 10} weitere` : '') +
                        `\n\n🎯 **Alle Dateien sind im Editor verfügbar!**\n` +
                        `▶️ Klicke auf eine Datei um sie zu öffnen.`,
                    timestamp: new Date().toISOString()
                });

                return result.files;

            } catch (err) {
                onUpdate({
                    role: 'assistant',
                    content: `❌ **Fehler bei der Generierung:**\n\n${err.message}\n\n` +
                        `Bitte versuche es erneut oder formuliere deine Anfrage anders.`,
                    timestamp: new Date().toISOString()
                });
                return null;
            }

        } else {
            // NORMAL QUESTION - Ask GPT-4o
            try {
                const response = await fetch('http://localhost:8000/chatgpt/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        prompt: `Du bist ein hilfreicher Coding-Assistent im VibeAI Builder.
            
USER FRAGE: ${userMessage}

Gebe eine hilfreiche, präzise Antwort. Wenn Code generiert wird, nutze Markdown Code-Blöcke.`,
                        model: 'gpt-4o'
                    })
                });

                const data = await response.json();
                const answer = data.response || data.message || 'Keine Antwort erhalten.';

                onUpdate({
                    role: 'assistant',
                    content: answer,
                    timestamp: new Date().toISOString()
                });

                return null;

            } catch (err) {
                onUpdate({
                    role: 'assistant',
                    content: `❓ Entschuldigung, ich konnte keine Antwort generieren. Fehler: ${err.message}`,
                    timestamp: new Date().toISOString()
                });
                return null;
            }
        }
    }

    /**
     * Disconnect WebSocket
     */
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.isConnected = false;
        }
    }
}

// Export singleton
export const chatAgent = new IntelligentChatAgent();
