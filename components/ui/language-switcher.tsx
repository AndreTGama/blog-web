"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/constants";

export default function LanguageSwitcher({
  locale,
  label,
  labels,
}: {
  locale: Locale;
  label: string;
  labels: Record<Locale, string>;
}) {
  const pathname = usePathname();
  const router = useRouter();
  if (/^\/artigos\/[^/]+$/.test(pathname)) return null;

  return (
    <nav aria-label={label} className="flex items-center gap-1">
      {locales.map((nextLocale) => (
        <button
          key={nextLocale}
          type="button"
          lang={nextLocale}
          aria-current={locale === nextLocale ? "true" : undefined}
          onClick={() =>
            router.replace(pathname, { locale: nextLocale, scroll: false })
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
