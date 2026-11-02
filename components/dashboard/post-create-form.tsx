"use client";

import {
  getCategoriesIndexQueryKey,
  getPostsIndexQueryKey,
  getPostsStoreUrl,
  useCategoriesStore,
  useCategoriesIndex,
} from "@/lib/api/generated";
import {
  StorePostRequestStatus,
  type StoreCategoryRequest,
  type StorePostRequest,
} from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import PostContentEditor from "@/components/dashboard/post-content-editor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
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

function getResponseMessage(
  data: unknown,
  formatFieldError?: (field: string, message: string) => string,
  validationPrefix?: string,
) {
  if (!isRecord(data)) return null;
  const fieldErrors: string[] = [];

  if (isRecord(data.errors)) {
    for (const [field, value] of Object.entries(data.errors)) {
      if (Array.isArray(value)) {
        for (const message of value) {
          if (typeof message !== "string") continue;
          fieldErrors.push(
            formatFieldError
              ? formatFieldError(field, message)
              : `${field}: ${message}`,
          );
        }
      }
    }
  }

  if (fieldErrors.length > 0) {
    const details = fieldErrors.join("; ");
    return validationPrefix ? `${validationPrefix}: ${details}` : details;
  }
  return typeof data.message === "string" ? data.message : null;
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
  const [categorySelectOpen, setCategorySelectOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const categorySelectRef = useRef<HTMLDivElement>(null);

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
  const createCategory = useCategoriesStore({
    fetch: accessToken
      ? { headers: { Authorization: "Bearer " + accessToken } }
      : undefined,
  });

  const createPost = useMutation({
    mutationFn: (data: FormData) => createPostWithImage(data, accessToken),
  });

  const categoriesResponse = categoriesQuery.data;
  const categories =
    categoriesResponse?.status === 200
      ? readCategoryOptions(categoriesResponse.data.data.items)
      : null;
  const postFieldLabels: Record<string, string> = {
    title: t("title"),
    excerpt: t("excerpt"),
    content: t("content"),
    cover_image: t("coverImage"),
    category_ids: t("categories"),
    locale: t("language"),
    status: t("status"),
    translation_group_id: t("translationOf"),
  };

  function formatPostFieldError(field: string, message: string) {
    const normalizedField = field.replace(/\.\d+$/, "").replace(/\[\]$/, "");
    const fieldLabel =
      postFieldLabels[normalizedField] ??
      normalizedField.replace(/[_.[\]]/g, " ");

    return /\brequired\b/i.test(message)
      ? t("requiredField", { field: fieldLabel })
      : t("fieldValidationError", { field: fieldLabel, message });
  }

  useEffect(() => {
    if (!categorySelectOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !categorySelectRef.current?.contains(event.target)
      ) {
        setCategorySelectOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setCategorySelectOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [categorySelectOpen]);

  useEffect(() => {
    if (!categoryModalOpen || createCategory.isPending) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setCategoryModalOpen(false);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [categoryModalOpen, createCategory.isPending]);

  function handleCreateCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newCategoryName.trim();
    const previousIds = new Set(categories?.map((category) => category.id));
    const data: StoreCategoryRequest = { name };

    createCategory.mutate(
      { data },
      {
        onSuccess: async (response) => {
          if (response.status < 200 || response.status >= 300) {
            toast.error(
              getResponseMessage(response.data) ??
                t("categoryCreateError", { status: response.status }),
            );
            return;
          }

          await queryClient.invalidateQueries({
            queryKey: getCategoriesIndexQueryKey(),
            refetchType: "none",
          });
          const refreshedCategories = await categoriesQuery.refetch();
          const updatedCategories =
            refreshedCategories.data?.status === 200
              ? readCategoryOptions(refreshedCategories.data.data.data.items)
              : null;
          const createdCategory =
            updatedCategories?.find(
              (category) =>
                category.name === name && !previousIds.has(category.id),
            ) ?? updatedCategories?.find((category) => category.name === name);

          setCategoryModalOpen(false);
          setNewCategoryName("");

          if (!createdCategory) {
            toast.error(t("categoryCreatedNotSelected"));
            return;
          }

          setCategoryIds((selected) => [...selected, createdCategory.id]);
          toast.success(t("categoryCreateSuccess"));
        },
        onError: (error) => {
          toast.error(
            error instanceof Error
              ? error.message
              : t("categoryCreateConnectionError"),
          );
        },
      },
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
              getResponseMessage(
                response.data,
                formatPostFieldError,
                t("validationErrorPrefix"),
              ) ??
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
    <>
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
        <label
          htmlFor="post-cover-image"
          className="mb-2 block text-sm font-medium"
        >
          {t("coverImage")}
        </label>
        <input
          id="post-cover-image"
          name="cover_image"
          type="file"
          accept="image/*"
          required
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
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <label htmlFor="post-category" className="text-sm font-medium">
            {t("categories")}
          </label>
          <button
            type="button"
            onClick={() => setCategoryModalOpen(true)}
            className="text-sm font-medium text-foreground/75 underline underline-offset-4 hover:text-foreground"
          >
            {t("createCategory")}
          </button>
        </div>
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
        {categories === null &&
          !categoriesQuery.isPending &&
          !categoriesQuery.isError &&
          categoriesResponse?.status === 200 && (
            <p role="alert" className="text-sm text-red-800 dark:text-red-300">
              {t("invalidCategories")}
            </p>
          )}
        {categories && categories.length === 0 && (
          <p className="text-sm text-foreground/65">{t("noCategories")}</p>
        )}
        {categories && categories.length > 0 && (
          <div ref={categorySelectRef} className="relative w-full sm:max-w-md">
            <button
              id="post-category"
              type="button"
              aria-haspopup="listbox"
              aria-expanded={categorySelectOpen}
              aria-controls="post-category-options"
              onClick={() => setCategorySelectOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-3 rounded-md border border-foreground/20 bg-background px-3 py-2 text-left text-foreground focus:border-foreground focus:outline-none"
            >
              <span
                className={
                  categoryIds.length > 0
                    ? "truncate"
                    : "truncate text-foreground/55"
                }
              >
                {categories
                  .filter((category) => categoryIds.includes(category.id))
                  .map((category) => category.name)
                  .join(", ") || t("selectCategoryPlaceholder")}
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className={`size-4 shrink-0 transition-transform ${categorySelectOpen ? "rotate-180" : ""}`}
              >
                <path
                  d="m5 7.5 5 5 5-5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
            </button>
            {categorySelectOpen && (
              <div
                id="post-category-options"
                role="listbox"
                aria-label={t("categories")}
                aria-multiselectable="true"
                className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-foreground/20 bg-background p-1 shadow-lg"
              >
                {categories.map((category) => {
                  const selected = categoryIds.includes(category.id);

                  return (
                    <button
                      key={category.id}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() =>
                        setCategoryIds((current) =>
                          selected
                            ? current.filter((id) => id !== category.id)
                            : [...current, category.id],
                        )
                      }
                      className="flex w-full items-center gap-2 rounded px-2 py-2 text-left text-sm hover:bg-foreground/5 focus:bg-foreground/5 focus:outline-none"
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                          selected
                            ? "border-foreground bg-foreground text-background"
                            : "border-foreground/40"
                        }`}
                      >
                        {selected && (
                          <svg viewBox="0 0 16 16" fill="none" className="size-3">
                            <path
                              d="m3 8 3 3 7-7"
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                            />
                          </svg>
                        )}
                      </span>
                      <span>{category.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
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

      {categoryModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => {
            if (!createCategory.isPending) setCategoryModalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-category-title"
            className="w-full max-w-md rounded-lg border border-foreground/15 bg-background p-6 text-foreground shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="create-category-title" className="text-xl font-semibold">
              {t("createCategory")}
            </h2>
            <form onSubmit={handleCreateCategory} className="mt-5">
              <label
                htmlFor="new-category-name"
                className="mb-2 block text-sm font-medium"
              >
                {t("categoryName")}
              </label>
              <input
                id="new-category-name"
                name="name"
                type="text"
                required
                minLength={3}
                maxLength={255}
                autoFocus
                value={newCategoryName}
                onChange={(event) => setNewCategoryName(event.target.value)}
                placeholder={t("categoryNamePlaceholder")}
                className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground placeholder:text-foreground/45 focus:border-foreground focus:outline-none"
              />
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={createCategory.isPending}
                  onClick={() => setCategoryModalOpen(false)}
                  className="rounded-md border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={
                    createCategory.isPending || newCategoryName.trim().length < 3
                  }
                  className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {createCategory.isPending
                    ? t("categoryCreatePending")
                    : t("categoryCreateSubmit")}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
