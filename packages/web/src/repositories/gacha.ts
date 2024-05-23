import { masters, entities, libs } from '@as-lab/core';

export class GachaRepository {
  static readonly gachaMap = new Map<entities.Gacha, libs.GachaSimulator>();
  static async getGachas(): Promise<entities.Gacha[]> {
    return masters.gachas;
  }

  static async getGachaDetails(): Promise<entities.GachaDetail[]> {
    return masters.gachaDetails;
  }

  static async draw(gacha: entities.Gacha, costIndex: number): Promise<libs.GachaSimulator.CardInfo[]> {
    const simulator = await this.getSimulator(gacha);
    this.gachaMap.set(gacha, simulator);
    return simulator.draw(costIndex);
  }

  static async getStats(gacha: entities.Gacha) {
    const simulator = await this.getSimulator(gacha);
    return simulator.getStats();
  }

  static async getHistories(gacha: entities.Gacha) {
    const simulator = await this.getSimulator(gacha);
    return simulator.getHistories(2000);
  }

  private static async getSimulator(gacha: entities.Gacha) {
    const details = await this.getGachaDetails();
    const simulator = this.gachaMap.get(gacha) ?? new libs.GachaSimulator(gacha, details);
    this.gachaMap.set(gacha, simulator);
    return simulator;
  }
}
