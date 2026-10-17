"use client";

import { useAuthLogin } from "@/lib/api/generated";
import { saveAccessToken } from "@/lib/auth/session";
import type { LoginRequest } from "@/lib/api/generated/models";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import Input from "../ui/input";
import ThemeToggle from "../ui/theme-toggle";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useAuthLogin({
    mutation: {
      onSuccess: (response) => {
        if (response.status !== 200) {
          toast.error(response.data.message || "E-mail ou senha incorretos.");
          return;
        }

        const result = response.data;
        if (
          typeof result === "string" ||
          !("data" in result) ||
          typeof result.data.access_token !== "string"
        ) {
          toast.error("A API retornou uma resposta de login inválida.");
          return;
        }

        saveAccessToken(result.data.access_token);
        toast.success("Login realizado com sucesso!");
        router.replace("/dashboard");
        router.refresh();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Não foi possível conectar à API de autenticação.",
        );
      },
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const credentials: LoginRequest = { email, password };
    loginMutation.mutate({ data: credentials });
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Login</h1>
        <ThemeToggle />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Input
            type="email"
            id="email"
            label="E-mail"
            name="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="mb-6">
          <Input
            type="password"
            id="password"
            label="Senha"
            name="password"
            placeholder="Sua senha"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-md bg-foreground px-4 py-2 font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </>
  );
}
