import { v4 as uuid } from 'uuid';

import { entities } from '@as-lab/core';

import { Analytics, LocalStorage, LogType, StorageKey } from '../clients';

export class UserFriendRepository {
  private static version = 1;

  static async getUserFriends(): Promise<entities.UserFriend[]> {
    return (await this.get())?.friends ?? [];
  }

  static async createUserFriend(userFriend: Omit<entities.UserFriend, 'id'>) {
    const id = uuid();
    Analytics.logEvent(LogType.UserFriendCreation, { id, name: userFriend.name, cardId: userFriend.card.id });
    const userFriends = await this.getUserFriends();
    return this.set([...userFriends, { ...userFriend, id }]);
  }

  static async updateUserFriend(userFriend: entities.UserFriend) {
    Analytics.logEvent(LogType.UserFriendUpdate, {
      id: userFriend.id,
      name: userFriend.name,
      cardId: userFriend.card.id,
    });
    const userFriends = await this.getUserFriends();
    return this.set(userFriends.map((prev) => (prev.id === userFriend.id ? userFriend : prev)));
  }

  static async deleteUserFriend(friendId: entities.UserFriend['id']) {
    Analytics.logEvent(LogType.UserCardDeletion, { id: friendId });
    const userFriends = await this.getUserFriends();
    return this.set([...userFriends.filter(({ id }) => id !== friendId)]);
  }

  static export() {
    return this.get();
  }

  static import(data: entities.StoredUserFriends) {
    return this.set(data.friends, data.version);
  }

  private static async get(): Promise<entities.StoredUserFriends | null> {
    return LocalStorage.get<entities.StoredUserFriends>(StorageKey.UserFriend) ?? null;
  }

  private static async set(userFriends: entities.UserFriend[], version = this.version) {
    LocalStorage.set(StorageKey.UserFriend, {
      version,
      friends: userFriends,
    });
    return userFriends;
  }
}
