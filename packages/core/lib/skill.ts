import { Skill, SkillMap, SkillTarget } from '../entities';
import { masters } from '../data';
import { toMap } from '../utils';

const masterSkillMap = toMap(masters.skills, 'effect');
const conditionMap = toMap(masters.conditions, 'type');
const targetSet = new Set(Object.values(SkillTarget));

export function getSkill(effect: Skill['effect'], condition: Skill['condition'], target: Skill['target']): Skill {
  const skill = masterSkillMap.get(effect);
  if (!skill) {
    console.error({ effect, condition, target });
    throw new Error('Invalid effect');
  }
  if (!conditionMap.has(condition)) {
    console.error({ effect, condition, target });
    throw new Error('Invalid condition');
  }
  if (!targetSet.has(target)) {
    console.error({ effect, condition, target });
    throw new Error('Invalid target');
  }
  const id = [effect, condition, target].join('_');
  return {
    id,
    title: skill.title,
    slug: skill.slug,
    description: skill.description,
    fields: skill.fields,
    effect,
    condition,
    target,
  };
}

const skillMap = new Map<Skill['id'], Skill>();

export function getSkillMap(
  skills = masters.skills,
  conditions = masters.conditions,
  targets = SkillTarget,
): SkillMap<Skill> {
  if (skillMap.size !== 0) {
    return skillMap;
  }
  const targetSet = new Set(Object.values(targets));
  for (const { effect } of skills) {
    for (const { type: condition } of conditions) {
      for (const target of targetSet) {
        const skill = getSkill(effect, condition, target);
        skillMap.set(skill.id, skill);
      }
    }
  }
  return skillMap;
}
