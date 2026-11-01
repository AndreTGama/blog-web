"use client";

import {
  getCategoriesIndexQueryKey,
  useCategoriesIndex,
} from "@/lib/api/generated";
import { CategoryProps } from "@/types/Category";

import { useMemo, useState } from "react";

const API_PAGE_SIZE = 100;

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

function parseCategory(item: unknown): CategoryProps | null {
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

type CategoriesFilterProps = {
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onClearCategories: () => void;
};

export default function CategoriesFilter({
  selectedCategories,
  onToggleCategory,
  onClearCategories,
}: CategoriesFilterProps) {
  const [categorySearch, setCategorySearch] = useState("");

  const categoriesParams = { limit: API_PAGE_SIZE, page: 1 };

  const categoriesQuery = useCategoriesIndex(categoriesParams, {
    query: {
      queryKey: [...getCategoriesIndexQueryKey(categoriesParams), "public"],
      retry: false,
    },
  });

  const categoryPayload =
    categoriesQuery.data?.status === 200
      ? categoriesQuery.data.data.data
      : null;
  const categories =
    categoryPayload === null
      ? null
      : readItems(categoryPayload.items, parseCategory);

  const visibleCategories = useMemo(() => {
    const normalizedSearch = categorySearch.trim().toLocaleLowerCase("pt-BR");
    return (categories ?? []).filter((category) =>
      category.name.toLocaleLowerCase("pt-BR").includes(normalizedSearch),
    );
  }, [categories, categorySearch]);

  return (
    <aside
      aria-label="Filtros de conteúdo"
      className="lg:sticky lg:top-8 lg:self-start"
    >
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
          onClick={onClearCategories}
          className={`shrink-0 rounded-lg px-3 py-2 text-left text-sm transition-colors lg:w-full ${
            selectedCategories.length === 0
              ? "bg-foreground text-background"
              : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
          }`}
        >
          Todas as categorias
        </button>

        {categoriesQuery.isPending && (
          <p className="px-3 py-2 text-sm text-foreground/55">Carregando...</p>
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
            onClick={() => onToggleCategory(category.id)}
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
  );
}
