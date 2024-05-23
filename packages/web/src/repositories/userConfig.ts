import * as entities from '../entities';
import { Analytics, LocalStorage, LogType, StorageKey } from '../clients';

const defaultUserConfig = {
  mobileView: true,
};

export class UserConfigRepository {
  private static version = 1;

  static async getUserConfig(): Promise<entities.UserConfig> {
    return (await this.get())?.userConfig ?? defaultUserConfig;
  }

  static async updateUserConfig(userConfig: entities.UserConfig) {
    const { userAgent } = window.navigator;
    const { mobileView } = userConfig;
    Analytics.logEvent(LogType.SwitchMobileView, { userAgent, mobileView });
    return this.set(userConfig);
  }

  private static async get(): Promise<entities.StoredUserConfig | null> {
    return LocalStorage.get<entities.StoredUserConfig>(StorageKey.UserConfig) ?? null;
  }

  private static async set(userConfig: entities.UserConfig, version = this.version) {
    LocalStorage.set(StorageKey.UserConfig, {
      version,
      userConfig,
    });
  }
}
