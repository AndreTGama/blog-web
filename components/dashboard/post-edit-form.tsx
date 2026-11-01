"use client";

import {
  getCategoriesIndexQueryKey,
  getPostsIndexQueryKey,
  getPostsShowQueryKey,
  useCategoriesIndex,
  usePostsShow,
  usePostsUpdate,
} from "@/lib/api/generated";
import type { PostResource } from "@/lib/api/generated/models";
import type { UpdatePostRequest } from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import { useTranslations } from "next-intl";
import PostContentEditor from "@/components/dashboard/post-content-editor";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useRouter } from "@/i18n/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";

type CategoryOption = {
  id: string;
  name: string;
};

type PostStatus = "draft" | "published" | "archived";

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

function responseMessage(data: unknown) {
  if (!isRecord(data)) return null;
  const messages: string[] = [];

  if (typeof data.message === "string") messages.push(data.message);
  if (isRecord(data.errors)) {
    for (const value of Object.values(data.errors)) {
      if (Array.isArray(value)) {
        messages.push(
          ...value.filter(
            (message): message is string => typeof message === "string",
          ),
        );
      }
    }
  }

  return messages.length > 0 ? messages.join(" ") : null;
}

function getPostStatus(status: string): PostStatus {
  if (status === "published" || status === "archived") return status;
  return "draft";
}

