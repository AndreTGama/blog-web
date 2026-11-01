import HeaderHero from "@/components/headers/header-hero";
import { HeaderMainProps } from "@/types/Headers";

export default function HeaderMain({
  eyebrow = "Engenharia de software, sem atalhos",
  title = "Ideias, padrões e código para construir melhor.",
  description = "Conteúdos sobre arquitetura, padrões de projeto e desenvolvimento, com exemplos práticos para levar da leitura ao código.",
  action = { label: "Explorar conteúdos", href: "#conteudos" },
}: HeaderMainProps) {
  return (
    <HeaderHero
      eyebrow={eyebrow}
      title={title}
      description={description}
      backgroundImage="/img/background.png"
      headerClassName="h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      contentClassName="mx-auto max-w-7xl px-5 py-50"
      action={action}
    />
  );
}
