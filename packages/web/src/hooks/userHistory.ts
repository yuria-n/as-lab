import { entities } from '@as-lab/core';

import { QueryType, useMutation, useQuery } from './query';
import { UserHistoryService } from '../services';
import { useObject } from './object';

export function useUserHistory() {
  const { data: userHistory, refetch: refetchUserHistory } = useQuery(
    QueryType.UserHistory,
    () => UserHistoryService.getUserHistory(),
    {
      placeholderData: {
        selectedCards: [],
      },
    },
  );
  const { mutate: setSelectedCardId } = useMutation(async (id: entities.Card['id']) => {
    await UserHistoryService.setSelectedCardId(id);
    await refetchUserHistory();
  });
  return useObject({ userHistory, setSelectedCardId });
}
