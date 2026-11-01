"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t border-foreground/10 bg-foreground/[0.03]">
      <div className="mx-auto flex max-w-5xl flex-col items-center px-5 py-16 text-center sm:px-8 sm:py-20">
        <h2 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h2>
        <Image
          src="/img/logo.png"
          alt={t("authorAlt")}
          width={144}
          height={144}
          className="mt-7 size-32 rounded-full object-cover sm:size-36"
        />
        <p className="mt-5 text-xl font-semibold tracking-tight">
          André Toledo Gama
        </p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-foreground/70 sm:text-base sm:leading-7">
          {t("description")}
        </p>
        <nav aria-label={t("social")} className="mt-6">
          <ul className="flex justify-center">
            <li>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noreferrer"
                aria-label={t("linkedin")}
                className="text-foreground/65 transition-colors hover:text-foreground"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-6 fill-current"
                >
                  <path d="M20.45 20.45h-3.55v-5.56c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.02H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z" />
                </svg>
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
