import { entities, masters } from '@as-lab/core';

export class ConditionRepository {
  static async getConditions(): Promise<entities.Condition[]> {
    return masters.conditions;
  }
}
