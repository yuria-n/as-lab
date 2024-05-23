import { entities } from '@as-lab/core';

import { CardRepository } from '../repositories';

export class CardService {
  static async getCards(): Promise<entities.Card[]> {
    return CardRepository.getCards();
  }
}
