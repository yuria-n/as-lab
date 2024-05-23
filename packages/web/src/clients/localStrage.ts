import { entities } from '@as-lab/core';

export enum StorageKey {
  UserAccessory = 'userAccessory',
  UserCard = 'userCard',
  UserIdol = 'userIdol',
  UserDeck = 'userDeck',
  UserFriend = 'userFriend',
  MusicSimulatorOption = 'musicSimulatorOption',
  DeckSupportSimulatorOption = 'deckSupportSimulatorOption',
  UserConfig = 'userConfig',
  UserHistory = 'userHistory',
}

export class LocalStorage {
  static get<T extends entities.StoredData>(key: StorageKey): T | null {
    const str = localStorage.getItem(key);
    return str ? JSON.parse(str) : null;
  }

  static set<T extends entities.StoredData>(key: StorageKey, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
