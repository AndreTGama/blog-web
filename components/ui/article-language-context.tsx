"use client";

import { createContext, useContext, useState } from "react";
import type { Locale } from "@/i18n/constants";

type ArticleSlugs = Partial<Record<Locale, string>>;
type ArticleLanguageContextValue = {
  articleSlugs: ArticleSlugs | null;
  setArticleSlugs: (slugs: ArticleSlugs | null) => void;
};

const ArticleLanguageContext =
  createContext<ArticleLanguageContextValue | null>(null);

export function ArticleLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [articleSlugs, setArticleSlugs] = useState<ArticleSlugs | null>(null);

  return (
    <ArticleLanguageContext.Provider value={{ articleSlugs, setArticleSlugs }}>
      {children}
    </ArticleLanguageContext.Provider>
  );
}

export function useArticleLanguage() {
  const context = useContext(ArticleLanguageContext);
  if (!context) {
    throw new Error(
      "useArticleLanguage must be used within ArticleLanguageProvider.",
    );
  }
  return context;
}
