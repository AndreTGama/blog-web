export function formatDate(dateValue: string | null | undefined) {
  if (!dateValue) return "Artigo";
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? "Artigo"
    : new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date);
}
