import { entities } from '@as-lab/core';

import { AcConditionRepository } from '../repositories';

export class AcConditionService {
  static async getAcConditions(): Promise<entities.AcCondition[]> {
    return AcConditionRepository.getAcConditions();
  }
}
