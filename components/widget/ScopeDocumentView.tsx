"use client";

import { useState } from "react";
import type { ScopeDocument } from "@/types/scope";

interface ScopeDocumentViewProps {
  document: ScopeDocument;
}

function toPlainText(document: ScopeDocument): string {
  const lines = [
    document.projectTitle,
    "",
    document.summary,
    "",
    `Tahmini Süre: ${document.estimatedDuration}`,
    `Tahmini Bütçe: ${document.estimatedBudget}`,
    "",
    "Fazlar:",
    ...document.phases.map(
      (phase, i) =>
        `${i + 1}. ${phase.name} (${phase.estimatedDuration}) — ${phase.description}`
    ),
  ];
  if (document.attentionPoints.length > 0) {
    lines.push("", "Dikkat Noktaları:", ...document.attentionPoints.map((p) => `- ${p}`));
  }
  return lines.join("\n");
}

export default function ScopeDocumentView({ document }: ScopeDocumentViewProps) {
  const [shareState, setShareState] = useState<"idle" | "copied" | "error">("idle");

  async function handleShare() {
    const text = toPlainText(document);
    try {
      if (navigator.share) {
        await navigator.share({ title: document.projectTitle, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareState("copied");
      setTimeout(() => setShareState("idle"), 2000);
    } catch {
      setShareState("error");
      setTimeout(() => setShareState("idle"), 2000);
    }
  }

  return (
    <div className="scope-print-area flex flex-col gap-5 rounded-2xl border border-border bg-surface p-5 text-sm">
      <div className="flex items-start justify-between gap-3 print:hidden">
        <div />
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleShare}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            {shareState === "copied"
              ? "Kopyalandı!"
              : shareState === "error"
                ? "Kopyalanamadı"
                : "Paylaş"}
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            Yazdır
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {document.projectTitle}
        </h2>
        <p className="mt-1 text-muted">{document.summary}</p>
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="rounded-lg bg-surface-raised px-3 py-2">
          <div className="text-muted">Tahmini Süre</div>
          <div className="font-medium text-accent-cyan">
            {document.estimatedDuration}
          </div>
        </div>
        <div className="rounded-lg bg-surface-raised px-3 py-2">
          <div className="text-muted">Tahmini Bütçe</div>
          <div className="font-medium text-accent-orange">
            {document.estimatedBudget}
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
          Fazlar
        </h3>
        <ol className="flex flex-col gap-3">
          {document.phases.map((phase, i) => (
            <li key={i} className="rounded-lg bg-surface-raised p-3">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-medium text-foreground">
                  {i + 1}. {phase.name}
                </span>
                <span className="shrink-0 text-xs text-muted">
                  {phase.estimatedDuration}
                </span>
              </div>
              <p className="mt-1 text-muted">{phase.description}</p>
            </li>
          ))}
        </ol>
      </div>

      {document.attentionPoints.length > 0 && (
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
            Dikkat Noktaları
          </h3>
          <ul className="flex flex-col gap-1.5">
            {document.attentionPoints.map((point, i) => (
              <li key={i} className="flex gap-2 text-muted">
                <span className="text-accent-orange">•</span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
