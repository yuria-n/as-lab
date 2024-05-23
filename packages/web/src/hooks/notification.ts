import { useCallback } from 'react';

import { QueryType, queryClient, useQuery } from './query';
import { useObject } from './object';

export class CustomError extends Error {
  constructor(message: string, readonly statusCode = 500) {
    super(message);
  }
}

export class BadRequestError extends CustomError {
  statusCode = 400;
}

interface Notification {
  message: string;
  statusCode: number;
}

let timer: number;
const delay = 10 * 1000;

export function useNotification() {
  const { data: notification } = useQuery(
    QueryType.Notification,
    () => queryClient.getQueryData(QueryType.Notification) as Notification | null,
  );
  const setNotification = useCallback((notification: Notification | null) => {
    queryClient.setQueryData(QueryType.Notification, notification);
  }, []);

  const onDismiss = useCallback(() => {
    setNotification(null);
  }, [setNotification]);

  const setMessage = useCallback(
    (message: string, statusCode = 200) => {
      setNotification({ message, statusCode });
      clearTimeout(timer);
      timer = window.setTimeout(onDismiss, delay);
    },
    [setNotification, onDismiss],
  );

  const setError = useCallback(
    (error: any) => {
      console.error(error);
      if (error.response) {
        const { data, statusText, status } = error.response;
        error = new CustomError(typeof data === 'string' ? data : statusText, status);
      } else {
        error = new CustomError(error.message || error);
      }
      setMessage(error.message, error.statusCode);
    },
    [setMessage],
  );
  return useObject({ notification, setMessage, setError, onDismiss });
}
