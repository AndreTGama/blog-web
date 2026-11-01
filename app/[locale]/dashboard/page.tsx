"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function DashboardPage() {
  const t = useTranslations("dashboardHome");

  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-sm text-foreground/60">{t("eyebrow")}</p>
        <h1 className="mt-2 text-3xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-foreground/70">
          {t("description")}
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        {[
          {
            title: t("posts"),
            description: t("postsDescription"),
            href: "/dashboard/posts",
          },
          {
            title: t("categories"),
            description: t("categoriesDescription"),
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
