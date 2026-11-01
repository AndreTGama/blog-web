"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/constants";
import { useArticleLanguage } from "@/components/ui/article-language-context";

export default function LanguageSwitcher({
  locale,
  label,
  labels,
}: {
  locale: string;
  label: string;
  labels: Record<Locale, string>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { articleSlugs } = useArticleLanguage();
  const isArticlePath = /^\/artigos\/[^/]+$/.test(pathname);
  const availableLocales = isArticlePath
    ? locales.filter((nextLocale) => articleSlugs?.[nextLocale])
    : locales;
  if (isArticlePath && availableLocales.length < 2) return null;

  return (
    <nav aria-label={label} className="flex items-center gap-1">
      {availableLocales.map((nextLocale) => (
        <button
          key={nextLocale}
          type="button"
          lang={nextLocale}
          aria-current={locale === nextLocale ? "true" : undefined}
          onClick={() =>
            router.replace(
              isArticlePath
                ? `/artigos/${articleSlugs?.[nextLocale]}`
                : pathname,
              { locale: nextLocale, scroll: false },
            )
          }
          className={`rounded-full px-2.5 py-1 text-xs transition-colors ${
            locale === nextLocale
              ? "bg-foreground/10 font-semibold text-foreground"
              : "text-foreground/60 hover:text-foreground"
          }`}
        >
          {labels[nextLocale]}
        </button>
      ))}
    </nav>
  );
}
