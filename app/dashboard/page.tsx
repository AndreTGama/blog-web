"use client";

import { getAuthUserQueryKey, useAuthUser } from "@/lib/api/generated";
import { clearAccessToken, useAccessToken } from "@/lib/auth/session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const accessToken = useAccessToken();
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
  const authResponse = userQuery.data;

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

  if (!accessToken || userQuery.isPending || authResponse?.status === 401) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-foreground/70">Verificando sua sessão...</p>
      </main>
    );
  }

  if (userQuery.isError) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <section className="w-full max-w-lg rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6">
          <h1 className="text-xl font-semibold">Não foi possível validar a sessão</h1>
          <p className="mt-2 text-foreground/70">
            {userQuery.error instanceof Error
              ? userQuery.error.message
              : "Ocorreu um erro ao consultar a API."}
          </p>
          <button
            type="button"
            onClick={() => void userQuery.refetch()}
            className="mt-5 rounded-md bg-foreground px-4 py-2 font-semibold text-background"
          >
            Tentar novamente
          </button>
        </section>
      </main>
    );
  }

  if (authResponse?.status !== 200) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6">
        <p className="text-foreground/70">
          A API não conseguiu validar sua sessão. Tente novamente mais tarde.
        </p>
      </main>
    );
  }

  const user = authResponse.data.data;

  return (
    <main className="min-h-screen bg-background p-6 text-foreground md:p-10">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-foreground/10 pb-6">
          <p className="text-sm text-foreground/60">Painel administrativo</p>
          <h1 className="mt-2 text-3xl font-semibold">Dashboard do blog</h1>
          <p className="mt-2 text-foreground/70">
            Olá, {user.name}. Você está conectado como {user.email}.
          </p>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {["Artigos", "Categorias", "Usuários"].map((section) => (
            <article
              key={section}
              className="rounded-lg border border-foreground/10 bg-foreground/[0.04] p-6"
            >
              <h2 className="text-lg font-semibold">{section}</h2>
              <p className="mt-2 text-sm text-foreground/60">
                A área de gerenciamento de {section.toLowerCase()} será criada aqui.
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
