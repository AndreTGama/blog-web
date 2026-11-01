import CategoryEditForm from "@/components/dashboard/category-edit-form";

export default async function EditCategoryPage({
  params,
}: PageProps<"/[locale]/dashboard/categories/[id]/edit">) {
  const { id } = await params;
  return <CategoryEditForm categoryId={id} />;
}
