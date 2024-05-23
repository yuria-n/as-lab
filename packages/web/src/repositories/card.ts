import axios from 'axios';
import { entities } from '@as-lab/core';

import { config } from '../config';

export class CardRepository {
  private static cards: entities.Card[];
  static async getCards(): Promise<entities.Card[]> {
    if (this.cards) {
      return this.cards;
    }
    const { data } = await axios.get(`${config.assets}/data/card.json?version=${config.version}`);
    this.cards = data;
    return this.cards;
  }
}
