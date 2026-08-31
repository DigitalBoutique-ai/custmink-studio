"use client";

import { useState } from "react";
import { Send, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Message = { role: "ai" | "user"; text: string };

const openingMessage: Message = {
  role: "ai",
  text: "I reviewed this tech pack. The core specification is strong. I can draft missing construction notes, validate grading, or prepare factory questions.",
};

/**
 * Contextual copilot drawer.
 *
 * Replies are still canned. Phase 5 wires this to structured, Zod-validated
 * model output with a review screen before any product mutation is applied.
 */
export function AiPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([openingMessage]);

  const send = () => {
    if (!message.trim()) return;
    setMessages([
      ...messages,
      { role: "user", text: message },
      {
        role: "ai",
        text: "I drafted the requested update and flagged the items that still need your approval. Review the suggested changes before adding them to the tech pack.",
      },
    ]);
    setMessage("");
  };

  return (
    <aside className={open ? "ai-panel open" : "ai-panel"} aria-hidden={!open}>
      <div className="ai-panel-header">
        <div>
          <span className="ai-orb">
            <Sparkles />
          </span>
          <div>
            <strong>Studio AI</strong>
            <small>Product development copilot</small>
          </div>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close copilot">
          <X />
        </button>
      </div>
      <div className="ai-context">
        <Badge variant="outline">Riviera Hoodie</Badge>
        <span>Context: complete tech pack</span>
      </div>
      <div className="message-list">
        {messages.map((item, index) => (
          <div key={index} className={`message ${item.role}`}>
            <span>{item.role === "ai" ? <Sparkles /> : "TD"}</span>
            <p>{item.text}</p>
          </div>
        ))}
      </div>
      <div className="suggestion-chips">
        <button onClick={() => setMessage("Draft the missing construction notes")}>
          Draft construction notes
        </button>
        <button onClick={() => setMessage("Validate the size grading")}>Validate grading</button>
        <button onClick={() => setMessage("Write factory questions")}>Factory questions</button>
      </div>
      <div className="message-composer">
        <Textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask about this product…"
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
        />
        <Button size="icon" onClick={send} aria-label="Send message">
          <Send />
        </Button>
      </div>
    </aside>
  );
}
