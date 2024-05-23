export function sum(array: number[]): number {
  return array.reduce((sum, num) => sum + num, 0);
}

export function shuffle<T>(array: T[]): T[] {
  const objects = array.map((value) => ({ value }));
  const weights = new Map(objects.map((obj) => [obj, Math.floor(Math.random() * array.length)]));
  return objects.sort((o1, o2) => weights.get(o1)! - weights.get(o2)!).map((obj) => obj.value);
}

export function sample<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function sampleWeight<T extends { rate: Rate }>(array: T[], sum = 1): T {
  let rand = (Math.random() * sum) / sum;
  return array.find((item) => {
    if (rand < item.rate) {
      return true;
    }
    rand -= item.rate;
    return false;
  })!;
}

export function findLastIndex<T>(array: T[], iter: (value: T, index: number) => boolean): number {
  let index = array.length;
  while (--index >= 0 && !iter(array[index], index)) {} // eslint-disable-line no-empty
  return index;
}

export function toMap<T, K extends keyof T>(array: T[], key: K): Map<T[K], T> {
  return new Map(array.map((item) => [item[key], item]));
}

export function compact<T>(array?: (T | null)[]): T[] {
  return (array?.filter((array) => array) as T[]) ?? [];
}

export function times<T>(times: number, iterator: (index: number) => T): T[] {
  return Array.from({ length: times }, (_, index) => iterator(index));
}

export function uniq<T>(array: T[]): T[] {
  return Array.from(new Set(array).values());
}

export function uniqBy<T>(array: T[], iterator: (value: T, index: number) => any): T[] {
  const map = new Map<any, T>();
  for (const [index, obj] of array.entries()) {
    const key = iterator(obj, index);
    if (map.has(key)) {
      continue;
    }
    map.set(key, obj);
  }
  return Array.from(map.values());
}

export function sortBy<T>(array: T[], iterator: (value: T, index: number) => any): T[] {
  const scores = array.map(iterator);
  return array
    .map((data, index) => ({ data, index, score: scores[index] }))
    .sort((d1, d2) => d1.score - d2.score || d1.index - d2.index)
    .map((d) => d.data);
}

export function groupBy<T1, T2>(array: T1[], iterator: (value: T1, index: number) => T2): Map<T2, T1[]> {
  const map = new Map<T2, T1[]>();
  for (const [index, value] of array.entries()) {
    const key = iterator(value, index);
    if (!map.has(key)) {
      map.set(key, []);
    }
    map.get(key)!.push(value);
  }
  return map;
}
