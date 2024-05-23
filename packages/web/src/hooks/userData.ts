import fileDownload from 'js-file-download';
import { entities } from '@as-lab/core';

import {
  UserAccessoryService,
  UserCardService,
  UserDeckService,
  UserFriendService,
  UserIdolService,
} from '../services';
import { useMutation } from './query';

interface StoredUserData {
  userAccessory: entities.StoredUserAccessories | null;
  userCard: entities.StoredUserCards | null;
  userDeck: entities.StoredUserDecks | null;
  userIdol: entities.StoredUserIdols | null;
  userFriend: entities.StoredUserFriends | null;
}

export function useUserData() {
  const { mutate: exportUserData } = useMutation(
    () =>
      Promise.all([
        UserAccessoryService.export(),
        UserCardService.export(),
        UserDeckService.export(),
        UserIdolService.export(),
        UserFriendService.export(),
      ]),
    {
      onSuccess: ([userAccessory, userCard, userDeck, userIdol, userFriend]) => {
        fileDownload(
          JSON.stringify({ userAccessory, userCard, userDeck, userIdol, userFriend }),
          `スクスタLabデータバックアップ_${Date.now()}.json`,
        );
      },
    },
  );

  const { mutate: importUserData } = useMutation(
    ({ userAccessory, userCard, userDeck, userIdol, userFriend }: StoredUserData) =>
      Promise.all([
        userAccessory !== null ? UserAccessoryService.import(userAccessory) : null,
        userCard !== null ? UserCardService.import(userCard) : null,
        userDeck !== null ? UserDeckService.import(userDeck) : null,
        userIdol !== null ? UserIdolService.import(userIdol) : null,
        userFriend !== null ? UserFriendService.import(userFriend) : null,
      ]),
    {
      successMessage: 'データのインポートが完了しました。ブラウザーを更新してください。',
    },
  );

  return {
    exportUserData,
    importUserData,
  };
}
