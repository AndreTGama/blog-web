import { Suspense } from "react";
import DashboardShell from "@/components/dashboard/dashboard-shell";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <p className="text-foreground/70">Carregando painel...</p>
        </main>
      }
    >
      <DashboardShell>{children}</DashboardShell>
    </Suspense>
  );
}
