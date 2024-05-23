import { entities } from '@as-lab/core';

import { UserDeckRepository } from '../repositories';

export class UserDeckService {
  static async getUserDecks(): Promise<entities.UserDeck[]> {
    return UserDeckRepository.getUserDecks();
  }

  static async createUserDeck(userDeck: Omit<entities.UserDeck, 'id'>, copy: boolean) {
    return UserDeckRepository.createUserDeck(userDeck, copy);
  }

  static async updateUserDeck(userDeck: entities.UserDeck) {
    return UserDeckRepository.updateUserDeck(userDeck);
  }

  static async deleteUserDeck(deckId: entities.UserDeck['id']) {
    return UserDeckRepository.deleteUserDeck(deckId);
  }

  static async export() {
    return UserDeckRepository.export();
  }

  static async import(data: entities.StoredUserDecks) {
    return UserDeckRepository.import(data);
  }
}
