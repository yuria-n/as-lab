import { masters } from '@as-lab/core';

export class ReferenceRepository {
  static async getReferenceList() {
    return masters.referenceList;
  }
}