function PostEditFields({
  post,
  postId,
  accessToken,
}: {
  post: PostResource;
  postId: string;
  accessToken: string;
}) {
  const t = useTranslations("postForm");
  const postAdmin = useTranslations("postAdmin");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [categoryIds, setCategoryIds] = useState<string[] | null>(null);
  const [content, setContent] = useState(post.content);
  const [contentText, setContentText] = useState(post.content);
  const categoryParams = { limit: 100, page: 1 } as const;
  const categoriesQuery = useCategoriesIndex(categoryParams, {
    fetch: { headers: { Authorization: `Bearer ${accessToken}` } },
    query: {
      queryKey: [...getCategoriesIndexQueryKey(categoryParams), accessToken],
      retry: false,
    },
  });
  const categoriesResponse = categoriesQuery.data;
  const categories =
    categoriesResponse?.status === 200
      ? readCategoryOptions(categoriesResponse.data.data.items)
      : null;
  const selectedCategoryIds =
    categoryIds ?? post.categories?.map((category) => category.id) ?? [];

  const updatePost = usePostsUpdate({
    fetch: { headers: { Authorization: `Bearer ${accessToken}` } },
  });

  function toggleCategory(id: string) {
    setCategoryIds((selected) => {
      const current =
        selected ?? post.categories?.map((category) => category.id) ?? [];
      return current.includes(id)
        ? current.filter((categoryId) => categoryId !== id)
        : [...current, id];
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") ?? "").trim();
    const excerpt = String(formData.get("excerpt") ?? "").trim();
    const coverImage = String(formData.get("cover_image") ?? "").trim();
    const status = String(formData.get("status")) as PostStatus;

    if (!contentText.trim()) {
      toast.error(t("contentRequired"));
      return;
    }

    const update: UpdatePostRequest = {
      title,
      excerpt,
      content: content.trim(),
      status,
      cover_image: coverImage || null,
      ...(categoryIds !== null ? { category_ids: categoryIds } : {}),
    };

    updatePost.mutate(
      { postResource: postId, data: update },
      {
        onSuccess: (response) => {
          if (response.status !== 200) {
            toast.error(
              responseMessage(response.data) ??
                t("updateError", { status: response.status }),
            );
            return;
          }

          toast.success(t("updateSuccess"));
          void queryClient.invalidateQueries({
            queryKey: getPostsIndexQueryKey(),
          });
          void queryClient.invalidateQueries({
            queryKey: getPostsShowQueryKey(postId),
          });
          router.push("/dashboard/posts");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : t("updateConnectionError"),
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
          {t("title")}
        </label>
        <input
          id="post-title"
          name="title"
          type="text"
          required
          maxLength={255}
          defaultValue={post.title}
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="post-excerpt" className="mb-2 block text-sm font-medium">
          {t("excerpt")}
        </label>
        <textarea
          id="post-excerpt"
          name="excerpt"
          required
          rows={3}
          defaultValue={post.excerpt}
          className="w-full resize-y rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="post-cover-image"
          className="mb-2 block text-sm font-medium"
        >
          {t("coverImage")} {t("optional")}
        </label>
        <input
          id="post-cover-image"
          name="cover_image"
          type="url"
          maxLength={255}
          defaultValue={post.cover_image ?? ""}
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="post-content" className="mb-2 block text-sm font-medium">
          {t("content")}
        </label>
        <PostContentEditor
          value={post.content}
          onChange={(html, text) => {
            setContent(html);
            setContentText(text);
          }}
        />
      </div>

      <fieldset>
        <legend className="mb-2 text-sm font-medium">{t("categories")}</legend>
        {categoriesQuery.isPending && (
          <p className="text-sm text-foreground/60">{t("loadingCategories")}</p>
        )}
        {categoriesQuery.isError && (
          <div className="text-sm text-red-800 dark:text-red-300">
            <p>{t("categoriesError")}</p>
            <button
              type="button"
              onClick={() => void categoriesQuery.refetch()}
              className="mt-1 underline underline-offset-2"
            >
              {t("retry")}
            </button>
          </div>
        )}
        {categoriesResponse && categoriesResponse.status !== 200 && (
          <p role="alert" className="text-sm text-red-800 dark:text-red-300">
            {t("apiCategoriesError", { status: categoriesResponse.status })}
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
                  checked={selectedCategoryIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="size-4 accent-foreground"
                />
                {category.name}
              </label>
            ))}
          </div>
        )}
        {categories === null && !categoriesQuery.isPending && !categoriesQuery.isError && (
          <p className="text-sm text-foreground/65">
            {t("invalidCategories")}
          </p>
        )}
        {categories && categories.length === 0 && (
          <p className="text-sm text-foreground/65">
            {t("noCategories")}{" "}
            <Link
              href="/dashboard/categories/new"
              className="underline underline-offset-2 hover:text-foreground"
            >
              {t("createCategory")}
            </Link>
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor="post-status" className="mb-2 block text-sm font-medium">
          {t("status")}
        </label>
        <select
          id="post-status"
          name="status"
          defaultValue={getPostStatus(post.status)}
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-foreground focus:outline-none sm:max-w-xs"
        >
          <option value="draft">{postAdmin("statusDraft")}</option>
          <option value="published">{postAdmin("statusPublished")}</option>
          <option value="archived">{postAdmin("statusArchived")}</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={updatePost.isPending}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {updatePost.isPending ? t("pending") : t("submitUpdate")}
      </button>
    </form>
  );
}

export default function PostEditForm({ postId }: { postId: string }) {
  const t = useTranslations("postForm");
  const common = useTranslations("dashboard");
  const postAdmin = useTranslations("postAdmin");
  const accessToken = useAccessToken();
  const postQuery = usePostsShow(postId, {
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    query: {
      enabled: Boolean(accessToken && postId),
      queryKey: [...getPostsShowQueryKey(postId), accessToken],
      retry: false,
    },
  });

  if (!accessToken || postQuery.isPending) {
    return <p className="text-foreground/70">{t("loadPost")}</p>;
  }

  if (postQuery.isError) {
    return (
      <section className="max-w-3xl rounded-lg border border-foreground/10 p-6">
        <h1 className="text-2xl font-semibold">{t("loadPostError")}</h1>
        <p className="mt-3 text-foreground/70">
          {postQuery.error instanceof Error
            ? postQuery.error.message
            : t("apiError")}
        </p>
        <button
          type="button"
          onClick={() => void postQuery.refetch()}
          className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          {common("retry")}
        </button>
      </section>
    );
  }

  const response = postQuery.data;
  if (response.status !== 200) {
    return (
      <section className="max-w-3xl rounded-lg border border-foreground/10 p-6">
        <h1 className="text-2xl font-semibold">{t("postUnavailable")}</h1>
        <p role="alert" className="mt-3 text-foreground/70">
          {responseMessage(response.data) ??
            t("apiPostError", { status: response.status })}
        </p>
        <Link
          href="/dashboard/posts"
          className="mt-4 inline-block text-sm underline underline-offset-4"
        >
          {t("back")}
        </Link>
      </section>
    );
  }

  const post = response.data.data;

  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-sm text-foreground/60">{common("adminLabel")}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">{t("editTitle")}</h1>
          <Link
            href="/dashboard/posts"
            className="text-sm text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("back")}
          </Link>
          <Link
            href={`/dashboard/posts/new?translation_group_id=${encodeURIComponent(post.translation_group_id)}`}
            locale={post.locale === "pt" ? "en" : "pt"}
            className="text-sm text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            {postAdmin("createTranslation")} (
            {post.locale === "pt"
              ? postAdmin("localeEnglish")
              : postAdmin("localePortuguese")}
            )
          </Link>
        </div>
      </header>
      <PostEditFields
        key={post.id}
        post={post}
        postId={postId}
        accessToken={accessToken}
      />
    </div>
  );
}
