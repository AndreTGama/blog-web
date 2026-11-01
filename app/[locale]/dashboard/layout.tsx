import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export const instant = false;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("dashboard");

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <p className="text-foreground/70">{t("loading")}</p>
        </main>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
