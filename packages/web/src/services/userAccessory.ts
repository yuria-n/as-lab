import { entities } from '@as-lab/core';

import { UserAccessoryRepository } from '../repositories';

export class UserAccessoryService {
  static async getUserAccessories() {
    return UserAccessoryRepository.getUserAccessories();
  }

  static async createUserAccessory(userAccessory: Omit<entities.UserAccessory, 'id'>) {
    return UserAccessoryRepository.createUserAccessory(userAccessory);
  }

  static async updateUserAccessory(userAccessory: entities.UserAccessory) {
    return UserAccessoryRepository.updateUserAccessory(userAccessory);
  }

  static async deleteUserAccessory(userAccessoryId: entities.UserAccessory['id']) {
    return UserAccessoryRepository.deleteUserAccessory(userAccessoryId);
  }

  static async export() {
    return UserAccessoryRepository.export();
  }

  static async import(data: entities.StoredUserAccessories) {
    return UserAccessoryRepository.import(data);
  }
}
