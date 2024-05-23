import { masters } from '@as-lab/core';

export class AcConditionRepository {
  static async getAcConditions() {
    return masters.acConditions;
  }
}
