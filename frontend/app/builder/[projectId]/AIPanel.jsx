// -------------------------------------------------------------
// VIBEAI – AI PANEL COMPONENT ⭐ CRITICAL
// -------------------------------------------------------------
/**
 * AI Assistant Panel - Live Chat Integration
 * 
 * 🤖 FEATURES:
 * - Real-time AI chat during development
 * - Code improvements & suggestions
 * - UI optimization recommendations
 * - Build error explanations
 * - Auto-generate components
 * - Direct file writing
 * - Context-aware assistance
 * - Multi-agent orchestrator connection
 * 
 * The AI works as a Senior Developer sitting next to you!
 */

"use client";

import { useState, useEffect, useRef } from "react";

export default function AIPanel({ projectId }) {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Auto-scroll to bottom on new messages
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        // Load initial welcome message
        setMessages([{
            role: 'ai',
            content: `🤖 AI Assistant ready!\n\nI can help you with:
• Code improvements & optimization
• UI/UX suggestions
• Generate new components
• Fix build errors
• Explain code patterns
• Refactor existing code

Just ask me anything about your project!`,
            timestamp: new Date().toISOString()
        }]);
    }, []);

    async function sendPrompt(e) {
        e?.preventDefault();
        
        if (!input.trim() || loading) return;

        const userMessage = {
            role: 'user',
            content: input,
            timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        const promptText = input; // Store before clearing
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:8000/ai/orchestrator", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ 
                    project_id: projectId,
                    prompt: promptText,
                    context: {
                        type: 'builder',
                        action: 'chat',
                        files: [] // Could add currently open files
                    }
                })
            });

            if (!res.ok) {
                throw new Error(`API Error: ${res.status}`);
            }

            const data = await res.json();

            const aiMessage = {
                role: 'ai',
                content: formatAIResponse(data),
                timestamp: new Date().toISOString(),
                raw: data,
                agent: data.agent
            };

            setMessages(prev => [...prev, aiMessage]);

            // ⭐ BLOCK 16: Auto-reload on UI/Preview changes
            // wenn KI UI oder Code generiert → sofort reload
            if (data.agent === "preview_agent" || 
                data.agent === "ui_agent" || 
                data.actions?.includes("file_write") ||
                data.actions?.includes("ui_update")) {
                
                console.log("🔄 AI modified UI/Preview - Auto-reloading...");
                
                // Show reload notification
                const reloadMessage = {
                    role: 'system',
                    content: '🔄 Preview updated! Reloading in 2 seconds...',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, reloadMessage]);

                // Reload after 2 seconds to let user see the change
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
            }

        } catch (error) {
            console.error("❌ Error sending prompt:", error);
            
            const errorMessage = {
                role: 'ai',
                content: `❌ Error: ${error.message}\n\nPlease make sure the backend is running on port 8000.`,
                timestamp: new Date().toISOString(),
                isError: true
            };

            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setLoading(false);
        }
    }

    function formatAIResponse(data) {
        // Format orchestrator response
        if (data.response) {
            return data.response;
        }

        if (data.result) {
            return JSON.stringify(data.result, null, 2);
        }

        if (data.message) {
            return data.message;
        }

        // Fallback to raw JSON
        return JSON.stringify(data, null, 2);
    }

    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendPrompt();
        }
    }

    function clearChat() {
        setMessages([{
            role: 'ai',
            content: '🤖 Chat cleared. How can I help you?',
            timestamp: new Date().toISOString()
        }]);
    }

    return (
        <div className="ai-chat-container">
            {/* Header */}
            <div className="ai-chat-header">
                <div className="ai-chat-title">
                    <span className="ai-status"></span>
                    🤖 AI Assistant
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                        className="preview-btn"
                        onClick={clearChat}
                        title="Clear chat"
                    >
                        🗑️
                    </button>
                    
                    <div 
                        className="preview-btn"
                        style={{ 
                            background: isConnected ? '#4caf50' : '#f44336',
                            color: 'white',
                            cursor: 'default'
                        }}
                    >
                        {isConnected ? '🟢 Online' : '🔴 Offline'}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="ai-messages">
                {messages.map((msg, index) => (
                    <div 
                        key={index}
                        className={`ai-message message-${msg.role}`}
                    >
                        <div className="message-label">
                            {msg.role === 'user' ? '👤 You' : '🤖 AI Assistant'}
                        </div>
                        
                        <div 
                            className="message-content"
                            style={{
                                borderLeftColor: msg.isError ? '#f44336' : undefined
                            }}
                        >
                            <pre style={{ 
                                margin: 0, 
                                whiteSpace: 'pre-wrap',
                                fontFamily: msg.role === 'ai' && msg.raw 
                                    ? 'monospace' 
                                    : 'inherit'
                            }}>
                                {msg.content}
                            </pre>
                        </div>
                        
                        <div style={{ 
                            fontSize: '10px', 
                            color: '#666', 
                            marginTop: '5px' 
                        }}>
                            {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="ai-message message-ai">
                        <div className="message-label">🤖 AI Assistant</div>
                        <div className="message-content">
                            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                                Thinking...
                            </div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendPrompt} className="ai-input-container">
                <input
                    type="text"
                    className="ai-input"
                    placeholder="Ask AI to improve code, generate components, fix bugs..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                />
                
                <button 
                    type="submit"
                    className="ai-send-btn"
                    disabled={loading || !input.trim()}
                >
                    {loading ? '⏳' : '🚀'} Send
                </button>
            </form>

            {/* Typing indicator styles */}
            <style jsx>{`
                .typing-indicator {
                    display: inline-flex;
                    gap: 4px;
                }
                
                .typing-indicator span {
                    width: 6px;
                    height: 6px;
                    background: #9c27b0;
                    border-radius: 50%;
                    animation: typing 1.4s infinite;
                }
                
                .typing-indicator span:nth-child(2) {
                    animation-delay: 0.2s;
                }
                
                .typing-indicator span:nth-child(3) {
                    animation-delay: 0.4s;
                }
                
                @keyframes typing {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 0.7;
                    }
                    30% {
                        transform: translateY(-10px);
                        opacity: 1;
                    }
                }
            `}</style>
        </div>
    );
}
