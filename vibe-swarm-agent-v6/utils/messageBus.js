const EventEmitter = require("eventemitter3");

/**
 * Message Bus for agent-to-agent communication
 * Allows agents to communicate and coordinate
 */
class MessageBus extends EventEmitter {
  constructor() {
    super();
    this.messages = [];
  }

  /**
   * Send message from one agent to another
   */
  send(from, to, message, data = null) {
    const msg = {
      timestamp: new Date().toISOString(),
      from,
      to,
      message,
      data
    };

    this.messages.push(msg);
    this.emit("agent-message", msg);

    // Also emit to specific agent
    if (to !== "all") {
      this.emit(`message-to-${to}`, msg);
    }
  }

  /**
   * Get all messages
   */
  getMessages() {
    return this.messages;
  }

  /**
   * Get messages for specific agent
   */
  getMessagesFor(agentName) {
    return this.messages.filter(m => m.to === agentName || m.to === "all");
  }

  /**
   * Clear message history
   */
  clear() {
    this.messages = [];
  }
}

// Export singleton instance
module.exports = new MessageBus();
