"use client";

import { getPostsShowQueryKey, usePostsShow } from "@/lib/api/generated";
import PostContent from "@/components/home/post-content";
import { useAccessToken } from "@/lib/auth/session";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "@/components/ui/theme-toggle";
import { formatDate } from "@/lib/utils/format";


export default function ArticleDetail({ slug }: { slug: string }) {
  const locale = useLocale();
  const t = useTranslations("article");
  const common = useTranslations("dashboard");
  const accessToken = useAccessToken();
  const postIdentifier = encodeURIComponent(slug);
  const articleQuery = usePostsShow(postIdentifier, {
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    query: {
      queryKey: [...getPostsShowQueryKey(postIdentifier), locale, accessToken],
      retry: false,
    },
  });

  const response = articleQuery.data;
  const responseArticle = response?.status === 200 ? response.data.data : null;
  const article = responseArticle?.locale === locale ? responseArticle : null;
  const notFound =
    response?.status === 404 ||
    (responseArticle !== null && article === null);
  const publishedDate = formatDate(
    article?.published_at,
    locale === "pt" ? "pt-BR" : "en-US",
  );
  const unpublished =
    article !== null &&
    article.status.toLowerCase() !== "published" &&
    !accessToken;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav aria-label={t("navigation")} className="border-b border-foreground/10">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href="/"
            aria-label={t("home")}
            className="inline-flex items-center gap-3"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background">
              &lt;/&gt;
            </span>
            <span className="font-semibold tracking-tight">{t("brand")}</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="mx-auto min-h-[70vh] max-w-7xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-foreground/65 transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span>
          {t("back")}
        </Link>
        {article?.translations && article.translations.length > 0 && (
          <nav
            aria-label={t("switchLanguage")}
            className="mt-4 flex gap-2 text-sm"
          >
            {article.translations.map((translation) => (
              <Link
                key={translation.locale}
                href={`/artigos/${translation.slug}`}
                locale={translation.locale}
                className="rounded-full border border-foreground/15 px-3 py-1 text-foreground/70 transition-colors hover:bg-foreground/5 hover:text-foreground"
              >
                {translation.locale === "en"
                  ? t("english")
                  : t("portuguese")}
              </Link>
            ))}
          </nav>
        )}

        {articleQuery.isPending && (
          <div role="status" className="mt-10 animate-pulse space-y-5">
            <span className="block h-4 w-32 rounded bg-foreground/10" />
            <span className="block h-12 max-w-2xl rounded bg-foreground/10" />
            <span className="block aspect-[16/7] rounded-2xl bg-foreground/10" />
            <span className="block h-48 rounded bg-foreground/10" />
            <span className="sr-only">{t("loading")}</span>
          </div>
        )}

        {!articleQuery.isPending && (articleQuery.isError || notFound) && (
          <section className="mt-10 rounded-2xl border border-foreground/10 bg-foreground/[0.025] px-6 py-14 text-center">
            <h1 className="text-2xl font-semibold">
              {notFound ? t("notFound") : t("loadError")}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-foreground/65">
              {notFound
                ? t("notFoundDescription")
                : t("loadErrorDescription")}
            </p>
            {articleQuery.isError && (
              <button
                type="button"
                onClick={() => void articleQuery.refetch()}
                className="mt-6 rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                {common("retry")}
              </button>
            )}
          </section>
        )}

        {!articleQuery.isPending &&
          !articleQuery.isError &&
          response?.status !== 200 &&
          !notFound && (
            <section className="mt-10 rounded-2xl border border-foreground/10 px-6 py-14 text-center">
              <h1 className="text-2xl font-semibold">
                {t("loadError")}
              </h1>
              <p className="mt-3 text-sm text-foreground/65">
                {t("apiStatus", {
                  status: response?.status ?? "unknown",
                })}
              </p>
            </section>
          )}

        {!articleQuery.isPending && !articleQuery.isError && unpublished && (
          <section className="mt-10 rounded-2xl border border-foreground/10 px-6 py-14 text-center">
            <h1 className="text-2xl font-semibold">{t("unavailable")}</h1>
            <p className="mt-3 text-sm text-foreground/65">
              {t("unpublished")}
            </p>
          </section>
        )}

        {!articleQuery.isPending &&
          !articleQuery.isError &&
          article !== null &&
          article.status.toLowerCase() !== "published" &&
          accessToken && (
            <p
              role="status"
              className="mt-6 rounded-md border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-200"
            >
              {t("preview")}
            </p>
          )}

        {!articleQuery.isPending &&
          !articleQuery.isError &&
          article !== null &&
          !unpublished && (
            <article className="mt-10">
              <header>
                <div className="flex flex-wrap gap-2">
                  {article.categories?.map((category) => (
                    <span
                      key={category.id}
                      className="rounded-full border border-foreground/15 px-3 py-1 text-xs text-foreground/65"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
                <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                  {article.title}
                </h1>
                {article.excerpt && (
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-foreground/65">
                    {article.excerpt}
                  </p>
                )}
                <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/55">
                  {article.author?.name && <span>{article.author.name}</span>}
                  {publishedDate && (
                    <time dateTime={article.published_at ?? undefined}>
                      {publishedDate}
                    </time>
                  )}
                  <span>{t("views", { count: article.views })}</span>
                </div>
              </header>

              {article.cover_image && (
                <div className="relative mt-8 aspect-[16/7] overflow-hidden rounded-2xl bg-foreground/[0.07]">
                  <Image
                    src={article.cover_image}
                    alt=""
                    fill
                    unoptimized
                    priority
                    sizes="(max-width: 896px) 100vw, 832px"
                    className="object-cover"
                  />
                </div>
              )}

              <PostContent content={article.content} />
            </article>
          )}
      </main>
    </div>
  );
}
