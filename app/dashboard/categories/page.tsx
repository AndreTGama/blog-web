"use client";

import {
  getCategoriesIndexQueryKey,
  useCategoriesIndex,
} from "@/lib/api/generated";
import type { CategoriesIndexParams } from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import Link from "next/link";
import { useState } from "react";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  createdAt: string | null;
  postsCount: number | null;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readCategories(items: unknown): CategoryRow[] | null {
  if (!Array.isArray(items)) return null;

  const rows: CategoryRow[] = [];
  for (const item of items) {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.slug !== "string"
    ) {
      return null;
    }

    const postsCount =
      typeof item.posts_count === "number"
        ? item.posts_count
        : typeof item.postsCount === "number"
          ? item.postsCount
          : null;

    rows.push({
      id: item.id,
      name: item.name,
      slug: item.slug,
      createdAt: typeof item.created_at === "string" ? item.created_at : null,
      postsCount,
    });
  }

  return rows;
}

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(date);
}

export default function CategoriesPage() {
  const accessToken = useAccessToken();
  const [page, setPage] = useState(1);
  const params: CategoriesIndexParams = { limit: 15, page };
  const categoriesQuery = useCategoriesIndex(params, {
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    query: {
      enabled: Boolean(accessToken),
      queryKey: [...getCategoriesIndexQueryKey(params), accessToken],
      retry: false,
    },
  });

  if (categoriesQuery.isPending) {
    return <p className="text-foreground/70">Carregando categorias...</p>;
  }

  if (categoriesQuery.isError) {
    return (
      <section className="mx-auto max-w-5xl rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6">
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <p className="mt-3 text-foreground/70">
          Não foi possível carregar as categorias.
        </p>
        <button
          type="button"
          onClick={() => void categoriesQuery.refetch()}
          className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  const response = categoriesQuery.data;
  if (response.status !== 200) {
    return (
      <p role="alert" className="text-foreground/70">
        A API não conseguiu retornar as categorias (HTTP {response.status}).
      </p>
    );
  }

  const payload = response.data.data;
  const categories = readCategories(payload.items);
  const currentPage = Number(payload.pagination.current_page);
  const lastPage = Number(payload.pagination.last_page);
  const total = Number(payload.pagination.total);

  if (!categories || !Number.isFinite(currentPage) || !Number.isFinite(lastPage)) {
    return (
      <section className="mx-auto max-w-5xl rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6">
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <p role="alert" className="mt-3 text-foreground/70">
          A resposta da API não corresponde ao formato esperado para a lista de
          categorias.
        </p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="flex flex-col gap-4 border-b border-foreground/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-foreground/60">Painel administrativo</p>
          <h1 className="mt-2 text-3xl font-semibold">Categorias</h1>
          <p className="mt-2 text-foreground/70">
            Organize os assuntos dos posts do blog.
          </p>
        </div>
        <Link
          href="/dashboard/categories/new"
          className="inline-flex w-fit rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          Criar categoria
        </Link>
      </header>

      <div className="mt-6 overflow-hidden rounded-lg border border-foreground/10 bg-foreground/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium">Nome</th>
                <th scope="col" className="px-5 py-4 font-medium">Slug</th>
                <th scope="col" className="px-5 py-4 font-medium">Posts relacionados</th>
                <th scope="col" className="px-5 py-4 font-medium">Criada em</th>
                <th scope="col" className="px-5 py-4 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-5 py-4 font-medium">{category.name}</td>
                  <td className="px-5 py-4 text-foreground/65">{category.slug}</td>
                  <td className="px-5 py-4 text-foreground/65">
                    {category.postsCount ?? "Não informado"}
                  </td>
                  <td className="px-5 py-4 text-foreground/65">
                    {formatDate(category.createdAt)}
                  </td>
                  <td className="px-5 py-4">
                    <Link
                      href={`/dashboard/categories/${encodeURIComponent(category.id)}/edit`}
                      className="font-medium underline underline-offset-4 hover:opacity-70"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-foreground/60"
                  >
                    Nenhuma categoria cadastrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-4 flex flex-col gap-3 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {Number.isFinite(total) ? `${total} categoria(s)` : "Categorias"} ·
          Página {currentPage} de {lastPage}
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
