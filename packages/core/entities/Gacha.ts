import { Card } from './Card';

export interface Gacha {
  id: Id;
  hashKey: Value;
  title: Title;
  costs: Value[];
  bundles: GachaDetail['id'][];
  picks: Value[][];
}

export interface GachaDetail {
  id: Id;
  rarity: Card.Rarity;
  rate: Rate;
  featureIds: Id[];
  featureRates: Rate[];
  inheritances: GachaDetail['id'][];
  ids: Card['id'][];
}
