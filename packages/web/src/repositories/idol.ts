import { masters, entities } from '@as-lab/core';

export class IdolRepository {
  static async getIdols(): Promise<entities.Idol[]> {
    return masters.idols;
  }
}
