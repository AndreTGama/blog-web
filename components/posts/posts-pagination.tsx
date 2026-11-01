type PostsPaginationProps = {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export default function PostsPagination({
  currentPage,
  pageCount,
  onPageChange,
}: PostsPaginationProps) {
  return (
    <nav
      aria-label="Paginação dos conteúdos"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Anterior
      </button>
      <span className="px-2 text-sm text-foreground/60">
        {currentPage} / {pageCount}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
        disabled={currentPage >= pageCount}
        className="rounded-full border border-foreground/15 px-4 py-2 text-sm transition-colors hover:bg-foreground/5 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Próxima
      </button>
    </nav>
  );
}
