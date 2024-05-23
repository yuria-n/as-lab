import { DependencyList, ReactNode, useMemo } from 'react';

interface Step<T> {
  state: T;
  node: ReactNode;
}

export function useStep<T>(state: T, steps: Step<T>[], deps: DependencyList) {
  return useMemo(() => steps.find((step) => step.state === state)?.node ?? null, [state, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
}
