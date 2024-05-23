import { entities, masters } from '@as-lab/core';

import { SyncUserCardMap, UserCardRepository } from '../repositories';

export class UserCardService {
  static async getUserCards(): Promise<entities.UserCard[]> {
    return UserCardRepository.getUserCards();
  }

  static async getPresetUserCards(): Promise<masters.PresetUserCards[]> {
    return UserCardRepository.getPresetUserCards();
  }

  static async createUserCard(userCard: entities.UserCard): Promise<void> {
    await UserCardRepository.createUserCard(userCard);
  }

  static async createUserCards(userCards: entities.UserCard[]): Promise<void> {
    await UserCardRepository.createUserCards(userCards);
  }

  static async updateUserCard(userCard: entities.UserCard): Promise<void> {
    await UserCardRepository.updateUserCard(userCard);
  }

  static async updateUserCards(userCards: entities.UserCard[]): Promise<void> {
    await UserCardRepository.updateUserCards(userCards);
  }

  static async deleteUserCard(cardId: entities.UserCard['id']): Promise<void> {
    await UserCardRepository.deleteUserCard(cardId);
  }

  static async deleteUserCards(cardIds: entities.UserCard['id'][]): Promise<void> {
    await UserCardRepository.deleteUserCards(cardIds);
  }

  static async fetchUserCardMap(uid: string): Promise<SyncUserCardMap> {
    return UserCardRepository.fetchUserCardMap(uid);
  }

  static async export() {
    return UserCardRepository.export();
  }

  static async import(data: entities.StoredUserCards) {
    return UserCardRepository.import(data);
  }

  static async copy(presetName: string) {
    return UserCardRepository.copy(presetName);
  }
}
