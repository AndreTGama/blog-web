"use client";

import {
  getCategoriesIndexQueryKey,
  getPostsIndexQueryKey,
  useCategoriesIndex,
  usePostsIndex,
} from "@/lib/api/generated";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import ThemeToggle from "@/components/ui/theme-toggle";

const CONTENT_LIMIT = 12;
const API_PAGE_SIZE = 100;

type HomeCategory = {
  id: string;
  name: string;
  slug: string;
};

type HomePost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: string;
  views: number;
  cover_image: string;
  published_at: string | null;
  categories?: HomeCategory[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readItems<T>(
  items: unknown,
  parseItem: (item: unknown) => T | null,
): T[] | null {
  if (!Array.isArray(items)) return null;

  const result: T[] = [];
  for (const item of items) {
    const parsed = parseItem(item);
    if (parsed === null) return null;
    result.push(parsed);
  }

  return result;
}

function parseCategory(item: unknown): HomeCategory | null {
  if (
    !isRecord(item) ||
    typeof item.id !== "string" ||
    typeof item.name !== "string" ||
    typeof item.slug !== "string"
  ) {
    return null;
  }

  return { id: item.id, name: item.name, slug: item.slug };
}

function parsePost(item: unknown): HomePost | null {
  if (
    !isRecord(item) ||
    typeof item.id !== "string" ||
    typeof item.title !== "string" ||
    typeof item.slug !== "string" ||
    typeof item.excerpt !== "string" ||
    typeof item.content !== "string" ||
    typeof item.status !== "string" ||
    typeof item.views !== "number" ||
    typeof item.cover_image !== "string" ||
    (item.published_at !== null && typeof item.published_at !== "string")
  ) {
    return null;
  }

  let categories: HomeCategory[] | undefined;
  if (item.categories !== undefined) {
    categories = readItems(item.categories, parseCategory) ?? undefined;
    if (categories === undefined) return null;
  }

  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    status: item.status,
    views: item.views,
    cover_image: item.cover_image,
    published_at: item.published_at,
    categories,
  };
}

function formatDate(dateValue: string | null | undefined) {
  if (!dateValue) return "Artigo";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? "Artigo"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}

function PostsError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-foreground/10 bg-background p-8 text-center">
      <h2 className="text-lg font-semibold">Não foi possível carregar os artigos</h2>
      <p className="mt-2 text-sm text-foreground/65">
        Verifique se a API está disponível e tente novamente.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
      >
        Tentar novamente
      </button>
    </div>
  );
}

