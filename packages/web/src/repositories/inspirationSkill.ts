import { masters } from '@as-lab/core';

export class InspirationSkillRepository {
  static async getInspirationSkills() {
    return masters.inspirationSkills;
  }
}
