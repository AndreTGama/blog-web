import HeaderHero from "@/components/headers/header-hero";
import { HeaderArticleProps } from "@/types/Headers";

export default function HeaderArticle({
  eyebrow = "Artigos",
  title = "Artigos de tecnologia, arquitetura e padrões de projeto",
  description = "Artigos de tecnologia, arquitetura e padrões de projeto com exemplos práticos.",
  action,
}: HeaderArticleProps) {
  return (
    <HeaderHero
      eyebrow={eyebrow}
      title={title}
      description={description}
      backgroundImage="/img/horizontal.png"
      headerClassName="flex h-[22rem] items-center overflow-hidden bg-cover bg-center bg-no-repeat sm:h-[26rem]"
      contentClassName="mx-auto w-full max-w-7xl px-5 pt-18 sm:px-8"
      action={action}
    />
  );
}
