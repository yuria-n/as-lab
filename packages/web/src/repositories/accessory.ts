import { entities, libs, masters } from '@as-lab/core';

export class AccessoryRepository {
  static async getMasterAccessories() {
    return masters.accessories;
  }

  static async getMap() {
    return libs.getAccessoryMap();
  }

  static async get(
    type: entities.Accessory['type'],
    attribute: entities.Card.Attribute,
    rarity: entities.Card.Rarity,
  ): Promise<entities.Accessory> {
    return libs.getAccessory(type, attribute, rarity);
  }
}