export default function PublicHome() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [page, setPage] = useState(1);

  const postsParams = {
    limit: API_PAGE_SIZE,
    page: 1,
    order_by: "created_at" as const,
    order_direction: "desc" as const,
  };
  const categoriesParams = { limit: API_PAGE_SIZE, page: 1 };

  const postsQuery = usePostsIndex(postsParams, {
    query: {
      queryKey: [...getPostsIndexQueryKey(postsParams), "public"],
      retry: false,
    },
  });
  const categoriesQuery = useCategoriesIndex(categoriesParams, {
    query: {
      queryKey: [...getCategoriesIndexQueryKey(categoriesParams), "public"],
      retry: false,
    },
  });

  const postPayload =
    postsQuery.data?.status === 200 ? postsQuery.data.data.data : null;
  const posts =
    postPayload === null
      ? null
      : readItems(postPayload.items, parsePost);

  const categoryPayload =
    categoriesQuery.data?.status === 200
      ? categoriesQuery.data.data.data
      : null;
  const categories =
    categoryPayload === null
      ? null
      : readItems(categoryPayload.items, parseCategory);

  const publishedPosts = useMemo(
    () =>
      (posts ?? []).filter(
        (post) => post.status.toLowerCase() === "published",
      ),
    [posts],
  );

  const visibleCategories = useMemo(() => {
    const normalizedSearch = categorySearch.trim().toLocaleLowerCase("pt-BR");
    return (categories ?? []).filter((category) =>
      category.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    );
  }, [categories, categorySearch]);

  const filteredPosts = useMemo(
    () =>
      selectedCategories.length > 0
        ? publishedPosts.filter((post) =>
            selectedCategories.some((categoryId) =>
              post.categories?.some(
                (category) => category.id === categoryId,
              ),
            ),
          )
        : publishedPosts,
    [publishedPosts, selectedCategories],
  );

  const pageCount = Math.max(1, Math.ceil(filteredPosts.length / CONTENT_LIMIT));
  const currentPage = Math.min(page, pageCount);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * CONTENT_LIMIT,
    currentPage * CONTENT_LIMIT,
  );

  function toggleCategory(categoryId: string) {
    setSelectedCategories((selected) =>
      selected.includes(categoryId)
        ? selected.filter((id) => id !== categoryId)
        : [...selected, categoryId],
    );
    setPage(1);
  }

  function clearCategories() {
    setSelectedCategories([]);
    setPage(1);
  }

  const postsError =
    postsQuery.isError ||
    (postsQuery.data !== undefined && postsQuery.data.status !== 200) ||
    (postPayload !== null && posts === null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav
        aria-label="Navegação principal"
        className="border-b border-foreground/10"
      >
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
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
          <div className="flex items-center gap-4">
            <a
              href="#conteudos"
              className="hidden text-sm text-foreground/70 transition-colors hover:text-foreground sm:inline"
            >
              Conteúdos
            </a>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <header className="relative isolate overflow-hidden border-b border-foreground/10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at 80% 20%, color-mix(in srgb, var(--foreground) 10%, transparent), transparent 38%), radial-gradient(ellipse at 10% 90%, color-mix(in srgb, var(--foreground) 7%, transparent), transparent 42%)",
          }}
        />
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-foreground/55">
            Engenharia de software, sem atalhos
          </p>
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
            Ideias, padrões e código para construir melhor.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-foreground/65 sm:text-lg">
            Conteúdos sobre arquitetura, padrões de projeto e desenvolvimento,
            com exemplos práticos para levar da leitura ao código.
          </p>
          <a
            href="#conteudos"
            className="mt-8 inline-flex rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background transition-opacity hover:opacity-80"
          >
            Explorar conteúdos
          </a>
        </div>
      </header>

      <main
        id="conteudos"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:py-20"
      >
        <aside aria-label="Filtros de conteúdo" className="lg:sticky lg:top-8 lg:self-start">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em]">
            Categorias
          </h2>
          <label htmlFor="category-search" className="sr-only">
            Pesquisar categorias
          </label>
          <input
            id="category-search"
            type="search"
            value={categorySearch}
            onChange={(event) => setCategorySearch(event.target.value)}
            placeholder="Pesquisar categoria"
            className="mt-4 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-foreground/45 focus:border-foreground/45 focus:outline-none"
          />

          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            <button
              type="button"
              aria-pressed={selectedCategories.length === 0}
              onClick={clearCategories}
              className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors lg:w-full ${
                selectedCategories.length === 0
                  ? "bg-foreground text-background"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              }`}
            >
              Todas as categorias
            </button>

            {categoriesQuery.isPending && (
              <p className="px-3 py-2 text-sm text-foreground/55">
                Carregando...
              </p>
            )}
            {categoriesQuery.isError && (
              <p className="px-3 py-2 text-sm text-foreground/65">
                Não foi possível carregar as categorias.
              </p>
            )}
            {categoriesQuery.data && categoriesQuery.data.status !== 200 && (
              <p className="px-3 py-2 text-sm text-foreground/65">
                Categorias indisponíveis (HTTP {categoriesQuery.data.status}).
              </p>
            )}
            {categories && visibleCategories.length === 0 && (
              <p className="px-3 py-2 text-sm text-foreground/55">
                Nenhuma categoria encontrada.
              </p>
            )}
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                type="button"
                aria-pressed={selectedCategories.includes(category.id)}
                onClick={() => toggleCategory(category.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors lg:w-full ${
                  selectedCategories.includes(category.id)
                    ? "bg-foreground text-background"
                    : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </aside>

        <section aria-labelledby="content-heading" className="min-w-0">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/10 pb-5">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
                Biblioteca
              </p>
              <h2 id="content-heading" className="mt-2 text-2xl font-semibold">
                {selectedCategories.length > 0
                  ? `${selectedCategories.length} categoria(s) selecionada(s)`
                  : "Últimos conteúdos"}
              </h2>
            </div>
            {!postsError && !postsQuery.isPending && (
              <p className="text-sm text-foreground/55">
                {filteredPosts.length}{" "}
                {filteredPosts.length === 1 ? "artigo" : "artigos"}
              </p>
            )}
          </div>

          {postsQuery.isPending && (
            <div className="grid gap-5 pt-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }, (_, index) => (
                <div
                  key={index}
                  className="h-72 animate-pulse rounded-2xl bg-foreground/[0.06]"
                />
              ))}
            </div>
          )}

          {postsError && (
            <div className="pt-6">
              <PostsError onRetry={() => void postsQuery.refetch()} />
            </div>
          )}

          {!postsQuery.isPending && !postsError && pagePosts.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-foreground/20 px-6 py-16 text-center">
              <p className="font-medium">Ainda não há conteúdos nesta categoria.</p>
              <p className="mt-2 text-sm text-foreground/60">
                Escolha outra categoria para ver mais artigos.
              </p>
            </div>
          )}

          {!postsQuery.isPending && !postsError && pagePosts.length > 0 && (
            <div className="grid gap-5 pt-6 sm:grid-cols-2 xl:grid-cols-3">
              {pagePosts.map((post) => (
                <article
                  key={post.id}
                  className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-foreground/10 bg-foreground/[0.025] transition-colors hover:bg-foreground/[0.05]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-foreground/[0.07]">
                    {post.cover_image ? (
                      <Image
                        src={post.cover_image}
                        alt=""
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center font-mono text-3xl text-foreground/25">
                        {"</>"}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap gap-2">
                      {post.categories?.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className="rounded-full border border-foreground/10 px-2.5 py-1 text-xs text-foreground/65 transition-colors hover:border-foreground/30 hover:text-foreground"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight">
                      <Link
                        href={`/artigos/${encodeURIComponent(post.id)}`}
                        className="transition-colors hover:text-foreground/70 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-foreground/65">
                      {post.excerpt}
                    </p>
                    <div className="mt-5 flex items-center justify-between gap-3 border-t border-foreground/10 pt-4 text-xs text-foreground/50">
                      <span>
                        {formatDate(post.published_at)} · {post.views} visualizações
                      </span>
                      <Link
                        href={`/artigos/${encodeURIComponent(post.id)}`}
                        className="text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
                      >
                        Ler artigo
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!postsQuery.isPending && !postsError && (
            <nav
              aria-label="Paginação dos conteúdos"
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={currentPage <= 1}
                className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>
              <span className="px-2 text-sm text-foreground/60">
                {currentPage} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((value) => Math.min(pageCount, value + 1))
                }
                disabled={currentPage >= pageCount}
                className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Próxima
              </button>
            </nav>
          )}
        </section>
      </main>

      <footer className="border-t border-foreground/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 sm:px-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
            Mapa do site
          </h2>
          <nav aria-label="Mapa do site">
            <ul className="flex gap-5 text-sm text-foreground/65">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">
                  Início
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
