"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-sm text-foreground/60">Painel administrativo</p>
        <h1 className="mt-2 text-3xl font-semibold">Visão geral</h1>
        <p className="mt-2 text-foreground/70">
          Gerencie os posts e as categorias do seu blog pelo menu lateral.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          {
            title: "Posts",
            description: "Acesse, organize e crie artigos para o blog.",
            href: "/dashboard/posts",
          },
          {
            title: "Categorias",
            description: "Organize os assuntos publicados no blog.",
            href: "/dashboard/categories",
          },
        ].map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6 transition-colors hover:bg-foreground/[0.07]"
          >
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-2 text-sm text-foreground/60">
              {section.description}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
