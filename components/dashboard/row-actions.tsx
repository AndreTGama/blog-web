"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen || !triggerRef.current || !menuRef.current) return;

    function updatePosition() {
      const trigger = triggerRef.current;
      const menu = menuRef.current;
      if (!trigger || !menu) return;

      const triggerRect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const opensAbove =
        window.innerHeight - triggerRect.bottom < menuRect.height + 8 &&
        triggerRect.top > menuRect.height + 8;
      const left = Math.max(
        8,
        Math.min(
          triggerRect.right - menuRect.width,
          window.innerWidth - menuRect.width - 8,
        ),
      );

      setMenuPosition({
        top: opensAbove
          ? triggerRect.top - menuRect.height - 4
          : triggerRect.bottom + 4,
        left,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (
        target instanceof Node &&
        !triggerRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={t("actionsFor", { label })}
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => {
          if (menuOpen) {
            setMenuOpen(false);
          } else {
            setMenuPosition(null);
            setMenuOpen(true);
          }
        }}
        className="flex size-9 cursor-pointer items-center justify-center rounded-md text-foreground/70 transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
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
      </button>
      {menuOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              top: menuPosition?.top ?? 0,
              left: menuPosition?.left ?? 0,
              visibility: menuPosition ? "visible" : "hidden",
            }}
            className="z-[100] min-w-36 overflow-hidden rounded-md border border-foreground/10 bg-background p-1 text-foreground shadow-lg"
          >
            <Link
              href={editHref}
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="block rounded px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
            >
              {t("edit")}
            </Link>
            {previewHref && (
              <Link
                href={previewHref}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="block rounded px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
              >
                {t("preview")}
              </Link>
            )}
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onDelete();
              }}
              disabled={deletePending}
              className="block w-full rounded px-3 py-2 text-left text-sm text-red-700 transition-colors hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-300"
            >
              {deleteLabel}
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
