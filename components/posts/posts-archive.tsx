"use client";

import { useState } from "react";
import CategoriesFilter from "@/components/filters/categories";
import PostsList from "@/components/posts/posts-list";
import HeaderArticle from "@/components/headers/header-article";

export default function PostsArchive() {
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
    <>
      <HeaderArticle
        eyebrow="Biblioteca"
        title="Todos os artigos"
        description="Explore conteúdos sobre tecnologia, arquitetura e desenvolvimento."
      />
      <main
        id="conteudos"
        className="mx-auto min-h-screen max-w-7xl px-5 pb-14 pt-14 sm:px-8 lg:pb-20 lg:pt-20"
      >
        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
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
            heading="Artigos"
            itemsPerPage={15}
          />
        </div>
      </main>
    </>
  );
}
