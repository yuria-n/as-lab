import { entities, utils } from '@as-lab/core';

import { QueryType, queryClient, useMutation, useQuery } from './query';
import { UserCardService } from '../services';
import { useObject } from './object';

export type UserCardMap = Map<entities.UserCard['id'], entities.UserCard>;

export function useUserCard() {
  const { data: userCards, refetch: refetchUserCards } = useQuery(
    QueryType.UserCard,
    () => UserCardService.getUserCards(),
    {
      placeholderData: [],
    },
  );

  const { data: presetUserCards } = useQuery(QueryType.PresetUserCard, () => UserCardService.getPresetUserCards(), {
    placeholderData: [],
  });

  const { data: userCardMap } = useQuery(
    QueryType.UserCardMap,
    async () => utils.toMap(await UserCardService.getUserCards(), 'id'),
    {
      placeholderData: new Map<string, entities.UserCard>(),
    },
  );

  const { mutate: createUserCard } = useMutation(async (userCard: entities.UserCard) => {
    await UserCardService.createUserCard(userCard);
    await refetchUserCards();
  });

  const { mutate: createUserCards } = useMutation(async (userCards: entities.UserCard[]) => {
    await UserCardService.createUserCards(userCards);
    await refetchUserCards();
  });

  const { mutate: updateUserCard } = useMutation(async (userCard: entities.UserCard) => {
    await UserCardService.updateUserCard(userCard);
    await refetchUserCards();
  });

  const { mutate: updateUserCards } = useMutation(async (userCards: entities.UserCard[]) => {
    await UserCardService.updateUserCards(userCards);
    await refetchUserCards();
  });

  const { mutate: deleteUserCard } = useMutation(async (cardId: entities.UserCard['id']) => {
    await UserCardService.deleteUserCard(cardId);
    await refetchUserCards();
  });

  const { mutate: deleteUserCards } = useMutation(async (cardIds: entities.UserCard['id'][]) => {
    await UserCardService.deleteUserCards(cardIds);
    await refetchUserCards();
  });

  const { mutate: exportUserCards } = useMutation(() => UserCardService.export());

  const { mutate: importUserCards } = useMutation(async (data: entities.StoredUserCards) => {
    await UserCardService.import(data);
    await refetchUserCards();
  });

  const { mutate: copyCards } = useMutation((presetName: string) => UserCardService.copy(presetName), {
    successMessage: 'コピーしました。',
    onSuccess: (userCards) => {
      queryClient.setQueryData(QueryType.UserCard, userCards);
    },
  });

  return useObject({
    userCards,
    userCardMap,
    presetUserCards,
    createUserCard,
    createUserCards,
    updateUserCard,
    updateUserCards,
    deleteUserCard,
    deleteUserCards,
    exportUserCards,
    importUserCards,
    copyCards,
  });
}
