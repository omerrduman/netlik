export interface PlanTemplate {
  label: string;
  seedMessage: string;
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    label: "E-ticaret Sitesi",
    seedMessage: "Ürün satışı yapabileceğim bir e-ticaret sitesi yapmak istiyorum.",
  },
  {
    label: "Mobil Uygulama",
    seedMessage: "Bir fikrim var, bunun için bir mobil uygulama yaptırmak istiyorum.",
  },
  {
    label: "API Servisi",
    seedMessage: "Başka uygulamaların kullanabileceği bir API servisi yapmak istiyorum.",
  },
  {
    label: "Kişisel Blog",
    seedMessage: "Yazılarımı paylaşabileceğim kişisel bir blog sitesi yapmak istiyorum.",
  },
  {
    label: "SaaS Aracı",
    seedMessage: "Abonelik modeliyle çalışan bir SaaS aracı yapmak istiyorum.",
  },
];
