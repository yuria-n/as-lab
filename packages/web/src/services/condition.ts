import { entities } from '@as-lab/core';
import { ConditionRepository } from '../repositories';

export class ConditionService {
  static async getConditions(): Promise<entities.Condition[]> {
    return ConditionRepository.getConditions();
  }
}
