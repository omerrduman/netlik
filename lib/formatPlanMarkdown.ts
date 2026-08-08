import type { TechnicalPlanDocument } from "@/types/plan";

function bulletList(items: string[]): string {
  return items.map((item) => `- ${item}`).join("\n");
}

function checklist(items: string[]): string {
  return items.map((item) => `- [ ] ${item}`).join("\n");
}

/**
 * Bir TechnicalPlanDocument'ı, bir kodlama AI'sına verilmek üzere hazırlanmış
 * bir Markdown belgesine dönüştürür. Karşılık gelen alanı boş olan bölümler,
 * boş bir başlık olarak yazdırılmak yerine tamamen atlanır.
 */
export function formatPlanMarkdown(doc: TechnicalPlanDocument): string {
  const sections: string[] = [];

  sections.push(`# ${doc.projectTitle}`);
  sections.push(doc.summary);
  if (doc.targetUsers) {
    sections.push(`**Hedef Kullanıcı:** ${doc.targetUsers}`);
  }

  if (doc.scopeIncluded.length > 0) {
    sections.push(`## Kapsam (MVP)\n\n${checklist(doc.scopeIncluded)}`);
  }

  if (doc.scopeExcluded.length > 0) {
    sections.push(`## Kapsam Dışı\n\n${bulletList(doc.scopeExcluded)}`);
  }

  if (doc.suggestedTechStack.length > 0) {
    const rows = doc.suggestedTechStack
      .map((t) => `| ${t.area} | ${t.choice} | ${t.reasoning} |`)
      .join("\n");
    sections.push(
      `## Önerilen Teknoloji Yığını\n\n| Alan | Seçim | Neden |\n|---|---|---|\n${rows}`
    );
  }

  if (doc.architectureOverview) {
    sections.push(`## Mimari Genel Bakış\n\n${doc.architectureOverview}`);
  }

  if (doc.dataModel) {
    sections.push(`## Veri Modeli\n\n${doc.dataModel}`);
  }

  if (doc.apiEndpoints.length > 0) {
    const rows = doc.apiEndpoints
      .map((e) => `| ${e.method} | ${e.path} | ${e.description} |`)
      .join("\n");
    sections.push(
      `## API Endpoint'leri\n\n| Method | Path | Açıklama |\n|---|---|---|\n${rows}`
    );
  }

  if (doc.environmentVariables.length > 0) {
    sections.push(`## Ortam Değişkenleri\n\n${bulletList(doc.environmentVariables)}`);
  }

  if (doc.phases.length > 0) {
    const phasesMd = doc.phases
      .map((phase, i) => {
        const tasks = checklist(phase.tasks);
        return `### Faz ${i + 1}: ${phase.name}\n\n**Hedef:** ${phase.goal}\n**Karmaşıklık:** ${phase.complexity}\n\n${tasks}`;
      })
      .join("\n\n");
    sections.push(`## Yapılacaklar Listesi (Fazlar)\n\n${phasesMd}`);
  }

  if (doc.openQuestions.length > 0) {
    sections.push(
      `## Eksikler / Netleştirilmesi Gerekenler\n\n${bulletList(doc.openQuestions)}`
    );
  }

  if (doc.strengths.length > 0) {
    sections.push(`## Artılar\n\n${bulletList(doc.strengths)}`);
  }

  if (doc.risks.length > 0) {
    sections.push(`## Riskler\n\n${bulletList(doc.risks)}`);
  }

  return sections.join("\n\n");
}
