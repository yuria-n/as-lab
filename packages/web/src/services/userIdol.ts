import { entities } from '@as-lab/core';

import { UserIdolRepository } from '../repositories';

export class UserIdolService {
  static async getUserIdols() {
    return UserIdolRepository.getUserIdols();
  }

  static async createUserIdol(userIdol: entities.UserIdol) {
    return UserIdolRepository.createUserIdol(userIdol);
  }

  static async updateUserIdol(userIdol: entities.UserIdol) {
    return UserIdolRepository.updateUserIdol(userIdol);
  }

  static async export() {
    return UserIdolRepository.export();
  }

  static async import(data: entities.StoredUserIdols) {
    return UserIdolRepository.import(data);
  }
}
