import { CategoryProps } from "./Category";

export type PostProps = {
  id: string;
  locale: "pt" | "en";
  translation_group_id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: string;
  views: number;
  cover_image: string | null;
  published_at: string | null;
  categories?: CategoryProps[];
  translations?: { locale: "pt" | "en"; slug: string }[];
};

export type PostCardProps = {
  post: PostProps;
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
};

export type PostsListProps = {
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  page: number;
  onPageChange: (page: number) => void;
  heading?: string;
  itemsPerPage?: number;
  showAllLink?: boolean;
};