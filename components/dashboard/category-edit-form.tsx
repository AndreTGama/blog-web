"use client";

import {
  getCategoriesIndexQueryKey,
  getCategoriesShowQueryKey,
  useCategoriesShow,
  useCategoriesUpdate,
} from "@/lib/api/generated";
import type { UpdateCategoryRequest } from "@/lib/api/generated/models";
import { useAccessToken } from "@/lib/auth/session";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function responseMessage(data: unknown) {
  return isRecord(data) && typeof data.message === "string"
    ? data.message
    : null;
}

export default function CategoryEditForm({
  categoryId,
}: {
  categoryId: string;
}) {
  const t = useTranslations("categoryAdmin");
  const common = useTranslations("dashboard");
  const accessToken = useAccessToken();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [name, setName] = useState<string | null>(null);

  const categoryQuery = useCategoriesShow(categoryId, {
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    query: {
      enabled: Boolean(accessToken && categoryId),
      queryKey: [...getCategoriesShowQueryKey(categoryId), accessToken],
      retry: false,
    },
  });

  const updateCategory = useCategoriesUpdate({
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });

  if (categoryQuery.isPending) {
    return <p className="text-foreground/70">{t("loadingSingle")}</p>;
  }

  if (categoryQuery.isError) {
    return (
      <section className="max-w-2xl rounded-lg border border-foreground/10 p-6">
        <h1 className="text-2xl font-semibold">{t("loadSingleError")}</h1>
        <p className="mt-3 text-foreground/70">
          {categoryQuery.error instanceof Error
            ? categoryQuery.error.message
            : t("apiConnectionError")}
        </p>
        <button
          type="button"
          onClick={() => void categoryQuery.refetch()}
          className="mt-4 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background"
        >
          {common("retry")}
        </button>
      </section>
    );
  }

  const response = categoryQuery.data;
  if (response.status !== 200) {
    return (
      <section className="max-w-2xl rounded-lg border border-foreground/10 p-6">
        <h1 className="text-2xl font-semibold">{t("unavailable")}
        </h1>
        <p role="alert" className="mt-3 text-foreground/70">
          {responseMessage(response.data) ??
            t("apiLoadError", { status: response.status })}
        </p>
        <Link
          href="/dashboard/categories"
          className="mt-4 inline-block text-sm underline underline-offset-4"
        >
          {t("back")}
        </Link>
      </section>
    );
  }

  const category = response.data.data;
  const displayedName = name ?? category.name;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const data: UpdateCategoryRequest = { name: displayedName.trim() };
    updateCategory.mutate(
      { category: categoryId, data },
      {
        onSuccess: (updateResponse) => {
          if (updateResponse.status !== 200) {
            toast.error(
              responseMessage(updateResponse.data) ??
                t("updateError", { status: updateResponse.status }),
            );
            return;
          }

          toast.success(t("updateSuccess"));
          void queryClient.invalidateQueries({
            queryKey: getCategoriesIndexQueryKey(),
          });
          void queryClient.invalidateQueries({
            queryKey: getCategoriesShowQueryKey(categoryId),
          });
          router.push("/dashboard/categories");
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
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-sm text-foreground/60">{common("adminLabel")}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">{t("editTitle")}</h1>
          <Link
            href="/dashboard/categories"
            className="text-sm text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("back")}
          </Link>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-8 max-w-2xl rounded-lg border border-foreground/10 bg-foreground/[0.03] p-6"
      >
        <div>
          <label htmlFor="category-name" className="mb-2 block text-sm font-medium">
            {t("name")}
          </label>
          <input
            id="category-name"
            name="name"
            type="text"
            required
            minLength={3}
            maxLength={255}
            value={displayedName}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-foreground focus:border-foreground focus:outline-none"
          />
          <p className="mt-2 text-xs text-foreground/60">
            {t("slugCurrent", { slug: category.slug })}
          </p>
        </div>

        <button
          type="submit"
          disabled={
            updateCategory.isPending ||
            displayedName.trim().length < 3 ||
            displayedName.trim() === category.name
          }
          className="mt-6 rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {updateCategory.isPending ? t("pending") : t("save")}
        </button>
      </form>
    </div>
  );
}
