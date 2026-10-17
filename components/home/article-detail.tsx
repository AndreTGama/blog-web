"use client";

import { getPostsShowQueryKey, usePostsShow } from "@/lib/api/generated";
import Image from "next/image";
import Link from "next/link";
import ThemeToggle from "@/components/ui/theme-toggle";

function formatDate(dateValue: string | null) {
  if (!dateValue) return null;

  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

export default function ArticleDetail({ id }: { id: string }) {
  const articleQuery = usePostsShow(id, {
    query: {
      queryKey: getPostsShowQueryKey(id),
      retry: false,
    },
  });

  const response = articleQuery.data;
  const article = response?.status === 200 ? response.data.data : null;
  const notFound = response?.status === 404;
  const unpublished =
    article !== null && article.status.toLowerCase() !== "published";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav aria-label="Navegação principal" className="border-b border-foreground/10">
        <div className="mx-auto flex h-18 max-w-4xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link
            href="/"
            aria-label="Blog de tecnologia - início"
            className="inline-flex items-center gap-3"
          >
            <span className="flex size-10 items-center justify-center rounded-xl bg-foreground text-sm font-bold text-background">
              &lt;/&gt;
            </span>
            <span className="font-semibold tracking-tight">Blog de tecnologia</span>
          </Link>
          <ThemeToggle />
        </div>
      </nav>

      <main className="mx-auto min-h-[70vh] max-w-4xl px-5 py-10 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-foreground/65 transition-colors hover:text-foreground"
        >
          <span aria-hidden="true">←</span>
          Voltar para os artigos
        </Link>

        {articleQuery.isPending && (
          <div role="status" className="mt-10 animate-pulse space-y-5">
            <span className="block h-4 w-32 rounded bg-foreground/10" />
            <span className="block h-12 max-w-2xl rounded bg-foreground/10" />
            <span className="block aspect-[16/7] rounded-2xl bg-foreground/10" />
            <span className="block h-48 rounded bg-foreground/10" />
            <span className="sr-only">Carregando artigo...</span>
          </div>
        )}

        {!articleQuery.isPending && (articleQuery.isError || notFound) && (
          <section className="mt-10 rounded-2xl border border-foreground/10 bg-foreground/[0.025] px-6 py-14 text-center">
            <h1 className="text-2xl font-semibold">
              {notFound ? "Artigo não encontrado" : "Não foi possível carregar o artigo"}
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-foreground/65">
              {notFound
                ? "Este artigo pode ter sido removido ou o endereço está incorreto."
                : "Verifique se a API está disponível e tente novamente."}
            </p>
            {articleQuery.isError && (
              <button
                type="button"
                onClick={() => void articleQuery.refetch()}
                className="mt-6 rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
              >
                Tentar novamente
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
                Não foi possível carregar o artigo
              </h1>
              <p className="mt-3 text-sm text-foreground/65">
                A API retornou HTTP {response?.status ?? "desconhecido"}.
              </p>
            </section>
          )}

        {!articleQuery.isPending && !articleQuery.isError && unpublished && (
          <section className="mt-10 rounded-2xl border border-foreground/10 px-6 py-14 text-center">
            <h1 className="text-2xl font-semibold">Artigo indisponível</h1>
            <p className="mt-3 text-sm text-foreground/65">
              Este conteúdo ainda não foi publicado.
            </p>
          </section>
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
                  {formatDate(article.published_at) && (
                    <time dateTime={article.published_at ?? undefined}>
                      {formatDate(article.published_at)}
                    </time>
                  )}
                  <span>{article.views} visualizações</span>
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

              <div className="mt-10 whitespace-pre-wrap break-words text-base leading-8 text-foreground/85">
                {article.content}
              </div>
            </article>
          )}
      </main>

      <footer className="border-t border-foreground/10">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-5 py-8 sm:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
            Mapa do site
          </h2>
          <nav aria-label="Mapa do site">
            <Link href="/" className="text-sm text-foreground/65 transition-colors hover:text-foreground">
              Início
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
