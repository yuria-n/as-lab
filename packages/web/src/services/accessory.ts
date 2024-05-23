import { entities } from '@as-lab/core';

import { AccessoryRepository } from '../repositories';

export class AccessoryService {
  static async getMasterAccessories() {
    return AccessoryRepository.getMasterAccessories();
  }

  static async getMap() {
    return AccessoryRepository.getMap();
  }

  static async get(
    type: entities.Accessory['type'],
    attribute: entities.Card.Attribute,
    rarity: entities.Card.Rarity,
  ): Promise<entities.Accessory> {
    return AccessoryRepository.get(type, attribute, rarity);
  }
}
