export function readItems<T>(
  items: unknown,
  parseItem: (item: unknown) => T | null,
): T[] | null {
  if (!Array.isArray(items)) return null;

  const result: T[] = [];
  for (const item of items) {
    const parsed = parseItem(item);
    if (parsed === null) return null;
    result.push(parsed);
  }

  return result;
}