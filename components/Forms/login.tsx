"use client";

import { useAuthLogin } from "@/lib/api/generated";
import { saveAccessToken } from "@/lib/auth/session";
import type { LoginRequest } from "@/lib/api/generated/models";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import Input from "../ui/input";
import ThemeToggle from "../ui/theme-toggle";

export default function Login() {
  const t = useTranslations("login");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const loginMutation = useAuthLogin({
    mutation: {
      onSuccess: (response) => {
        if (response.status !== 200) {
          toast.error(response.data.message || t("invalidCredentials"));
          return;
        }

        const result = response.data;
        if (
          typeof result === "string" ||
          !("data" in result) ||
          typeof result.data.access_token !== "string"
        ) {
          toast.error(t("invalidResponse"));
          return;
        }

        saveAccessToken(result.data.access_token);
        toast.success(t("success"));
        router.replace("/dashboard");
        router.refresh();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : t("connectionError"),
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
        <h1 className="text-2xl font-semibold text-foreground">{t("title")}</h1>
        <ThemeToggle />
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <Input
            type="email"
            id="email"
            label={t("email")}
            name="email"
            placeholder={t("emailPlaceholder")}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="mb-6">
          <Input
            type="password"
            id="password"
            label={t("password")}
            name="password"
            placeholder={t("passwordPlaceholder")}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full rounded-md bg-foreground px-4 py-2 font-semibold text-background transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? t("pending") : t("submit")}
        </button>
      </form>
    </>
  );
}
