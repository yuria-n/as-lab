import { Card } from './Card';
import { StoredData } from './StoredData';
import { BaseSkill, UserSkill } from './BaseSkill';

export interface MasterAccessory extends UserSkill {
  type: Type;
  title: Title;
  attributes: Card.Attribute[];
  rarities: Card.Rarity[];
  appeal: Value;
  stamina: Value;
  technique: Value;
  skillId: BaseSkill['id'];
}

export interface Accessory extends UserSkill {
  id: Id;
  title: Title;
  type: Type;
  attribute: Card.Attribute;
  rarity: Card.Rarity;
  appeal: Value;
  stamina: Value;
  technique: Value;
  skillId: BaseSkill['id'];
}

export type AccessoryMap = Map<Accessory['id'], Accessory>;

export interface UserAccessory {
  id: Id;
  accessoryId: Accessory['id'];
  appeal: Value;
  stamina: Value;
  technique: Value;
  skillFields: UserSkill['skillFields'];
}

export interface StoredUserAccessories extends StoredData {
  version: Version;
  accessories: UserAccessory[];
}
