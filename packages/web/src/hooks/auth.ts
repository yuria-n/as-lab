import { useCallback, useMemo } from 'react';

import { AuthService } from '../services/auth';
import { QueryType, useQuery, useQuerySubscriber } from './query';
import { useAsync } from './async';
import { useObject } from './object';

export function useAuth() {
  const { data: user } = useQuery(QueryType.Auth, () => AuthService.getCurrentUser(), { suspense: false });
  const loggedIn = useMemo(() => !!user, [user]);
  const { runAsync } = useAsync();
  useQuerySubscriber(QueryType.Auth, AuthService.subscribe, AuthService.unsubscribe);
  const login = useCallback(() => runAsync(() => AuthService.login()), [runAsync]);
  const logout = useCallback(() => runAsync(() => AuthService.logout()), [runAsync]);

  return useObject({ user, loggedIn, login, logout });
}
