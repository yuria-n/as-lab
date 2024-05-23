import * as assert from 'assert';
import * as gulp from 'gulp';

import {
  Card,
  Condition,
  Grade,
  Idol,
  InspirationSkill,
  KizunaSkill,
  MasterAccessory,
  MasterSkill,
  School,
  SkillEffect,
} from '../../../entities';
import { conditions, idols } from '../../../data/masters';
import { getSkillMap } from '../../../lib';
import {
  parseArray,
  parseFields,
  parseNumber,
  parseTsv,
  pascalCase,
  registerTsv,
  reverseMap,
  validate,
  validateObject,
  validateSkill,
  writeEntity,
  writeJSON,
  writeTypeScript,
} from './common';
import { toMap } from '../../../utils';

enum Tsv {
  Idol = 'スクスタシミュレータ - アイドル一覧.tsv',
  Card = 'スクスタシミュレータ - カード一覧.tsv',
  Skill = 'スクスタシミュレータ - スキル一覧.tsv',
  Target = 'スクスタシミュレータ - ターゲット一覧.tsv',
  Condition = 'スクスタシミュレータ - コンディション一覧.tsv',
  InspirationSkill = 'スクスタシミュレータ - ひらめきスキル一覧.tsv',
  Accessory = 'スクスタシミュレータ - アクセサリー一覧.tsv',
  Kizuna = 'スクスタシミュレータ - キズナボード一覧.tsv',
}

registerTsv(Tsv);

gulp.task('tsv:idols', async () => {
  const schoolMap = reverseMap(School);
  const items: Idol[] = parseTsv(Tsv.Idol).map((item) => {
    validateObject(schoolMap, item, 'school');
    validateObject(Grade, item, 'grade');
    return {
      id: item.id,
      name: item.name,
      school: item.school,
      grade: parseNumber(item.grade),
    };
  });

  const name = 'idol';
  writeJSON(name, items);

  const script = `
    import { Idol } from '../../entities';
    import * as json from '../json/${name}.json';

    export const idols: Idol[] = json as Idol[];
  `;
  writeTypeScript(name, script);

  const entity = `
    import { StoredData } from './StoredData';
    import { CardSkill, UserSkill } from './BaseSkill';

    export interface Idol {
      id: IdolId;
      name: Name;
      school: School;
      grade: Grade;
    }

    export enum School {
      Muse = 'muse',
      Aqua = 'aqua',
      Niji = 'niji',
    }

    export enum Grade {
      First = 1,
      Second,
      Third,
    }

    export interface KizunaSkill extends CardSkill {
      id: Id;
      title: Title;
      color: string;
    }
    
    export interface UserKizunaSkill {
      id: Id;
      skillFields: UserSkill['skillFields'];
    }

    export interface UserIdol {
      id: Idol['id'];
      kizunaSkills: UserKizunaSkill[];
    }

    export interface StoredUserIdols extends StoredData {
      version: Version;
      idols: UserIdol[];
    }

    export enum IdolId {
      ${items.map(({ id }) => `${pascalCase(id)} = '${id}',`).join('\n')}
    }
  `;
  writeEntity(name, entity);
});

gulp.task('tsv:cards', async () => {
  const typeMap = reverseMap(Card.Type);
  const attributeMap = reverseMap(Card.Attribute);
  const skillMap = getSkillMap();
  const conditionMap = toMap(conditions, 'type');
  const idolMap = Object.fromEntries(idols.map((idol) => [idol.id, idol]));
  const items: (Card | null)[] = parseTsv(Tsv.Card).map((item) => {
    try {
      item.personalSkillIds = parseArray(item.personalSkillIds);
      item.skillFields = parseArray(item.skillFields);
      item.conditionFields = parseArray(item.conditionFields);
      const skillFields = [parseArray(item.skillFields1), parseArray(item.skillFields2)];
      const conditionFields = [parseArray(item.conditionFields1), parseArray(item.conditionFields2)];
      validateObject(idolMap, item, 'idolId');
      validateObject(typeMap, item, 'type');
      validateObject(attributeMap, item, 'attribute');
      return {
        id: item.id,
        idolId: item.idolId,
        name: item.name,
        evolutionName: item.evolutionName,
        rarity: item.rarity as Card.Rarity,
        type: item.type as Card.Type,
        attribute: item.attribute as Card.Attribute,
        appeal: parseNumber(item.appeal),
        stamina: parseNumber(item.stamina),
        technique: parseNumber(item.technique),
        skill: item.skillId
          ? validateSkill(skillMap, conditionMap, {
              skillId: item.skillId,
              title: item.skillTitle,
              skillFields: item.skillFields,
              conditionFields: item.conditionFields,
            })
          : {
              skillId: '',
              title: '',
              skillFields: [],
              conditionFields: [],
            },
        personalSkills: item.personalSkillIds.map((skillId, index) =>
          validateSkill(skillMap, conditionMap, {
            skillId,
            skillFields: skillFields[index],
            conditionFields: conditionFields[index],
          }),
        ),
      };
    } catch (err) {
      console.error(`validation failed. id: ${item.id}`, err);
      return null;
    }
  });
  assert.ok(
    items.every((item) => item !== null),
    'Validation failed',
  );

  const name = 'card';
  writeJSON(name, items);

  const script = `
    import { Card } from '../../entities';
    import * as json from '../json/${name}.json';

    export const cards: Card[] = json as Card[];
  `;
  writeTypeScript(name, script);
});

