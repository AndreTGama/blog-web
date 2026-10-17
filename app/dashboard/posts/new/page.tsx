import CategoryPostForm from "@/components/dashboard/post-create-form";
import Link from "next/link";

export default function CreatePostPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <header className="border-b border-foreground/10 pb-6">
        <p className="text-sm text-foreground/60">Painel administrativo</p>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">Criar post</h1>
          <Link
            href="/dashboard/posts"
            className="text-sm text-foreground/70 underline-offset-4 hover:text-foreground hover:underline"
          >
            Voltar para posts
          </Link>
        </div>
        <p className="mt-2 text-foreground/70">
          Escreva o conteúdo e selecione pelo menos uma categoria.
        </p>
      </header>
      <CategoryPostForm />
    </div>
  );
}
