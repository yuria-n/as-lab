import { entities } from '@as-lab/core';

import { UserDeckService } from '../services';
import { queryClient, QueryType, useMutation, useQuery } from './query';

export function useUserDeck() {
  const { data: userDecks } = useQuery(QueryType.UserDeck, () => UserDeckService.getUserDecks(), {
    placeholderData: [],
  });

  const { mutate: createUserDeck } = useMutation(
    ({ userDeck, copy = false }: { userDeck: Omit<entities.UserDeck, 'id'>; copy?: boolean }) =>
      UserDeckService.createUserDeck(userDeck, copy),
    {
      successMessage: '編成を作成しました。',
      onSuccess: (userDecks) => {
        queryClient.setQueryData(QueryType.UserDeck, userDecks);
      },
    },
  );

  const { mutate: updateUserDeck } = useMutation(
    (userDeck: entities.UserDeck) => UserDeckService.updateUserDeck(userDeck),
    {
      successMessage: '編成を更新しました。',
      onSuccess: (userDecks) => {
        queryClient.setQueryData(QueryType.UserDeck, userDecks);
      },
    },
  );

  const { mutate: deleteUserDeck } = useMutation(
    (deckId: entities.UserDeck['id']) => UserDeckService.deleteUserDeck(deckId),
    {
      successMessage: '編成を削除しました。',
      onSuccess: (userDecks) => {
        queryClient.setQueryData(QueryType.UserDeck, userDecks);
      },
    },
  );

  const { mutate: exportUserDecks } = useMutation(() => UserDeckService.export());

  const { mutate: importUserDecks } = useMutation((data: entities.StoredUserDecks) => UserDeckService.import(data), {
    onSuccess: (userDecks) => {
      queryClient.setQueryData(QueryType.UserDeck, userDecks);
    },
  });

  return {
    userDecks,
    createUserDeck,
    updateUserDeck,
    deleteUserDeck,
    exportUserDecks,
    importUserDecks,
  };
}
