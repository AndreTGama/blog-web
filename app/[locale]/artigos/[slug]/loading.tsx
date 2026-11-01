"use client";

import { useTranslations } from "next-intl";

export default function ArticlePageLoading() {
  const t = useTranslations("article");

  return (
    <main
      role="status"
      className="mx-auto min-h-[70vh] max-w-7xl animate-pulse space-y-5 px-5 py-16 sm:px-8"
    >
      <span className="block h-4 w-32 rounded bg-foreground/10" />
      <span className="block h-12 max-w-2xl rounded bg-foreground/10" />
      <span className="block aspect-[16/7] rounded-2xl bg-foreground/10" />
      <span className="sr-only">{t("loading")}</span>
    </main>
  );
}
