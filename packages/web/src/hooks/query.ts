import {
  MutationFunction,
  QueryClient,
  QueryFunction,
  QueryKey,
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  useMutation as useQueryMutation,
  useQuery as useReactQuery,
} from 'react-query';
import { useCallback, useEffect } from 'react';

import { useNotification } from './notification';

export enum QueryType {
  Auth = 'auth',
  UserAccessory = 'userAccessory',
  PresetUserCard = 'presetUserCard',
  UserCard = 'userCard',
  UserCardMap = 'userCardMap',
  SyncUserCardMap = 'syncUserCardMap',
  UserData = 'userData',
  UserDeck = 'userDeck',
  UserFriend = 'userFriend',
  UserIdol = 'userIdol',
  UserConfig = 'userConfig',
  UserHistory = 'userHistory',
  Mobile = 'mobile',
  DeckSupportSimulationOptions = 'deckSupportSimulationOptions',
  DeckSupportSimulationHeaders = 'deckSupportSimulationHeaders',
  DeckSupportSimulationResult = 'deckSupportSimulationResult',
  Notification = 'notification',
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      suspense: true,
    },
  },
});

type QueryResult<TData, TError> = UseQueryResult<TData, TError> & { data: TData };

export function useQuery<TData, TError = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData>, 'initialData' | 'placeholderData'>,
): UseQueryResult<TData, TError>;
export function useQuery<TData, TError = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options: UseQueryOptions<TData, TError, TData>,
): QueryResult<TData, TError>;
export function useQuery<TData, TError = unknown>(
  queryKey: QueryKey,
  queryFn: QueryFunction<TData>,
  options?: UseQueryOptions<TData, TError, TData>,
): UseQueryResult<TData, TError> | QueryResult<TData, TError> {
  return useReactQuery(queryKey, queryFn, options);
}

export function useMutation<TData = unknown, TError = unknown, TVariables = void, TContext = unknown>(
  mutationFn: MutationFunction<TData, TVariables>,
  {
    successMessage,
    onSuccess,
    onError,
    ...options
  }: UseMutationOptions<TData, TError, TVariables, TContext> & { successMessage?: string } = {},
): UseMutationResult<TData, TError, TVariables, TContext> {
  const { setMessage, setError } = useNotification();
  return useQueryMutation(mutationFn, {
    ...options,
    onSuccess(...args) {
      successMessage && setMessage(successMessage);
      onSuccess?.(...args);
    },
    onError(error, ...args) {
      setError(error);
      onError?.(error, ...args);
    },
  });
}

export function useQuerySubscriber<T, R = T>(
  type: QueryType,
  subscribe: (subscriber: Subscriber<T>) => void,
  unsubscribe: (subscriber: Subscriber<T>) => void,
  updater?: (prev: R | undefined, data: T) => R,
) {
  const subscriber = useCallback(
    (value: T) => {
      queryClient.setQueryData(type, (prev: R | undefined) => (updater ? updater(prev, value) : (value as any)));
    },
    [type, updater],
  );
  useEffect(() => {
    subscribe(subscriber);
    return () => {
      unsubscribe(subscriber);
    };
  });
  return subscriber;
}
