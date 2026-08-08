import type { ChatMessage } from "@/types/scope";
import NetlikRing from "./NetlikRing";

export default function ChatBubble({ role, content }: ChatMessage) {
  const isUser = role === "user";

  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <div className="mb-1 shrink-0">
          <NetlikRing size={22} />
        </div>
      )}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "rounded-br-sm bg-accent-cyan text-background"
            : "rounded-bl-sm bg-surface-raised text-foreground"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
