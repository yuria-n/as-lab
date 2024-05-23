import { Accessory, AccessoryMap } from '../entities';
import { Card } from '../entities';
import { toMap } from '../utils';
import { masters } from '../data';

const masterAccessoryMap = toMap(masters.accessories, 'type');

export function getAccessory(type: Accessory['type'], attribute: Card.Attribute, rarity: Card.Rarity): Accessory {
  const accessory = masterAccessoryMap.get(type);
  if (!accessory) {
    throw new Error('Invalid type');
  }
  if (!accessory.attributes.includes(attribute)) {
    throw new Error('Invalid attribute');
  }
  if (!accessory.rarities.includes(rarity)) {
    throw new Error('Invalid rarity');
  }
  const id = [type, attribute, rarity].join('_');
  return {
    id,
    title: accessory.title,
    type,
    attribute,
    rarity,
    appeal: accessory.appeal,
    stamina: accessory.stamina,
    technique: accessory.technique,
    skillId: accessory.skillId,
    skillFields: accessory.skillFields,
    conditionFields: accessory.conditionFields,
  };
}

const accessoryMap: AccessoryMap = new Map();

export function getAccessoryMap(): AccessoryMap {
  if (accessoryMap.size !== 0) {
    return accessoryMap;
  }
  for (const { type, attributes, rarities } of masterAccessoryMap.values()) {
    for (const attribute of attributes) {
      for (const rarity of rarities) {
        const accessory = getAccessory(type, attribute, rarity);
        accessoryMap.set(accessory.id, accessory);
      }
    }
  }
  return accessoryMap;
}
