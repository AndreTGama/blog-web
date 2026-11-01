import CategoryPostForm from "@/components/dashboard/post-create-form";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function CreatePostPage({
  params,
  searchParams,
}: PageProps<"/[locale]/dashboard/posts/new">) {
  const [{ locale }, { translation_group_id: translationGroupId }] =
    await Promise.all([params, searchParams]);
  const t = await getTranslations("postForm");
  const common = await getTranslations("dashboard");

  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-sm text-foreground/60">{common("adminLabel")}</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">{t("createTitle")}</h1>
          <Link
            href="/dashboard/posts"
            className="text-sm text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            {t("back")}
          </Link>
        </div>
        <p className="mt-2 text-foreground/70">
          {t("description")}
        </p>
      </header>
      <CategoryPostForm
        initialLocale={locale === "en" ? "en" : "pt"}
        translationGroupId={
          typeof translationGroupId === "string"
            ? translationGroupId
            : undefined
        }
      />
    </div>
  );
}
