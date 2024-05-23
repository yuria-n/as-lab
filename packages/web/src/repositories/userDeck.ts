import { v4 as uuid } from 'uuid';

import { entities } from '@as-lab/core';

import { Analytics, LocalStorage, LogType, StorageKey } from '../clients';

export class UserDeckRepository {
  private static version = 1;

  static async getUserDecks(): Promise<entities.UserDeck[]> {
    return (await this.get())?.decks ?? [];
  }

  static async createUserDeck(userDeck: Omit<entities.UserDeck, 'id'>, copy: boolean) {
    Analytics.logEvent(LogType.UserDeckCreation, { title: userDeck.title, copy });
    const userDecks = await this.getUserDecks();
    return this.set([...userDecks, { ...userDeck, id: uuid() }]);
  }

  static async updateUserDeck(userDeck: entities.UserDeck) {
    Analytics.logEvent(LogType.UserDeckUpdate, { title: userDeck.title });
    const userDecks = await this.getUserDecks();
    return this.set(userDecks.map((prev) => (prev.id === userDeck.id ? userDeck : prev)));
  }

  static async deleteUserDeck(deckId: entities.UserDeck['id']) {
    Analytics.logEvent(LogType.UserCardDeletion, { id: deckId });
    const userDecks = await this.getUserDecks();
    return this.set([...userDecks.filter(({ id }) => id !== deckId)]);
  }

  static export() {
    return this.get();
  }

  static import(data: entities.StoredUserDecks) {
    return this.set(data.decks, data.version);
  }

  private static async get(): Promise<entities.StoredUserDecks | null> {
    return LocalStorage.get<entities.StoredUserDecks>(StorageKey.UserDeck) ?? null;
  }

  private static async set(userDecks: entities.UserDeck[], version = this.version) {
    LocalStorage.set(StorageKey.UserDeck, {
      version,
      decks: userDecks,
    });
    return userDecks;
  }
}
