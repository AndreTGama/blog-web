import ArticleDetail from "@/components/home/article-detail";

export default async function ArticlePage({
  params,
}: PageProps<"/[locale]/artigos/[slug]">) {
  const { slug } = await params;
  return <ArticleDetail slug={slug} />;
}
