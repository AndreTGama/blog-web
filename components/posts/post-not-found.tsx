"use client";

export default function PostsNotFound({ onRetry }: { onRetry: () => void }) {

  return (
    <div className="rounded-2xl border border-foreground/10 bg-background p-8 text-center">
      <h2 className="text-lg font-semibold">
        Não foi possível carregar os artigos
      </h2>
      <p className="mt-2 text-sm text-foreground/65">
        Verifique se a API está disponível e tente novamente.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-full border border-foreground/20 px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5"
      >
        Tentar novamente
      </button>
    </div>
  );
}
