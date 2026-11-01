"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

import PostCard from "@/components/cards/post-card";
import { CategoryProps } from "@/types/Category";
import { PostProps, PostsListProps } from "@/types/Post";

import PostsNotFound from "./post-not-found";
import PostsPagination from "./posts-pagination";
import { getPostsIndexQueryKey, usePostsIndex } from "@/lib/api/generated";
import { isRecord } from "@/lib/utils/is-record";
import { readItems } from "@/lib/utils/read-items";

const CONTENT_LIMIT = 12;
const API_PAGE_SIZE = 100;

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

function parsePost(item: unknown): PostProps | null {
  if (
    !isRecord(item) ||
    typeof item.id !== "string" ||
    (item.locale !== "pt" && item.locale !== "en") ||
    typeof item.translation_group_id !== "string" ||
    typeof item.title !== "string" ||
    typeof item.slug !== "string" ||
    typeof item.excerpt !== "string" ||
    typeof item.content !== "string" ||
    typeof item.status !== "string" ||
    typeof item.views !== "number" ||
    (item.cover_image !== null && typeof item.cover_image !== "string") ||
    (item.published_at !== null && typeof item.published_at !== "string")
  ) {
    return null;
  }

  let categories: CategoryProps[] | undefined;
  if (item.categories !== undefined) {
    categories = readItems(item.categories, parseCategory) ?? undefined;
    if (categories === undefined) return null;
  }

  let translations: PostProps["translations"];
  if (item.translations !== undefined) {
    if (!Array.isArray(item.translations)) return null;
    translations = [];
    for (const translation of item.translations) {
      if (
        !isRecord(translation) ||
        (translation.locale !== "pt" && translation.locale !== "en") ||
        typeof translation.slug !== "string"
      ) {
        return null;
      }
      translations.push({
        locale: translation.locale,
        slug: translation.slug,
      });
    }
  }

  return {
    id: item.id,
    locale: item.locale,
    translation_group_id: item.translation_group_id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    status: item.status,
    views: item.views,
    cover_image: item.cover_image,
    published_at: item.published_at,
    categories,
    translations,
  };
}

export default function PostsList({
  selectedCategories,
  onToggleCategory,
  page,
  onPageChange,
  heading,
  itemsPerPage = CONTENT_LIMIT,
  showAllLink = false,
}: PostsListProps) {
  const locale = useLocale();
  const t = useTranslations("posts");
  const postsParams = {
    limit: API_PAGE_SIZE,
    page: 1,
    order_by: "created_at" as const,
    order_direction: "desc" as const,
    "filters[locale]": locale,
  };

  const postsQuery = usePostsIndex(postsParams, {
    query: {
      queryKey: [...getPostsIndexQueryKey(postsParams), "public"],
      retry: false,
    },
  });

  const postPayload =
    postsQuery.data?.status === 200 ? postsQuery.data.data.data : null;
  const posts =
    postPayload === null ? null : readItems(postPayload.items, parsePost);

  const publishedPosts = useMemo(
    () =>
      (posts ?? []).filter((post) => post.status.toLowerCase() === "published"),
    [posts],
  );

  const filteredPosts = useMemo(
    () =>
      selectedCategories.length > 0
        ? publishedPosts.filter((post) =>
            selectedCategories.some((categoryId) =>
              post.categories?.some((category) => category.id === categoryId),
            ),
          )
        : publishedPosts,
    [publishedPosts, selectedCategories],
  );

  const pageCount = Math.max(
    1,
    Math.ceil(filteredPosts.length / itemsPerPage),
  );
  const currentPage = Math.min(page, pageCount);
  const pagePosts = filteredPosts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const postsError =
    postsQuery.isError ||
    (postsQuery.data !== undefined && postsQuery.data.status !== 200) ||
    (postPayload !== null && posts === null);

  return (
    <section aria-labelledby="content-heading" className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-foreground/10 pb-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-foreground/50">
            {t("library")}
          </p>
          <h2 id="content-heading" className="mt-2 text-2xl font-semibold">
            {selectedCategories.length > 0
              ? t("selectedCategories", { count: selectedCategories.length })
              : heading ?? t("recent")}
          </h2>
        </div>
        <div className="flex items-center gap-4">
          {!postsError && !postsQuery.isPending && (
            <p className="text-sm text-foreground/55">
              {t("articleCount", { count: filteredPosts.length })}
            </p>
          )}
          {showAllLink && (
            <Link
              href="/artigos"
              className="text-sm font-medium text-foreground/75 underline decoration-foreground/25 underline-offset-4 transition-colors hover:text-foreground"
            >
              {t("viewAll")}
            </Link>
          )}
        </div>
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
          <PostsNotFound onRetry={() => void postsQuery.refetch()} />
        </div>
      )}

      {!postsQuery.isPending && !postsError && pagePosts.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-foreground/20 px-6 py-16 text-center">
          <p className="font-medium">{t("emptyTitle")}</p>
          <p className="mt-2 text-sm text-foreground/60">
            {t("emptyDescription")}
          </p>
        </div>
      )}

      {!postsQuery.isPending && !postsError && pagePosts.length > 0 && (
        <div className="grid gap-5 pt-6 sm:grid-cols-2 xl:grid-cols-3">
          {pagePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              selectedCategories={selectedCategories}
              onToggleCategory={onToggleCategory}
            />
          ))}
        </div>
      )}

      {!postsQuery.isPending && !postsError && (
        <PostsPagination
          currentPage={currentPage}
          pageCount={pageCount}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
}