gulp.task('tsv:conditions', async () => {
  const tsv = parseTsv(Tsv.Condition);
  const entity = `
    import { Field } from './Field';
    import { UserSkill } from './BaseSkill';

    export type ConditionMap = Map<Condition['type'], Condition>;

    export class Condition {
      type: Condition.Type;
      title: string;
      fields: Field[];
      description: string;
      once: boolean;
      validator?: (userSkill: UserSkill) => boolean;
    }

    export namespace Condition {
      export enum Type {
        ${tsv.map((data) => `${pascalCase(data.type)} = '${data.type}', // ${data.description}`).join('\n')}
      }
    }
  `;
  const name = 'condition';
  writeEntity(name, entity);

  const items: Condition[] = tsv.map((item) => {
    return {
      type: item.type as Condition.Type,
      title: item.title,
      fields: parseFields(item.fields),
      description: item.description,
      once: /true/i.test(item.once),
    };
  });
  writeJSON(name, items);

  const script = `
    import { Condition } from '../../entities';
    import * as json from '../json/${name}.json';

    export const conditions: Condition[] = json as Condition[];
  `;
  writeTypeScript(name, script);
});

gulp.task('tsv:targets', async () => {
  const name = 'skillTarget';
  const tsv = parseTsv(Tsv.Target);
  const entity = `
    export enum SkillTarget {
        ${tsv.map((data) => `${pascalCase(data.target)} = '${data.target}', // ${data.title}`).join('\n')}
    }
  `;
  writeEntity(name, entity);

  const script = `
    import { SkillTarget } from '../../entities';

    export const skillTargetTitleMap: Record<SkillTarget, string> = {
      ${tsv.map((data) => `[SkillTarget.${pascalCase(data.target)}]: '${data.title}',`).join('\n')}
    }
  `;
  writeTypeScript(name, script);
});

gulp.task('tsv:skills', async () => {
  const name = 'skill';
  const tsv = parseTsv(Tsv.Skill);
  const entity = `
    import { BaseMasterSkill, BaseSkill } from './BaseSkill';
    import { Condition } from './Condition';
    import { Field } from './Field';
    import { SkillTarget } from './SkillTarget';

    export enum SkillEffect {
        ${tsv.map((data) => `${pascalCase(data.effect)} = '${data.effect}', // ${data.description}`).join('\n')}
    }

    export interface MasterSkill extends BaseMasterSkill {
      effect: SkillEffect;
      title: string;
      slug: string;
      description: string;
      fields: Field[];
    }

    export interface Skill extends BaseSkill {
      id: string;
      effect: SkillEffect;
      title: string;
      description: string;
      slug: string;
      fields: Field[];
      condition: Condition.Type;
      target: SkillTarget;
    }

    export enum Parameter {
      Appeal = 'appeal', // value
      Technique = 'technique', // value
      Stamina = 'stamina', // value
      Sp = 'sp', // value 最大SP
      SpVoltage = 'spVoltage', // value Spボルテージ
      Critical = 'critical', // rate クリティカル値
      CriticalRate = 'criticalRate', // rate クリティカル率
      Voltage = 'voltage', // rate ボルテージ
      VoltageWithCritical = 'voltageWithCritical', // rate ボルテージ＋クリティカル
      VoltageLimit = 'voltageLimit', // value ボルテージの最大値
      SpSkill = 'spSkill', // rate Sp特技の獲得ボルテージ増加
      SpSkillBonus = 'spSkillBonus', // value Spボルテージ獲得量増加
      DamageReduction = 'damageReduction', // rate スタミナ減少量
      SpGaugeGain = 'spGaugeGain', // rate SPゲージ獲得量増加
      SkillInvocation = 'skillInvocation', // rate 特技発動率
    }
    
    export type ValueParameter = Parameter.Appeal | Parameter.Stamina | Parameter.Technique | Parameter.SpSkillBonus;
    export type RateParameter =
      | Parameter.Critical
      | Parameter.CriticalRate
      | Parameter.Voltage
      | Parameter.VoltageLimit
      | Parameter.SpSkill
      | Parameter.DamageReduction
      | Parameter.SpGaugeGain
      | Parameter.SkillInvocation;
    export type BaseParameter = ValueParameter | RateParameter;
    
    export class BaseParameterMap implements Record<BaseParameter, Value | Rate> {
      [Parameter.Appeal]: Value = 0;
      [Parameter.Stamina]: Value = 0;
      [Parameter.Technique]: Value = 0;
      [Parameter.Critical]: Rate = 0;
      [Parameter.CriticalRate]: Rate = 0;
      [Parameter.DamageReduction]: Rate = 0;
      [Parameter.SkillInvocation]: Rate = 0;
      [Parameter.SpGaugeGain]: Rate = 0;
      [Parameter.SpSkill]: Rate = 0;
      [Parameter.SpSkillBonus]: Value = 0;
      [Parameter.Voltage]: Rate = 0;
      [Parameter.VoltageLimit]: Rate = 0;
      constructor(params: Partial<Record<Parameter, Value | Rate>> = {}) {
        Object.assign(this, params);
      }
    }
    
    export class BaseRateMap implements Record<BaseParameter, Rate> {
      [Parameter.Appeal]: Rate = 1;
      [Parameter.Stamina]: Rate = 1;
      [Parameter.Technique]: Rate = 1;
      [Parameter.Critical]: Rate = 1;
      [Parameter.CriticalRate]: Rate = 1;
      [Parameter.DamageReduction]: Rate = 1;
      [Parameter.SkillInvocation]: Rate = 1;
      [Parameter.SpGaugeGain]: Rate = 1;
      [Parameter.SpSkill]: Rate = 1;
      [Parameter.SpSkillBonus]: Rate = 1;
      [Parameter.Voltage]: Rate = 1;
      [Parameter.VoltageLimit]: Rate = 1;
      constructor(params: Partial<Record<Parameter, Rate>> = {}) {
        Object.assign(this, params);
      }
    }
  `;
  writeEntity(name, entity);

  const script = `
    import { MasterSkill } from '../../entities';
    import * as json from '../json/skill.json';

    export const skills: MasterSkill[] = json as MasterSkill[];
  `;
  writeTypeScript(name, script);

  const items: MasterSkill[] = tsv.map((item) => ({
    effect: item.effect as SkillEffect,
    title: item.title,
    slug: item.slug,
    description: item.description,
    fields: parseFields(item.fields),
  }));
  writeJSON(name, items);
});

gulp.task('tsv:inspirationSkills', async () => {
  const rankMap = reverseMap(InspirationSkill.Rank);
  const rarityMap = reverseMap(InspirationSkill.Rarity);
  const placeMap = reverseMap(InspirationSkill.Place);
  const skillMap = Object.fromEntries(getSkillMap());
  const items: InspirationSkill[] = parseTsv(Tsv.InspirationSkill).map((item) => {
    item.places = parseArray(item.places);
    validateObject(rankMap, item, 'rank');
    validateObject(rarityMap, item, 'rarity');
    validateObject(skillMap, item, 'skillId');
    validateObject(placeMap, item, 'places');
    return {
      id: item.id,
      skillId: item.skillId,
      title: item.title,
      rank: item.rank as InspirationSkill.Rank,
      rarity: item.rarity as InspirationSkill.Rarity,
      skillFields: parseArray(item.skillFields),
      conditionFields: parseArray(item.conditionFields),
      places: item.places as InspirationSkill.Place[],
    };
  });

  const name = 'inspirationSkill';
  writeJSON(name, items);

  const code = `
    import { InspirationSkill } from '../../entities';
    import * as json from '../json/${name}.json';

    export const inspirationSkills: InspirationSkill[] = json as InspirationSkill[];
  `;
  writeTypeScript(name, code);
});

gulp.task('tsv:accessories', async () => {
  const attributeMap = reverseMap(Card.Attribute);
  const rarityMap = reverseMap(Card.Rarity);
  const skillMap = getSkillMap();
  const conditionMap = toMap(conditions, 'type');
  const items: MasterAccessory[] = parseTsv(Tsv.Accessory).map((item) => {
    const data = {
      type: item.type,
      title: item.title,
      attributes: parseArray(item.attributes),
      rarities: parseArray(item.rarities),
      appeal: parseNumber(item.appeal),
      stamina: parseNumber(item.stamina),
      technique: parseNumber(item.technique),
      skillId: item.skillId,
      skillFields: parseArray(item.skillFields),
      conditionFields: parseArray(item.conditionFields),
    };
    for (const attribute of data.attributes) {
      validate(attributeMap, attribute);
    }
    for (const rarity of data.rarities) {
      validate(rarityMap, rarity);
    }
    validateSkill(skillMap, conditionMap, data);
    return data;
  });

  const name = 'accessory';
  writeJSON(name, items);

  const code = `
    import { MasterAccessory } from '../../entities';
    import * as json from '../json/${name}.json';

    export const accessories: MasterAccessory[] = json as MasterAccessory[];
  `;
  writeTypeScript(name, code);
});

gulp.task('tsv:kizuna', async () => {
  const skillMap = getSkillMap();
  const conditionMap = toMap(conditions, 'type');
  const items: KizunaSkill[] = parseTsv(Tsv.Kizuna).map((item) => ({
    id: item.id,
    title: item.title,
    skillId: item.skillId,
    skillFields: parseArray(item.skillFields),
    conditionFields: parseArray(item.conditionFields),
    color: item.color,
  }));
  for (const item of items) {
    validateSkill(skillMap, conditionMap, item);
  }

  const name = 'kizuna';
  writeJSON(name, items);

  const code = `
    import { KizunaSkill } from '../../entities';
    import * as json from '../json/${name}.json';

    export const kizunaSkills: KizunaSkill[] = json as KizunaSkill[];
  `;
  writeTypeScript(name, code);
});
