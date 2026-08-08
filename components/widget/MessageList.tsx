"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/types/scope";
import ChatBubble from "./ChatBubble";
import NetlikRing from "./NetlikRing";

interface MessageListProps {
  messages: ChatMessage[];
  isSending: boolean;
  className?: string;
}

export default function MessageList({ messages, isSending, className }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // scrollTop'u doğrudan ayarlıyoruz, scrollIntoView + boş bir div yerine —
    // o yöntem container'ın alt padding'i kadar bir boşluk bırakıyordu.
    container.scrollTop = container.scrollHeight;
  }, [messages, isSending]);

  return (
    <div ref={containerRef} className={`scroll-smooth ${className ?? ""}`}>
      {messages.map((m, i) => (
        <ChatBubble key={i} role={m.role} content={m.content} />
      ))}
      {isSending && (
        <div className="flex items-center gap-2 text-sm text-muted">
          <NetlikRing size={18} spinning />
          yazıyor...
        </div>
      )}
    </div>
  );
}
