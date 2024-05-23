import { useMemo } from 'react';

export function useObject<T>(object: T): T {
  return useMemo(() => object, [Object.values(object)]); // eslint-disable-line react-hooks/exhaustive-deps
}
