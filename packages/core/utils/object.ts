export function mapValues<T>(obj: T, iter: (value: any, key: string) => any): T {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, iter(value, key)])) as T;
}

export function isEqual<T>(prev: T, next: T, ignoreKeys: (keyof T)[] = []) {
  if (!prev) {
    return prev === next;
  }
  const ignoreKeySet = new Set<any>(ignoreKeys);
  const keySet = new Set([...Object.keys(prev), ...Object.keys(next)]);
  return Array.from(keySet).every((key) => ignoreKeySet.has(key) || prev[key] === next[key]);
}

export function makeEqual(ignoreKeys: string[]) {
  return (prev: any, next: any) => isEqual(prev, next, ignoreKeys);
}

export function isEmpty(obj: Record<string, any>) {
  return Object.keys(obj).length === 0;
}
