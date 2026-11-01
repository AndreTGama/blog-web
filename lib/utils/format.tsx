export function formatDate(
  dateValue: string | null | undefined,
  locale = "pt-BR",
) {
  if (!dateValue) return null;
  const date = new Date(dateValue);
  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(date);
}
