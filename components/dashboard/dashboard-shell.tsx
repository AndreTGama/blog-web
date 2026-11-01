"use client";

import {
  getAuthUserQueryKey,
  useAuthLogout,
  useAuthUser,
} from "@/lib/api/generated";
import { clearAccessToken, useAccessToken } from "@/lib/auth/session";
import { useTranslations } from "next-intl";
import ThemeToggle from "@/components/ui/theme-toggle";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type DashboardShellProps = {
  children: React.ReactNode;
};

function LoadingScreen({ message }: { message: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p className="text-foreground/70">{message}</p>
    </main>
  );
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const t = useTranslations("dashboard");
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAccessToken();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<string[]>([]);
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const userQuery = useAuthUser({
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
    query: {
      enabled: Boolean(accessToken),
      queryKey: [...getAuthUserQueryKey(), accessToken],
      retry: false,
    },
  });
  const logoutMutation = useAuthLogout({
    fetch: accessToken
      ? { headers: { Authorization: `Bearer ${accessToken}` } }
      : undefined,
  });
  const authResponse = userQuery.data;
  const menuGroups = [
    {
      label: t("posts"),
      basePath: "/dashboard/posts",
      items: [
        { label: t("list"), href: "/dashboard/posts" },
        { label: t("create"), href: "/dashboard/posts/new" },
      ],
    },
    {
      label: t("categories"),
      basePath: "/dashboard/categories",
      items: [
        { label: t("list"), href: "/dashboard/categories" },
        { label: t("create"), href: "/dashboard/categories/new" },
      ],
    },
  ];

  useEffect(() => {
    if (!accessToken) {
      router.replace("/login");
      return;
    }

    if (authResponse?.status === 401) {
      clearAccessToken();
      router.replace("/login");
    }
  }, [accessToken, authResponse, router]);

  function toggleGroup(label: string) {
    const activeGroup = menuGroups.find((group) => group.label === label);
    const isActive = activeGroup
      ? pathname.startsWith(activeGroup.basePath)
      : false;

    if (isActive) {
      setCollapsedGroups((groups) =>
        groups.includes(label)
          ? groups.filter((group) => group !== label)
          : [...groups, label],
      );
      return;
    }

    setOpenGroups((groups) =>
      groups.includes(label)
        ? groups.filter((group) => group !== label)
        : [...groups, label],
    );
  }

  function handleLogout() {
    logoutMutation.mutate(undefined, {
      onSuccess: (response) => {
        if (response.status === 200 || response.status === 401) {
          clearAccessToken();
          toast.success(t("logoutSuccess"));
          router.replace("/login");
          router.refresh();
          return;
        }

        toast.error(t("logoutError"));
      },
      onError: () => {
        toast.error(t("logoutConnectionError"));
      },
    });
  }

  if (!accessToken || userQuery.isPending || authResponse?.status === 401) {
    return <LoadingScreen message={t("verifying")} />;
  }

  if (userQuery.isError || authResponse?.status !== 200) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
        <section className="w-full max-w-lg rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6">
          <h1 className="text-xl font-semibold">
            {t("sessionError")}
          </h1>
          <p className="mt-2 text-foreground/70">
            {userQuery.error instanceof Error
              ? userQuery.error.message
              : t("sessionApiError")}
          </p>
          <button
            type="button"
            onClick={() => void userQuery.refetch()}
            className="mt-5 rounded-md bg-foreground px-4 py-2 font-semibold text-background"
          >
            {t("retry")}
          </button>
        </section>
      </main>
    );
  }

  const user = authResponse.data.data;

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label={t("closeMenu")}
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-foreground/10 bg-background transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-foreground/10 px-6 py-5">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight"
            onClick={() => setMobileMenuOpen(false)}
          >
            {t("brand")}
          </Link>
          <p className="mt-1 truncate text-sm text-foreground/60">
            {user.name}
          </p>
        </div>

        <nav aria-label={t("navigation")} className="flex-1 space-y-2 overflow-y-auto p-4">
          <Link
            href="/dashboard"
            aria-current={pathname === "/dashboard" ? "page" : undefined}
            onClick={() => setMobileMenuOpen(false)}
            className={`block rounded-md px-3 py-2 text-sm transition-colors ${
              pathname === "/dashboard"
                ? "bg-foreground text-background"
                : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
            }`}
          >
            {t("overview")}
          </Link>

          {menuGroups.map((group) => {
            const groupActive = pathname.startsWith(group.basePath);
            const expanded = groupActive
              ? !collapsedGroups.includes(group.label)
              : openGroups.includes(group.label);
            const submenuId = `submenu-${group.label.toLowerCase()}`;

            return (
              <section key={group.label}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={submenuId}
                  onClick={() => toggleGroup(group.label)}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                    groupActive
                      ? "text-foreground"
                      : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground"
                  }`}
                >
                  {group.label}
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                  >
                    <path
                      d="m5 7.5 5 5 5-5"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                {expanded && (
                  <ul id={submenuId} className="mt-1 space-y-1 pl-3">
                    {group.items.map((item) => {
                      const active = pathname === item.href;

                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`block rounded-md border-l-2 px-3 py-2 text-sm transition-colors ${
                              active
                                ? "border-foreground bg-foreground/5 font-medium text-foreground"
                                : "border-transparent text-foreground/60 hover:text-foreground"
                            }`}
                          >
                            {item.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            );
          })}
        </nav>

        <div className="space-y-4 border-t border-foreground/10 p-4">
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm text-foreground/75 transition-colors hover:bg-foreground/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-4"
            >
              <path
                d="M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.7"
              />
            </svg>
            {logoutMutation.isPending ? t("loggingOut") : t("logout")}
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="flex h-14 items-center border-b border-foreground/10 px-4 md:hidden">
          <button
            type="button"
            aria-label={t("openMenu")}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(true)}
            className="rounded-md p-2 hover:bg-foreground/5"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              className="size-5"
            >
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="1.8"
              />
            </svg>
          </button>
          <span className="ml-3 font-medium">{t("brand")}</span>
        </header>
        <main className="min-h-[calc(100vh-3.5rem)] p-6 md:min-h-screen md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
