"use client";

import { useState } from "react";
import type { TechnicalPlanDocument } from "@/types/plan";
import { formatPlanMarkdown } from "@/lib/formatPlanMarkdown";

interface PlanDocumentViewProps {
  document: TechnicalPlanDocument;
}

function BulletList({ items, accent = false }: { items: string[]; accent?: boolean }) {
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-muted">
          <span className={accent ? "text-accent-orange" : "text-accent-cyan"}>•</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default function PlanDocumentView({ document: doc }: PlanDocumentViewProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");

  const markdown = formatPlanMarkdown(doc);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopyState("copied");
    } catch {
      setCopyState("error");
    } finally {
      setTimeout(() => setCopyState("idle"), 2000);
    }
  }

  function handleDownload() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = "proje-plani.md";
    window.document.body.appendChild(anchor);
    anchor.click();
    window.document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-surface p-5 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div />
        <div className="flex shrink-0 gap-2">
          <button
            onClick={handleCopy}
            className="rounded-lg border border-border px-2.5 py-1 text-xs text-muted transition-colors hover:text-foreground"
          >
            {copyState === "copied"
              ? "Kopyalandı!"
              : copyState === "error"
                ? "Kopyalanamadı"
                : "Kopyala"}
          </button>
          <button
            onClick={handleDownload}
            className="rounded-lg border border-accent-cyan/40 px-2.5 py-1 text-xs text-accent-cyan transition-colors hover:bg-accent-cyan/10"
          >
            İndir (.md)
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground">{doc.projectTitle}</h2>
        <p className="mt-1 text-muted">{doc.summary}</p>
        {doc.targetUsers && (
          <p className="mt-2 text-xs text-muted">
            <span className="text-foreground">Hedef Kullanıcı:</span> {doc.targetUsers}
          </p>
        )}
      </div>

      {doc.scopeIncluded.length > 0 && (
        <Section title="Kapsam (MVP)">
          <BulletList items={doc.scopeIncluded} />
        </Section>
      )}

      {doc.scopeExcluded.length > 0 && (
        <Section title="Kapsam Dışı">
          <BulletList items={doc.scopeExcluded} accent />
        </Section>
      )}

      {doc.suggestedTechStack.length > 0 && (
        <Section title="Önerilen Teknoloji Yığını">
          <div className="flex flex-col gap-2">
            {doc.suggestedTechStack.map((t, i) => (
              <div key={i} className="rounded-lg bg-surface-raised p-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs text-muted">{t.area}</span>
                  <span className="font-medium text-accent-cyan">{t.choice}</span>
                </div>
                <p className="mt-1 text-muted">{t.reasoning}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {doc.architectureOverview && (
        <Section title="Mimari Genel Bakış">
          <p className="whitespace-pre-wrap text-muted">{doc.architectureOverview}</p>
        </Section>
      )}

      {doc.dataModel && (
        <Section title="Veri Modeli">
          <p className="whitespace-pre-wrap text-muted">{doc.dataModel}</p>
        </Section>
      )}

      {doc.apiEndpoints.length > 0 && (
        <Section title="API Endpoint'leri">
          <div className="flex flex-col gap-1.5">
            {doc.apiEndpoints.map((e, i) => (
              <div key={i} className="rounded-lg bg-surface-raised p-3">
                <span className="font-mono text-xs text-accent-cyan">{e.method}</span>{" "}
                <span className="font-mono text-xs text-foreground">{e.path}</span>
                <p className="mt-1 text-muted">{e.description}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {doc.environmentVariables.length > 0 && (
        <Section title="Ortam Değişkenleri">
          <BulletList items={doc.environmentVariables} />
        </Section>
      )}

      {doc.phases.length > 0 && (
        <Section title="Yapılacaklar Listesi (Fazlar)">
          <ol className="flex flex-col gap-3">
            {doc.phases.map((phase, i) => (
              <li key={i} className="rounded-lg bg-surface-raised p-3">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-foreground">
                    {i + 1}. {phase.name}
                  </span>
                  <span className="shrink-0 text-xs text-accent-orange">
                    {phase.complexity}
                  </span>
                </div>
                <p className="mt-1 text-muted">{phase.goal}</p>
                <ul className="mt-2 flex flex-col gap-1">
                  {phase.tasks.map((task, j) => (
                    <li key={j} className="flex gap-2 text-xs text-muted">
                      <span className="text-accent-cyan">-</span>
                      {task}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {doc.openQuestions.length > 0 && (
        <Section title="Eksikler / Netleştirilmesi Gerekenler">
          <BulletList items={doc.openQuestions} accent />
        </Section>
      )}

      {doc.strengths.length > 0 && (
        <Section title="Artılar">
          <BulletList items={doc.strengths} />
        </Section>
      )}

      {doc.risks.length > 0 && (
        <Section title="Riskler">
          <BulletList items={doc.risks} accent />
        </Section>
      )}
    </div>
  );
}
