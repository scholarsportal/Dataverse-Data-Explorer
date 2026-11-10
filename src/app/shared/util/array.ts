// fast-xml-parser yields a bare object for single-element lists and nothing
// for empty ones. Normalize either shape to an array before iterating.
export function toArray<T>(value: T[] | T | undefined | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
