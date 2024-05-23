export function createSortIterator<T>(sortKey: keyof T, asc = true) {
  return (c1: T, c2: T) => {
    const v1 = c1[sortKey] ?? 0;
    const v2 = c2[sortKey] ?? 0;
    const n1 = Number(v1);
    const n2 = Number(v2);
    const comparison = !isNaN(n1) && !isNaN(n2) ? n1 - n2 : `${v2}`.localeCompare(`${v1}`);
    return comparison === 0 ? 0 : comparison < 0 === asc ? -1 : 1; // eslint-disable-line
  };
}
