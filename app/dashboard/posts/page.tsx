"use client";

import {
  getPostsIndexQueryKey,
  usePostsIndex,
} from "@/lib/api/generated";
import type { PostsIndexParams } from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import Link from "next/link";
import { useState, type FormEvent } from "react";

type PostRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  categories: string[];
  publishedAt: string | null;
  createdAt: string | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readPosts(items: unknown): PostRow[] | null {
  if (!Array.isArray(items)) return null;

  const posts: PostRow[] = [];
  for (const item of items) {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      typeof item.slug !== "string" ||
      typeof item.status !== "string"
    ) {
      return null;
    }

    const categories = Array.isArray(item.categories)
      ? item.categories.flatMap((category) =>
          isRecord(category) && typeof category.name === "string"
            ? [category.name]
            : [],
        )
      : [];

    posts.push({
      id: item.id,
      title: item.title,
      slug: item.slug,
      status: item.status,
      views: typeof item.views === "number" ? item.views : 0,
      categories,
      publishedAt:
        typeof item.published_at === "string" ? item.published_at : null,
      createdAt: typeof item.created_at === "string" ? item.created_at : null,
    });
  }

  return posts;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

function statusLabel(status: string) {
  switch (status) {
    case "published":
      return "Publicado";
    case "draft":
      return "Rascunho";
    case "archived":
      return "Arquivado";
    default:
      return status;
  }
}

function statusClasses(status: string) {
  switch (status) {
    case "published":
      return "bg-emerald-500/10 text-emerald-800 dark:text-emerald-300";
    case "draft":
      return "bg-amber-500/10 text-amber-800 dark:text-amber-300";
    case "archived":
      return "bg-foreground/10 text-foreground/70";
    default:
      return "bg-foreground/10 text-foreground/70";
  }
}

export default function PostsPage() {
  const accessToken = useAccessToken();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const params: PostsIndexParams = {
    limit: 15,
    page,
    order_by: "created_at",
    order_direction: "desc",
    ...(search ? { "filters[search]": search } : {}),
  };
  const postsQuery = usePostsIndex(params, {
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    query: {
      enabled: Boolean(accessToken),
      queryKey: [...getPostsIndexQueryKey(params), accessToken],
      retry: false,
    },
  });

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  if (postsQuery.isPending) {
    return <p className="text-foreground/70">Carregando posts...</p>;
  }

  if (postsQuery.isError) {
    return (
      <section className="mx-auto max-w-5xl rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <p className="mt-3 text-foreground/70">
          Não foi possível carregar os posts.
        </p>
        <button
          type="button"
          onClick={() => void postsQuery.refetch()}
          className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  const response = postsQuery.data;
  if (response.status !== 200) {
    return (
      <p role="alert" className="text-foreground/70">
        A API não conseguiu retornar os posts (HTTP {response.status}).
      </p>
    );
  }

  const payload = response.data.data;
  const posts = readPosts(payload.items);
  const currentPage = Number(payload.pagination.current_page);
  const lastPage = Number(payload.pagination.last_page);
  const total = Number(payload.pagination.total);

  if (!posts || !Number.isFinite(currentPage) || !Number.isFinite(lastPage)) {
    return (
      <section className="mx-auto max-w-5xl rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <p role="alert" className="mt-3 text-foreground/70">
          A resposta da API não corresponde ao formato esperado para a lista de
          posts.
        </p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-col gap-4 border-b border-foreground/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-foreground/60">Painel administrativo</p>
          <h1 className="mt-2 text-3xl font-semibold">Posts</h1>
          <p className="mt-2 text-foreground/70">
            Consulte e gerencie os artigos do blog.
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex w-fit rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          Criar post
        </Link>
      </header>

      <form onSubmit={handleSearch} className="mt-6 flex max-w-lg gap-2">
        <label htmlFor="post-search" className="sr-only">
          Buscar posts
        </label>
        <input
          id="post-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Buscar por título ou conteúdo"
          className="min-w-0 flex-1 rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          Buscar
        </button>
      </form>

      <div className="mt-6 overflow-hidden rounded-lg border border-foreground/10 bg-foreground/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium">Título</th>
                <th scope="col" className="px-5 py-4 font-medium">Categorias</th>
                <th scope="col" className="px-5 py-4 font-medium">Status</th>
                <th scope="col" className="px-5 py-4 font-medium">Visualizações</th>
                <th scope="col" className="px-5 py-4 font-medium">Publicado em</th>
                <th scope="col" className="px-5 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium">{post.title}</p>
                    <p className="mt-1 text-xs text-foreground/55">{post.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-foreground/65">
                    {post.categories.length > 0
                      ? post.categories.join(", ")
                      : "Sem categoria"}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(post.status)}`}
                    >
                      {statusLabel(post.status)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-foreground/65">{post.views}</td>
                  <td className="px-5 py-4 text-foreground/65">
                    {formatDate(post.publishedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/posts/${encodeURIComponent(post.id)}/edit`}
                      className="font-medium underline underline-offset-4 hover:opacity-70"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {posts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-10 text-center text-foreground/60"
                  >
                    Nenhum post encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-4 flex flex-col gap-3 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {Number.isFinite(total) ? `${total} post(s)` : "Posts"} · Página{" "}
          {currentPage} de {lastPage}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage <= 1}
            className="rounded-md border border-foreground/15 px-3 py-2 text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
            disabled={currentPage >= lastPage}
            className="rounded-md border border-foreground/15 px-3 py-2 text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Próxima
          </button>
        </div>
      </footer>
    </div>
  );
}
