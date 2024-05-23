import { entities, libs, masters } from '@as-lab/core';

export class SkillRepository {
  static async getSkill(
    effect: entities.SkillEffect,
    condition: entities.Condition.Type,
    target: entities.SkillTarget,
  ): Promise<entities.Skill> {
    return libs.getSkill(effect, condition, target);
  }

  static async getSkillMap(): Promise<entities.SkillMap<entities.Skill>> {
    return libs.getSkillMap();
  }

  static async getMasterSkills(): Promise<entities.MasterSkill[]> {
    return masters.skills;
  }

  static async getTargetTitleMap() {
    return masters.skillTargetTitleMap;
  }
}
