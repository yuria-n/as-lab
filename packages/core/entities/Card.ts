import { Idol } from './Idol';
import { InspirationSkill } from './InspirationSkill';
import { StoredData } from './StoredData';
import { CardSkill, UserSkill } from './BaseSkill';

export interface Card {
  id: Id;
  idolId: Idol['id'];
  name: Title;
  evolutionName: Title;
  rarity: Card.Rarity;
  type: Card.Type;
  attribute: Card.Attribute;
  appeal: Value;
  technique: Value;
  stamina: Value;
  skill: CardSkill & { title: string };
  personalSkills: CardSkill[];
}

export interface UserCard {
  id: Card['id'];
  appeal: Value;
  technique: Value;
  stamina: Value;
  skill: UserSkill;
  personalSkills: UserSkill[];
  inspirationSkillIds: InspirationSkill['id'][];
  updatedAt?: Timestamp;
}

export type FriendCard = Pick<UserCard, 'id' | 'personalSkills' | 'inspirationSkillIds'>;

export interface UserFriend {
  id: Id;
  name: Name;
  card: FriendCard;
}

export interface StoredUserCards extends StoredData {
  version: Version;
  cards: UserCard[];
}

export interface StoredUserFriends extends StoredData {
  version: Version;
  friends: UserFriend[];
}

export namespace Card {
  export enum Rarity {
    R = 'R',
    Sr = 'SR',
    Ur = 'UR',
  }

  export enum Type {
    Vo = 'voltage',
    Sp = 'sp',
    Gd = 'guard',
    Sk = 'skill',
  }

  export enum Attribute {
    None = 'none',
    Smile = 'smile',
    Pure = 'pure',
    Cool = 'cool',
    Active = 'active',
    Natural = 'natural',
    Elegant = 'elegant',
  }
}
