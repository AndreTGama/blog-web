import PostEditForm from "@/components/dashboard/post-edit-form";

export default async function EditPostPage({
  params,
}: PageProps<"/[locale]/dashboard/posts/[id]/edit">) {
  const { id } = await params;
  return <PostEditForm postId={id} />;
}
