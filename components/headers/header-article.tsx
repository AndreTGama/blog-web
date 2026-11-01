import HeaderHero from "@/components/headers/header-hero";
import { HeaderArticleProps } from "@/types/Headers";
import { useTranslations } from "next-intl";

export default function HeaderArticle({
  eyebrow,
  title,
  description,
  action,
}: HeaderArticleProps) {
  const t = useTranslations("archive");

  return (
    <HeaderHero
      eyebrow={eyebrow ?? t("eyebrow")}
      title={title ?? t("title")}
      description={description ?? t("description")}
      backgroundImage="/img/horizontal.png"
      headerClassName="flex h-[22rem] items-center overflow-hidden bg-cover bg-center bg-no-repeat sm:h-[26rem]"
      contentClassName="mx-auto w-full max-w-7xl px-5 pt-18 sm:px-8"
      action={action}
    />
  );
}
