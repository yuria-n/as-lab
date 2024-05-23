import { masters } from '@as-lab/core';

export class KizunaRepository {
  static async getKizunaSkills() {
    return masters.kizunaSkills;
  }
}
