"use client";

import {
  getCategoriesIndexQueryKey,
  getCategoriesShowQueryKey,
  useCategoriesShow,
  useCategoriesUpdate,
} from "@/lib/api/generated";
import type { UpdateCategoryRequest } from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import Link from "next/link";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function responseMessage(data: unknown) {
  return isRecord(data) && typeof data.message === "string"
    ? data.message
    : null;
}

export default function CategoryEditForm() {
  const params = useParams<{ id: string }>();
  const categoryId = params.id;
  const accessToken = useAccessToken();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState<string | null>(null);

  const categoryQuery = useCategoriesShow(categoryId, {
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    query: {
      enabled: Boolean(accessToken && categoryId),
      queryKey: [...getCategoriesShowQueryKey(categoryId), accessToken],
      retry: false,
    },
  });

  const updateCategory = useCategoriesUpdate({
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });

  if (categoryQuery.isPending) {
    return <p className="text-foreground/70">Carregando categoria...</p>;
  }

  if (categoryQuery.isError) {
    return (
      <section className="max-w-2xl rounded-lg border border-foreground/10 p-6">
        <h1 className="text-2xl font-semibold">Não foi possível carregar a categoria</h1>
        <p className="mt-3 text-foreground/70">
          {categoryQuery.error instanceof Error
            ? categoryQuery.error.message
            : "Ocorreu um erro ao consultar a API."}
        </p>
        <button
          type="button"
          onClick={() => void categoryQuery.refetch()}
          className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          Tentar novamente
        </button>
      </section>
    );
  }

  const response = categoryQuery.data;
  if (response.status !== 200) {
    return (
      <section className="max-w-2xl rounded-lg border border-foreground/10 p-6">
        <h1 className="text-2xl font-semibold">Categoria indisponível</h1>
        <p role="alert" className="mt-3 text-foreground/70">
          {responseMessage(response.data) ??
            `A API não conseguiu carregar esta categoria (HTTP ${response.status}).`}
        </p>
        <Link
          href="/dashboard/categories"
          className="mt-4 inline-block text-sm underline underline-offset-4"
        >
          Voltar para categorias
        </Link>
      </section>
    );
  }

  const category = response.data.data;
  const displayedName = name ?? category.name;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data: UpdateCategoryRequest = { name: displayedName.trim() };
    updateCategory.mutate(
      { category: categoryId, data },
      {
        onSuccess: (updateResponse) => {
          if (updateResponse.status !== 200) {
            toast.error(
              responseMessage(updateResponse.data) ??
                `Não foi possível atualizar a categoria (HTTP ${updateResponse.status}).`,
            );
            return;
          }

          toast.success("Categoria atualizada com sucesso.");
          void queryClient.invalidateQueries({
            queryKey: getCategoriesIndexQueryKey(),
          });
          void queryClient.invalidateQueries({
            queryKey: getCategoriesShowQueryKey(categoryId),
          });
          router.push("/dashboard/categories");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível conectar à API para atualizar a categoria.",
          );
        },
      },
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-sm text-foreground/60">Painel administrativo</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Editar categoria</h1>
          <Link
            href="/dashboard/categories"
            className="text-sm text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            Voltar para categorias
          </Link>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-2xl rounded-lg border border-foreground/10 bg-foreground/[0.03] p-6"
      >
        <div>
          <label htmlFor="category-name" className="mb-2 block text-sm font-medium">
            Nome da categoria
          </label>
          <input
            id="category-name"
            name="name"
            type="text"
            required
            minLength={3}
            maxLength={255}
            value={displayedName}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
          />
          <p className="mt-2 text-xs text-foreground/60">
            Slug atual: {category.slug}. A API pode atualizá-lo com base no nome.
          </p>
        </div>

        <button
          type="submit"
          disabled={
            updateCategory.isPending ||
            displayedName.trim().length < 3 ||
            displayedName.trim() === category.name
          }
          className="mt-6 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateCategory.isPending ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
