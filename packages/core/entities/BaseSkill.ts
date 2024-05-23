import { Field } from './Field';

export interface BaseMasterSkill {
  effect: string;
  title: string;
  slug: string;
  description: string;
  fields: Field[];
}

export interface BaseSkill {
  id: string;
  effect: string;
  title: string;
  description: string;
  slug: string;
  fields: Field[];
  condition: string;
  target: string;
}

export interface BaseCondition {
  type: string;
  title: string;
  fields: Field[];
  description: string;
  once: boolean;
}

export interface CardSkill extends UserSkill {
  skillId: string;
}

export interface UserSkill {
  skillFields: any[];
  conditionFields: (string | number)[];
}

export type SkillMap<T extends BaseSkill> = Map<T['id'], T>;
