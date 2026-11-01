import Image from "next/image";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import LanguageSwitcher from "@/components/ui/language-switcher";
import ThemeToggle from "@/components/ui/theme-toggle";
import { locales } from "@/i18n/constants";

export default async function Navbar() {
  const locale = await getLocale();
  if (!hasLocale(locales, locale)) notFound();
  const t = await getTranslations("navigation");
  const localePrefix = locale === "pt" ? "" : `/${locale}`;

  return (
    <nav
      aria-label={t("label")}
      className="border-b border-foreground/10 bg-background fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
        <a
          href={`${localePrefix}/`}
          aria-label={t("home")}
          className="inline-flex items-center gap-3"
        >
          <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background">
            <Image
              src="/img/logo.png"
              alt={t("brand")}
              width={40}
              height={40}
              className="rounded-xl"
            />
          </span>
          <span className="font-semibold tracking-tight">
            {t("brand")}
          </span>
        </a>
        <div className="flex items-center gap-4">
          <a
            href={`${localePrefix}/#conteudos`}
            className="hidden text-sm text-foreground/70 transition-colors hover:text-foreground sm:inline"
          >
            {t("content")}
          </a>
          <Suspense fallback={<span aria-hidden="true" className="h-7 w-16" />}>
            <LanguageSwitcher
              locale={locale}
              label={t("switchLanguage")}
              labels={{ pt: t("portuguese"), en: t("english") }}
            />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
