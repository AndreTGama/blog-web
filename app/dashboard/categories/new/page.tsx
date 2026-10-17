import Link from "next/link";
import CategoryCreateForm from "@/components/dashboard/category-create-form";

export default function CreateCategoryPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-sm text-foreground/60">Painel administrativo</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Criar categoria</h1>
          <Link
            href="/dashboard/categories"
            className="text-sm text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            Voltar para categorias
          </Link>
        </div>
        <p className="mt-2 text-foreground/70">
          Categorias agrupam posts por assunto. Elas funcionam como tags no
          sentido de classificação, mas podem ter hierarquia ou regras próprias
          conforme a API.
        </p>
      </header>
      <CategoryCreateForm />
    </div>
  );
}
