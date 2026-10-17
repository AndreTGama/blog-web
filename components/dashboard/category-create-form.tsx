"use client";

import { getCategoriesIndexQueryKey, useCategoriesStore } from "@/lib/api/generated";
import type { StoreCategoryRequest } from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";

export default function CategoryCreateForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAccessToken();
  const [name, setName] = useState("");
  const createCategory = useCategoriesStore({
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const category: StoreCategoryRequest = { name: name.trim() };
    createCategory.mutate(
      { data: category },
      {
        onSuccess: (response) => {
          if (response.status < 200 || response.status >= 300) {
            const message =
              typeof response.data === "object" &&
              response.data !== null &&
              "message" in response.data &&
              typeof response.data.message === "string"
                ? response.data.message
                : "Não foi possível criar a categoria.";
            toast.error(message);
            return;
          }

          toast.success("Categoria criada com sucesso.");
          void queryClient.invalidateQueries({
            queryKey: getCategoriesIndexQueryKey(),
          });
          router.push("/dashboard/categories");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Não foi possível conectar à API para criar a categoria.",
          );
        },
      },
    );
  }

  return (
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
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Ex.: Padrões de projeto"
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
        />
        <p className="mt-2 text-xs text-foreground/60">
          O slug será gerado pela API a partir do nome.
        </p>
      </div>

      <button
        type="submit"
        disabled={createCategory.isPending || name.trim().length < 3}
        className="mt-6 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {createCategory.isPending ? "Salvando..." : "Criar categoria"}
      </button>
    </form>
  );
}
