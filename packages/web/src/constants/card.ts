import { entities } from '@as-lab/core';

import { toParamOptions } from '../utils';

export const attributeTextMap: Record<entities.Card.Attribute, string> = {
  [entities.Card.Attribute.None]: '無属性',
  [entities.Card.Attribute.Smile]: 'スマイル',
  [entities.Card.Attribute.Pure]: 'ピュア',
  [entities.Card.Attribute.Cool]: 'クール',
  [entities.Card.Attribute.Active]: 'アクティブ',
  [entities.Card.Attribute.Natural]: 'ナチュラル',
  [entities.Card.Attribute.Elegant]: 'エレガント',
};

export const typeTextMap: Record<entities.Card.Type, string> = {
  [entities.Card.Type.Vo]: 'ボルテージ',
  [entities.Card.Type.Sp]: 'SP',
  [entities.Card.Type.Gd]: 'ガード',
  [entities.Card.Type.Sk]: 'スキル',
};

export const cardTypeOptions = toParamOptions<entities.Card.Type>(Object.values(entities.Card.Type), typeTextMap);

export const personalSkillLabels = ['個性1', '個性2'];
export const inspirationSkillLabels = ['ひらめきスキル1', 'ひらめきスキル2', 'ひらめきスキル3', 'ひらめきスキル4'];
