"use client";

import {
  getCategoriesIndexQueryKey,
  getPostsIndexQueryKey,
  useCategoriesIndex,
  usePostsStore,
} from "@/lib/api/generated";
import {
  StorePostRequestStatus,
  type StorePostRequest,
} from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import { useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";

type CategoryOption = {
  id: string;
  name: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readCategoryOptions(items: unknown): CategoryOption[] | null {
  if (!Array.isArray(items)) return null;

  const categories: CategoryOption[] = [];
  for (const item of items) {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      typeof item.name !== "string"
    ) {
      return null;
    }

    categories.push({ id: item.id, name: item.name });
  }

  return categories;
}

function getResponseMessage(data: unknown) {
  if (!isRecord(data)) return null;
  const messages: string[] = [];

  if (typeof data.message === "string") messages.push(data.message);
  if (isRecord(data.errors)) {
    for (const value of Object.values(data.errors)) {
      if (Array.isArray(value)) {
        messages.push(
          ...value.filter((message): message is string => typeof message === "string"),
        );
      }
    }
  }

  return messages.length > 0 ? messages.join(" ") : null;
}

export default function PostCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAccessToken();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [status, setStatus] = useState<StorePostRequest["status"]>(
    StorePostRequestStatus.draft,
  );
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  const categoryParams = { limit: 100, page: 1 } as const;
  const categoriesQuery = useCategoriesIndex(categoryParams, {
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    query: {
      enabled: Boolean(accessToken),
      queryKey: [...getCategoriesIndexQueryKey(categoryParams), accessToken],
      retry: false,
    },
  });

  const createPost = usePostsStore({
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });

  const categoriesResponse = categoriesQuery.data;
  const categories =
    categoriesResponse?.status === 200
      ? readCategoryOptions(categoriesResponse.data.data.items)
      : null;

  function toggleCategory(categoryId: string) {
    setCategoryIds((selected) =>
      selected.includes(categoryId)
        ? selected.filter((id) => id !== categoryId)
        : [...selected, categoryId],
    );
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (categoryIds.length === 0) {
      toast.error("Selecione pelo menos uma categoria para o post.");
      return;
    }

    const post: StorePostRequest = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      status,
      category_ids: categoryIds,
      ...(coverImage.trim() ? { cover_image: coverImage.trim() } : {}),
    };

    createPost.mutate(
      { data: post },
      {
        onSuccess: (response) => {
          if (response.status !== 201) {
            toast.error(
              getResponseMessage(response.data) ??
                `Não foi possível criar o post (HTTP ${response.status}).`,
            );
            return;
          }

          toast.success("Post criado com sucesso.");
          void queryClient.invalidateQueries({
            queryKey: getPostsIndexQueryKey(),
          });
          router.push("/dashboard/posts");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível conectar à API para criar o post.",
          );
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 max-w-3xl space-y-6 rounded-lg border border-foreground/10 bg-foreground/[0.03] p-6"
    >
      <div>
        <label htmlFor="post-title" className="mb-2 block text-sm font-medium">
          Título
        </label>
        <input
          id="post-title"
          name="title"
          type="text"
          required
          maxLength={255}
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Título do post"
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="post-excerpt" className="mb-2 block text-sm font-medium">
          Resumo
        </label>
        <textarea
          id="post-excerpt"
          name="excerpt"
          required
          rows={3}
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder="Um resumo curto para apresentar o artigo"
          className="w-full resize-y rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="post-cover-image"
          className="mb-2 block text-sm font-medium"
        >
          URL da imagem de capa <span className="font-normal text-foreground/55">(opcional)</span>
        </label>
        <input
          id="post-cover-image"
          name="cover_image"
          type="url"
          maxLength={255}
          value={coverImage}
          onChange={(event) => setCoverImage(event.target.value)}
          placeholder="https://exemplo.com/imagem.jpg"
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="post-content" className="mb-2 block text-sm font-medium">
          Conteúdo
        </label>
        <textarea
          id="post-content"
          name="content"
          required
          rows={12}
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Escreva o conteúdo do artigo..."
          className="w-full resize-y rounded-md border border-foreground/20 bg-background px-3 py-2 font-mono text-sm text-foreground placeholder:font-sans placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Categorias</legend>
        {categoriesQuery.isPending && (
          <p className="text-sm text-foreground/60">Carregando categorias...</p>
        )}
        {categoriesQuery.isError && (
          <div className="text-sm text-red-800 dark:text-red-300">
            <p>Não foi possível carregar as categorias.</p>
            <button
              type="button"
              onClick={() => void categoriesQuery.refetch()}
              className="mt-1 underline underline-offset-2"
            >
              Tentar novamente
            </button>
          </div>
        )}
        {categoriesResponse && categoriesResponse.status !== 200 && (
          <p role="alert" className="text-sm text-red-800 dark:text-red-300">
            A API não conseguiu retornar as categorias (HTTP {categoriesResponse.status}).
          </p>
        )}
        {categories && categories.length === 0 && (
          <p className="text-sm text-foreground/65">
            Cadastre uma categoria antes de criar um post.{" "}
            <Link
              href="/dashboard/categories/new"
              className="underline underline-offset-2 hover:text-foreground"
            >
              Criar categoria
            </Link>
          </p>
        )}
        {categories && categories.length > 0 && (
          <div className="grid gap-2 rounded-md border border-foreground/15 p-3 sm:grid-cols-2">
            {categories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-foreground/5"
              >
                <input
                  type="checkbox"
                  checked={categoryIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="size-4 accent-foreground"
                />
                {category.name}
              </label>
            ))}
          </div>
        )}
        <p className="mt-2 text-xs text-foreground/55">
          Selecione pelo menos uma categoria.
        </p>
      </fieldset>

      <div>
        <label htmlFor="post-status" className="mb-2 block text-sm font-medium">
          Status
        </label>
        <select
          id="post-status"
          name="status"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as StorePostRequest["status"])
          }
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-foreground focus:outline-none sm:max-w-xs"
        >
          <option value={StorePostRequestStatus.draft}>Rascunho</option>
          <option value={StorePostRequestStatus.published}>Publicado</option>
          <option value={StorePostRequestStatus.archived}>Arquivado</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={
          createPost.isPending ||
          categoriesQuery.isPending ||
          categories === null ||
          categories.length === 0 ||
          categoryIds.length === 0
        }
        className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {createPost.isPending ? "Salvando..." : "Criar post"}
      </button>
    </form>
  );
}
