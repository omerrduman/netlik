import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">
        <span className="text-accent-cyan">net</span>
        <span className="text-accent-orange">lik</span>
      </h1>
      <p className="max-w-md text-muted">
        Embeddable AI chat widget for freelancers. Under construction.
      </p>
      <Link
        href="/plan"
        className="mt-2 rounded-full border border-accent-cyan/40 px-4 py-2 text-sm text-accent-cyan transition-colors hover:bg-accent-cyan/10"
      >
        Proje Planlayıcıyı Dene →
      </Link>
    </div>
  );
}
