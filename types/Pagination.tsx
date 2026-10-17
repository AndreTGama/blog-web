export type PaginationProps = {
  currentPage: number;
  pageCount: number;
  scrollToPage: (page: number) => void;
};