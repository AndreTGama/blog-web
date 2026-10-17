import Link from "next/link";

type DashboardSectionProps = {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
};

export default function DashboardSection({
  title,
  description,
  actionLabel,
  actionHref,
}: DashboardSectionProps) {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-4 border-b border-foreground/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-foreground/60">Painel administrativo</p>
          <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
          <p className="mt-2 text-foreground/70">{description}</p>
        </div>
        <Link
          href={actionHref}
          className="inline-flex w-fit rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          {actionLabel}
        </Link>
      </header>

      <section className="mt-8 rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6">
        <p className="text-sm text-foreground/70">
          Esta área está pronta para receber a integração com a API.
        </p>
      </section>
    </div>
  );
}
