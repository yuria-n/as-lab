import { useCallback } from 'react';

import { useNotification } from './notification';
import { useObject } from './object';

export function useAsync() {
  const { setMessage, setError } = useNotification();
  const runAsync = useCallback(
    <T>(handler: (() => Promise<T>) | Promise<T>, successMessage?: string) => {
      const promise = typeof handler === 'function' ? handler() : handler;
      promise.then(() => successMessage && setMessage(successMessage)).catch(setError);
    },
    [setMessage, setError],
  );

  return useObject({ runAsync });
}
