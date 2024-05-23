import { entities } from '@as-lab/core';

import { ReferenceRepository } from '../repositories';

export class ReferenceService {
  static async getReferenceList(): Promise<entities.Reference[]> {
    return ReferenceRepository.getReferenceList();
  }
}
