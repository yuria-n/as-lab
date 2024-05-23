import { entities } from '@as-lab/core';

import { UserFriendService } from '../services';
import { QueryType, useQuery, useMutation, queryClient } from './query';

export function useUserFriend() {
  const { data: userFriends } = useQuery(QueryType.UserFriend, () => UserFriendService.getUserFriends(), {
    placeholderData: [],
  });

  const { mutate: createUserFriend } = useMutation(
    (userFriend: Omit<entities.UserFriend, 'id'>) => UserFriendService.createUserFriend(userFriend),
    {
      onSuccess: (userFriends) => {
        queryClient.setQueryData(QueryType.UserFriend, userFriends);
      },
    },
  );

  const { mutate: updateUserFriend } = useMutation(
    (userFriend: entities.UserFriend) => UserFriendService.updateUserFriend(userFriend),
    {
      onSuccess: (userFriends) => {
        queryClient.setQueryData(QueryType.UserFriend, userFriends);
      },
    },
  );

  const { mutate: deleteUserFriend } = useMutation(
    (userFriendId: entities.UserFriend['id']) => UserFriendService.deleteUserFriend(userFriendId),
    {
      onSuccess: (userFriends) => {
        queryClient.setQueryData(QueryType.UserFriend, userFriends);
      },
    },
  );

  const { mutate: exportUserFriend } = useMutation(() => UserFriendService.export());

  const { mutate: importUserFriend } = useMutation(
    (data: entities.StoredUserFriends) => UserFriendService.import(data),
    {
      onSuccess: (userFriends) => {
        queryClient.setQueryData(QueryType.UserFriend, userFriends);
      },
    },
  );

  return {
    userFriends,
    createUserFriend,
    updateUserFriend,
    deleteUserFriend,
    exportUserFriend,
    importUserFriend,
  };
}
