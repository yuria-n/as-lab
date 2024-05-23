import { entities } from '@as-lab/core';

import { SkillRepository } from '../repositories';

export class SkillService {
  static async getSkill(
    effect: entities.SkillEffect,
    condition: entities.Condition.Type,
    target: entities.SkillTarget,
  ): Promise<entities.Skill> {
    return SkillRepository.getSkill(effect, condition, target);
  }

  static async getSkillMap(): Promise<entities.SkillMap<entities.Skill>> {
    return SkillRepository.getSkillMap();
  }

  static async getMasterSkills(): Promise<entities.MasterSkill[]> {
    return SkillRepository.getMasterSkills();
  }

  static async getTargetTitleMap() {
    return SkillRepository.getTargetTitleMap();
  }
}
