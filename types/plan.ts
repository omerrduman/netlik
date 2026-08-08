export type PlanTechChoice = {
  area: string;
  choice: string;
  reasoning: string;
};

export type ApiEndpoint = {
  method: string;
  path: string;
  description: string;
};

export type PlanPhase = {
  name: string;
  goal: string;
  tasks: string[];
  /** Göreceli büyüklük notu, örn. "düşük" / "orta" / "yüksek" — saat bazlı bir süre tahmini değil. */
  complexity: string;
};

export interface TechnicalPlanDocument {
  projectTitle: string;
  summary: string;
  targetUsers: string;
  scopeIncluded: string[];
  scopeExcluded: string[];
  suggestedTechStack: PlanTechChoice[];
  architectureOverview: string;
  /** Projenin anlamlı bir veri modeli yoksa (örn. bir CLI aracı) boş string. */
  dataModel: string;
  /** Uygulanmıyorsa boş dizi. */
  apiEndpoints: ApiEndpoint[];
  /** Uygulanmıyorsa boş dizi. */
  environmentVariables: string[];
  phases: PlanPhase[];
  openQuestions: string[];
  strengths: string[];
  risks: string[];
}
