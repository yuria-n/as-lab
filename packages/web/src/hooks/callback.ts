import { DependencyList, useMemo } from 'react';

export function useCallbacks<T, A1>(
  items: T[],
  factory: (item: T, index: number) => (arg1: A1) => void,
  deps: DependencyList,
): ((arg1: A1) => void)[];
export function useCallbacks<T, A1, A2>(
  items: T[],
  factory: (item: T, index: number) => (arg1: A1, arg2: A2) => void,
  deps: DependencyList,
): ((arg1: A1, arg2: A2) => void)[];
export function useCallbacks<T>(
  items: T[],
  factory: (item: T, index: number) => (...args: any[]) => void,
  deps: DependencyList,
) {
  return useMemo(() => items.map(factory), deps); // eslint-disable-line react-hooks/exhaustive-deps
}
