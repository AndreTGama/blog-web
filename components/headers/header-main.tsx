import HeaderHero from "@/components/headers/header-hero";
import { HeaderMainProps } from "@/types/Headers";
import { useTranslations } from "next-intl";

export default function HeaderMain({
  eyebrow,
  title,
  description,
  action,
}: HeaderMainProps) {
  const t = useTranslations("home");

  return (
    <HeaderHero
      eyebrow={eyebrow ?? t("eyebrow")}
      title={title ?? t("title")}
      description={description ?? t("description")}
      backgroundImage="/img/background.png"
      headerClassName="h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      contentClassName="mx-auto max-w-7xl px-5 py-50"
      action={action ?? { label: t("action"), href: "#conteudos" }}
    />
  );
}
