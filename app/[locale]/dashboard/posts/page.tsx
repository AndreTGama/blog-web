"use client";

import {
  getPostsIndexQueryKey,
  getPostsShowQueryKey,
  usePostsDelete,
  usePostsIndex,
} from "@/lib/api/generated";
import type { PostsIndexParams } from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import { useLocale, useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import RowActions from "@/components/dashboard/row-actions";

type PostRow = {
  id: string;
  locale: "pt" | "en";
  translationGroupId: string;
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
      (item.locale !== "pt" && item.locale !== "en") ||
      typeof item.translation_group_id !== "string" ||
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
      locale: item.locale,
      translationGroupId: item.translation_group_id,
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

function formatDate(value: string | null, locale: string) {
  if (!value) return "—";

  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function statusLabel(status: string, t: ReturnType<typeof useTranslations>) {
  switch (status) {
    case "published":
      return t("statusPublished");
    case "draft":
      return t("statusDraft");
    case "archived":
      return t("statusArchived");
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
  const t = useTranslations("postAdmin");
  const formT = useTranslations("postForm");
  const common = useTranslations("dashboard");
  const locale = useLocale();
  const accessToken = useAccessToken();
  const queryClient = useQueryClient();
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
  const deletePost = usePostsDelete({
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
  const currentPageItemCount =
    postsQuery.data?.status === 200 &&
    Array.isArray(postsQuery.data.data.data.items)
      ? postsQuery.data.data.data.items.length
      : 0;

  function handleDelete(post: PostRow) {
    if (!window.confirm(t("confirmDelete", { title: post.title }))) {
      return;
    }

    deletePost.mutate(
      { postResource: post.id },
      {
        onSuccess: (response) => {
          if (response.status !== 200) {
            const message =
              typeof response.data === "object" &&
              response.data !== null &&
              "message" in response.data &&
              typeof response.data.message === "string"
                ? response.data.message
                : t("deleteError", { status: response.status });
            toast.error(message);
            return;
          }

          toast.success(t("deleteSuccess"));
          void queryClient.invalidateQueries({
            queryKey: getPostsIndexQueryKey(),
          });
          void queryClient.invalidateQueries({
            queryKey: getPostsShowQueryKey(post.id),
          });
          if (currentPageItemCount === 1 && page > 1) {
            setPage((current) => current - 1);
          }
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : t("deleteConnectionError"),
          );
        },
      },
    );
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  if (postsQuery.isPending) {
    return <p className="text-foreground/70">{t("loading")}</p>;
  }

  if (postsQuery.isError) {
    return (
      <section className="mx-auto max-w-5xl rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-3 text-foreground/70">
          {t("loadError")}
        </p>
        <button
          type="button"
          onClick={() => void postsQuery.refetch()}
          className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          {t("retry")}
        </button>
      </section>
    );
  }

  const response = postsQuery.data;
  if (response.status !== 200) {
    return (
      <p role="alert" className="text-foreground/70">
        {t("apiError", { status: response.status })}
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
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p role="alert" className="mt-3 text-foreground/70">
          {t("invalidResponse")}
        </p>
      </section>
    );
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-11rem)] w-full max-w-6xl flex-col">
      <header className="flex flex-col gap-4 border-b border-foreground/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-foreground/60">{common("adminLabel")}</p>
          <h1 className="mt-2 text-3xl font-semibold">{t("title")}</h1>
          <p className="mt-2 text-foreground/70">
            {t("description")}
          </p>
        </div>
        <Link
          href="/dashboard/posts/new"
          className="inline-flex w-fit rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80"
        >
          {t("new")}
        </Link>
      </header>

      <form onSubmit={handleSearch} className="mt-6 flex max-w-lg gap-2">
        <label htmlFor="post-search" className="sr-only">
          {t("search")}
        </label>
        <input
          id="post-search"
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="min-w-0 flex-1 rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          {t("searchButton")}
        </button>
      </form>

      <div className="mt-6 flex min-h-[18rem] flex-1 flex-col rounded-lg border border-foreground/10 bg-foreground/[0.03]">
        <div className="h-full flex-1 overflow-x-auto rounded-lg">
          <table className="h-full w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-foreground/10 text-xs uppercase tracking-wide text-foreground/60">
              <tr>
                <th scope="col" className="px-5 py-4 font-medium">{formT("title")}</th>
                <th scope="col" className="px-5 py-4 font-medium">{formT("categories")}</th>
                <th scope="col" className="px-5 py-4 font-medium">{formT("status")}</th>
                <th scope="col" className="px-5 py-4 font-medium">{t("views")}</th>
                <th scope="col" className="px-5 py-4 font-medium">{t("publishedAt")}</th>
                <th scope="col" className="px-5 py-4 font-medium">{t("actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-5 py-4">
                    <p className="font-medium">{post.title}</p>
                    <p className="mt-1 text-xs text-foreground/55">{post.slug}</p>
                    <p className="mt-1 text-xs text-foreground/50">
                      {post.locale === "en"
                        ? t("localeEnglish")
                        : t("localePortuguese")}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-foreground/65">
                    {post.categories.length > 0
                      ? post.categories.join(", ")
                      : t("noCategories")}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(post.status)}`}
                    >
                      {statusLabel(post.status, t)}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-foreground/65">{post.views}</td>
                  <td className="px-5 py-4 text-foreground/65">
                    {formatDate(
                      post.publishedAt,
                      locale === "pt" ? "pt-BR" : "en-US",
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <RowActions
                      label={post.title}
                      editHref={`/dashboard/posts/${encodeURIComponent(post.id)}/edit`}
                      previewHref={`/artigos/${encodeURIComponent(post.slug)}`}
                      onDelete={() => handleDelete(post)}
                      deletePending={
                        deletePost.isPending &&
                        deletePost.variables?.postResource === post.id
                      }
                      deleteLabel={
                        deletePost.isPending &&
                        deletePost.variables?.postResource === post.id
                          ? t("deleting")
                          : t("delete")
                      }
                    />
                    <Link
                      href={`/dashboard/posts/new?translation_group_id=${encodeURIComponent(post.translationGroupId)}`}
                      locale={post.locale === "pt" ? "en" : "pt"}
                      className="mt-2 block text-xs text-foreground/60 underline underline-offset-2 hover:text-foreground"
                    >
                      {t("createTranslation")}
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
                    {t("none")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <footer className="mt-4 flex flex-col gap-3 text-sm text-foreground/60 sm:flex-row sm:items-center sm:justify-between">
        <p>
          {t("pagination", {
            total: Number.isFinite(total) ? total : 0,
            current: currentPage,
            last: lastPage,
          })}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={currentPage <= 1}
            className="rounded-md border border-foreground/15 px-3 py-2 text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("previous")}
          </button>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(lastPage, value + 1))}
            disabled={currentPage >= lastPage}
            className="rounded-md border border-foreground/15 px-3 py-2 text-foreground transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t("next")}
          </button>
        </div>
      </footer>
    </div>
  );
}
