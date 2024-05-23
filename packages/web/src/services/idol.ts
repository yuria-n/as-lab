import { entities } from '@as-lab/core';
import { IdolRepository } from '../repositories';

export class IdolService {
  static async getIdols(): Promise<entities.Idol[]> {
    return IdolRepository.getIdols();
  }
}
