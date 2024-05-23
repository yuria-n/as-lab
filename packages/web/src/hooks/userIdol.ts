import { entities } from '@as-lab/core';

import { UserIdolService } from '../services';
import { useQuery, QueryType, useMutation, queryClient } from './query';

export function useUserIdol() {
  const { data: userIdols } = useQuery(QueryType.UserIdol, () => UserIdolService.getUserIdols(), {
    placeholderData: [],
  });

  const { mutate: createUserIdol } = useMutation(
    (userIdol: entities.UserIdol) => UserIdolService.createUserIdol(userIdol),
    {
      onSuccess: (userIdols) => {
        queryClient.setQueryData(QueryType.UserIdol, userIdols);
      },
    },
  );

  const { mutate: updateUserIdol } = useMutation(
    (userIdol: entities.UserIdol) => UserIdolService.updateUserIdol(userIdol),
    {
      onSuccess: (userIdols) => {
        queryClient.setQueryData(QueryType.UserIdol, userIdols);
      },
    },
  );

  const { mutate: exportUserIdols } = useMutation(() => UserIdolService.export());

  const { mutate: importUserIdols } = useMutation((data: entities.StoredUserIdols) => UserIdolService.import(data), {
    onSuccess: (userIdols) => {
      queryClient.setQueryData(QueryType.UserIdol, userIdols);
    },
  });

  return {
    userIdols,
    createUserIdol,
    updateUserIdol,
    exportUserIdols,
    importUserIdols,
  };
}
