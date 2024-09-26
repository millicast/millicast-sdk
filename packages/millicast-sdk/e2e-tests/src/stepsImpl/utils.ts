export function objectHasValidKeys<K extends string>(
  dataTable: Record<string, string>,
  expectedKeys: readonly K[]
): dataTable is Pick<typeof dataTable, K> {
  const k = new Set<string>(expectedKeys);
  for (const key of Object.keys(dataTable)) {
    if (!k.has(key)) {
      return false;
    }
  }
  return true;
}
