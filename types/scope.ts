export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ScopePhase {
  name: string;
  description: string;
  estimatedDuration: string;
}

export interface ScopeDocument {
  projectTitle: string;
  summary: string;
  phases: ScopePhase[];
  estimatedDuration: string;
  estimatedBudget: string;
  attentionPoints: string[];
}
