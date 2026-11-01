"use client";

import {
  getCategoriesIndexQueryKey,
  getPostsIndexQueryKey,
  getPostsStoreUrl,
  useCategoriesIndex,
} from "@/lib/api/generated";
import {
  StorePostRequestStatus,
  type StorePostRequest,
} from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import PostContentEditor from "@/components/dashboard/post-content-editor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
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

async function createPostWithImage(
  data: FormData,
  accessToken: string | null,
): Promise<{ status: number; data: unknown }> {
  const response = await fetch(getPostsStoreUrl(), {
    method: "POST",
    headers: accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : undefined,
    body: data,
  });
  const body = await response.text();

  return {
    status: response.status,
    data: body ? (JSON.parse(body) as unknown) : null,
  };
}

export default function PostCreateForm({
  initialLocale,
  translationGroupId,
}: {
  initialLocale: "pt" | "en";
  translationGroupId?: string;
}) {
  const t = useTranslations("postForm");
  const postAdmin = useTranslations("postAdmin");
  const router = useRouter();
  const queryClient = useQueryClient();
  const accessToken = useAccessToken();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [contentText, setContentText] = useState("");
  const [status, setStatus] = useState<StorePostRequest["status"]>(
    StorePostRequestStatus.draft,
  );
  const [locale, setLocale] = useState<"pt" | "en">(initialLocale);
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

  const createPost = useMutation({
    mutationFn: (data: FormData) => createPostWithImage(data, accessToken),
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
      toast.error(t("categoryRequired"));
      return;
    }

    if (!contentText.trim()) {
      toast.error(t("contentRequired"));
      return;
    }

    const post = new FormData(event.currentTarget);
    post.set("title", title.trim());
    post.set("excerpt", excerpt.trim());
    post.set("content", content.trim());
    post.set("status", status);
    post.set("locale", locale);
    if (translationGroupId) {
      post.set("translation_group_id", translationGroupId);
    }
    post.delete("category_ids[]");
    categoryIds.forEach((categoryId) =>
      post.append("category_ids[]", categoryId),
    );

    const coverImage = post.get("cover_image");
    if (!(coverImage instanceof File) || coverImage.size === 0) {
      post.delete("cover_image");
    }

    createPost.mutate(
      post,
      {
        onSuccess: (response) => {
          if (response.status !== 201) {
            toast.error(
              getResponseMessage(response.data) ??
                t("createError", { status: response.status }),
            );
            return;
          }

          toast.success(t("createSuccess"));
          void queryClient.invalidateQueries({
            queryKey: getPostsIndexQueryKey(),
          });
          router.push("/dashboard/posts");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : t("createConnectionError"),
          );
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-lg border border-foreground/10 bg-foreground/[0.03] p-6"
    >
      <div>
        <label htmlFor="post-locale" className="mb-2 block text-sm font-medium">
          {t("language")}
        </label>
        <select
          id="post-locale"
          value={locale}
          disabled={Boolean(translationGroupId)}
          onChange={(event) => setLocale(event.target.value as "pt" | "en")}
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-foreground focus:outline-none sm:max-w-xs disabled:opacity-70"
        >
          <option value="pt">{postAdmin("localePortuguese")}</option>
          <option value="en">{postAdmin("localeEnglish")}</option>
        </select>
        {translationGroupId && (
          <p className="mt-2 text-xs text-foreground/60">{t("translationHelp")}</p>
        )}
      </div>

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
          value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t("titlePlaceholder")}
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
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
          value={excerpt}
          onChange={(event) => setExcerpt(event.target.value)}
          placeholder={t("excerptPlaceholder")}
          className="w-full resize-y rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="post-cover-image" className="mb-2 block text-sm font-medium">
          {t("coverImage")}{" "}
          <span className="font-normal text-foreground/55">{t("optional")}</span>
        </label>
        <input
          id="post-cover-image"
          name="cover_image"
          type="file"
          accept="image/*"
          className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
        />
      </div>

      <div>
        <label htmlFor="post-content" className="mb-2 block text-sm font-medium">
          {t("content")}
        </label>
        <PostContentEditor
          value=""
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
          {t("selectCategory")}
        </p>
      </fieldset>

      <div>
        <label htmlFor="post-status" className="mb-2 block text-sm font-medium">
          {t("status")}
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
          <option value={StorePostRequestStatus.draft}>{postAdmin("statusDraft")}</option>
          <option value={StorePostRequestStatus.published}>{postAdmin("statusPublished")}</option>
          <option value={StorePostRequestStatus.archived}>{postAdmin("statusArchived")}</option>
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
        {createPost.isPending ? t("pending") : t("submitCreate")}
      </button>
    </form>
  );
}
