"use client";

import { useState, useRef } from "react";

export function useSSEChat() {
  const [messages, setMessages] = useState([]);
  const [running, setRunning] = useState(false);
  const sourceRef = useRef(null);

  const sendMessage = (task) => {
    if (!task || running) return;

    setMessages([]);
    setRunning(true);

    const url = `/api/chat/stream?task=${encodeURIComponent(task)}`;

    const source = new EventSource(url);
    sourceRef.current = source;

    source.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages((prev) => [...prev, data]);

      if (data.type === "done" || data.type === "error") {
        source.close();
        setRunning(false);
      }
    };

    source.onerror = (err) => {
      console.error("SSE error", err);
      source.close();
      setRunning(false);
    };
  };

  const stop = () => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
      setRunning(false);
    }
  };

  return {
    messages,
    running,
    sendMessage,
    stop,
  };
}
