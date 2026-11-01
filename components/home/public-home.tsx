"use client";

import { useState } from "react";
import CategoriesFilter from "@/components/filters/categories";
import HeaderMain from "@/components/headers/header-main";
import PostsList from "@/components/posts/posts-list";

export default function PublicHome() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [page, setPage] = useState(1);

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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HeaderMain />
      <main
        id="conteudos"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14 lg:py-20"
      >
        <CategoriesFilter
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          onClearCategories={clearCategories}
        />
        <PostsList
          selectedCategories={selectedCategories}
          onToggleCategory={toggleCategory}
          page={page}
          onPageChange={setPage}
          showAllLink
        />
      </main>
    </div>
  );
}
