import { v4 as uuid } from 'uuid';

import { entities } from '@as-lab/core';

import { Analytics, LocalStorage, LogType, StorageKey } from '../clients';

export class UserAccessoryRepository {
  private static version = 1;

  static async getUserAccessories(): Promise<entities.UserAccessory[]> {
    return (await this.get())?.accessories ?? [];
  }

  static async createUserAccessory(userAccessory: Omit<entities.UserAccessory, 'id'>) {
    Analytics.logEvent(LogType.UserAccessoryCreation, { id: userAccessory.accessoryId });
    const userAccessories = await this.getUserAccessories();
    return this.set(
      [{ ...userAccessory, id: uuid() }, ...userAccessories].sort((a1, a2) =>
        a1.accessoryId.localeCompare(a2.accessoryId),
      ),
    );
  }

  static async updateUserAccessory(userAccessory: entities.UserAccessory) {
    Analytics.logEvent(LogType.UserAccessoryUpdate, { id: userAccessory.accessoryId });
    const userAccessories = await this.getUserAccessories();
    return this.set([userAccessory, ...userAccessories.filter(({ id }) => id !== userAccessory.id)]);
  }

  static async deleteUserAccessory(userAccessoryId: entities.UserAccessory['id']) {
    Analytics.logEvent(LogType.UserAccessoryDeletion, { id: userAccessoryId });
    const userAccessories = await this.getUserAccessories();
    return this.set(userAccessories.filter(({ id }) => id !== userAccessoryId));
  }

  static export() {
    return this.get();
  }

  static import(data: entities.StoredUserAccessories) {
    return this.set(data.accessories, data.version);
  }

  private static async get(): Promise<entities.StoredUserAccessories | null> {
    return LocalStorage.get<entities.StoredUserAccessories>(StorageKey.UserAccessory) ?? null;
  }

  private static async set(userAccessories: entities.UserAccessory[], version = this.version) {
    LocalStorage.set(StorageKey.UserAccessory, {
      version,
      accessories: userAccessories,
    });
    return userAccessories;
  }
}
