import { UserSkill } from '../entities';

export function omitSkillId(userSkill: UserSkill): Omit<UserSkill, 'skillId'> {
  return {
    skillFields: userSkill.skillFields,
    conditionFields: userSkill.conditionFields,
  };
}
