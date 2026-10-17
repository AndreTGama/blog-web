import { Suspense } from "react";
import ArticleDetail from "@/components/home/article-detail";

async function ArticlePageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ArticleDetail id={id} />;
}

function ArticlePageLoading() {
  return (
    <main
      role="status"
      className="mx-auto min-h-[70vh] max-w-4xl animate-pulse space-y-5 px-5 py-16 sm:px-8"
    >
      <span className="block h-4 w-32 rounded bg-foreground/10" />
      <span className="block h-12 max-w-2xl rounded bg-foreground/10" />
      <span className="block aspect-[16/7] rounded-2xl bg-foreground/10" />
      <span className="sr-only">Carregando artigo...</span>
    </main>
  );
}

export default function ArticlePage(props: PageProps<"/artigos/[id]">) {
  return (
    <Suspense fallback={<ArticlePageLoading />}>
      <ArticlePageContent params={props.params} />
    </Suspense>
  );
}
