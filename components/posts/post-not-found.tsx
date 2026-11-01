"use client";

import { useTranslations } from "next-intl";

export default function PostsNotFound({ onRetry }: { onRetry: () => void }) {
  const t = useTranslations("posts");
  const common = useTranslations("dashboard");
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background p-8 text-center">
      <h2 className="text-lg font-semibold">
        {t("loadError")}
      </h2>
      <p className="mt-2 text-sm text-foreground/65">
        {t("loadErrorDescription")}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
      >
        {common("retry")}
      </button>
    </div>
  );
}
