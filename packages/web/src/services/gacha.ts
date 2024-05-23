import { entities } from '@as-lab/core';
import { GachaRepository } from '../repositories';

export class GachaService {
  static async getGachas(): Promise<entities.Gacha[]> {
    return GachaRepository.getGachas();
  }

  static async getGachaDetails(): Promise<entities.GachaDetail[]> {
    return GachaRepository.getGachaDetails();
  }

  static async getStats(gacha: entities.Gacha) {
    return GachaRepository.getStats(gacha);
  }

  static async getHistories(gacha: entities.Gacha) {
    return GachaRepository.getHistories(gacha);
  }

  static async draw(gacha: entities.Gacha, costIndex: number) {
    return GachaRepository.draw(gacha, costIndex);
  }
}
