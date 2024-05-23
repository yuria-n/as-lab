import { entities } from '@as-lab/core';

import { Analytics, LocalStorage, LogType, StorageKey } from '../clients';

export class UserIdolRepository {
  private static version = 1;

  static async getUserIdols(): Promise<entities.UserIdol[]> {
    return (await this.get())?.idols ?? [];
  }

  static async createUserIdol(userIdol: entities.UserIdol) {
    Analytics.logEvent(LogType.UserIdolCreation, { id: userIdol.id });
    const userIdols = await this.getUserIdols();
    return this.set([userIdol, ...userIdols].sort((a1, a2) => a1.id.localeCompare(a2.id)));
  }

  static async updateUserIdol(userIdol: entities.UserIdol) {
    Analytics.logEvent(LogType.UserIdolUpdate, { id: userIdol.id });
    const userIdols = await this.getUserIdols();
    return this.set([userIdol, ...userIdols.filter(({ id }) => id !== userIdol.id)]);
  }

  static export() {
    return this.get();
  }

  static import(data: entities.StoredUserIdols) {
    return this.set(data.idols, data.version);
  }

  private static async get(): Promise<entities.StoredUserIdols | null> {
    return LocalStorage.get<entities.StoredUserIdols>(StorageKey.UserIdol) ?? null;
  }

  private static async set(userIdols: entities.UserIdol[], version = this.version) {
    LocalStorage.set(StorageKey.UserIdol, {
      version,
      idols: userIdols,
    });
    return userIdols;
  }
}
