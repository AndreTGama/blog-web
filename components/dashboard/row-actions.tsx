import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type RowActionsProps = {
  label: string;
  editHref: string;
  previewHref?: string;
  onDelete: () => void;
  deletePending: boolean;
  deleteLabel: string;
};

export default function RowActions({
  label,
  editHref,
  previewHref,
  onDelete,
  deletePending,
  deleteLabel,
}: RowActionsProps) {
  const t = useTranslations("postAdmin");

  return (
    <details className="group relative inline-block text-left">
      <summary
        aria-label={t("actionsFor", { label })}
        className="flex size-9 cursor-pointer list-none items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground [&::-webkit-details-marker]:hidden"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
        >
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </summary>

      <div className="absolute right-0 z-20 mt-1 min-w-36 overflow-hidden rounded-md border border-foreground/10 bg-background p-1 shadow-lg">
        <Link
          href={editHref}
          className="block rounded px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
        >
          {t("edit")}
        </Link>
        {previewHref && (
          <Link
            href={previewHref}
            target="_blank"
            rel="noreferrer"
            className="block rounded px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
          >
            {t("preview")}
          </Link>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={deletePending}
          className="block w-full rounded px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300"
        >
          {deleteLabel}
        </button>
      </div>
    </details>
  );
}
