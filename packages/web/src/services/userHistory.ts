import { entities } from '@as-lab/core';

import { UserHistoryRepository } from '../repositories';

export class UserHistoryService {
  static async getUserHistory() {
    return UserHistoryRepository.getUserHistory();
  }

  static async setSelectedCardId(id: entities.Card['id']) {
    return UserHistoryRepository.setSelectedCardId(id);
  }
}
