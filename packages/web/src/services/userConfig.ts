import * as entities from '../entities';
import { UserConfigRepository } from '../repositories';

export class UserConfigService {
  static async getUserConfig() {
    return UserConfigRepository.getUserConfig();
  }

  static async updateUserConfig(userConfig: entities.UserConfig) {
    return UserConfigRepository.updateUserConfig(userConfig);
  }
}
