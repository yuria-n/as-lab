import { entities, libs } from '@as-lab/core';

import { CardService } from './card';
import { ConditionService } from './condition';
import { IdolService } from './idol';
import { InspirationSkillService } from './inspirationSkill';
import { KizunaService } from './kizuna';
import { SimulatorRepository, SupportTableHeader } from '../repositories';
import { SkillService } from './skill';

export class SimulatorService {
  static async simulate(
    userIdols: entities.UserIdol[],
    userCards: entities.UserCard[],
    options: libs.DeckSimulator.Options,
    auto: boolean,
    presetName: string,
  ) {
    const [idols, cards, skillMap, conditions, inspirationSkills, kizunaSkills] = await Promise.all([
      IdolService.getIdols(),
      CardService.getCards(),
      SkillService.getSkillMap(),
      ConditionService.getConditions(),
      InspirationSkillService.getInspirationSkills(),
      KizunaService.getKizunaSkills(),
    ]);
    return await SimulatorRepository.simulate(
      idols,
      cards,
      skillMap,
      conditions,
      inspirationSkills,
      kizunaSkills,
      userIdols,
      userCards,
      options,
      auto,
      presetName,
    );
  }

  static async simulateSupport(
    userIdols: entities.UserIdol[],
    userCards: entities.UserCard[],
    auto: boolean,
    options: libs.DeckSupportSimulator.Options,
  ) {
    const [idols, cards, skillMap, conditions, inspirationSkills, kizunaSkills] = await Promise.all([
      IdolService.getIdols(),
      CardService.getCards(),
      SkillService.getSkillMap(),
      ConditionService.getConditions(),
      InspirationSkillService.getInspirationSkills(),
      KizunaService.getKizunaSkills(),
    ]);
    const result = await SimulatorRepository.simulateSupport(
      idols,
      cards,
      skillMap,
      conditions,
      inspirationSkills,
      kizunaSkills,
      userIdols,
      userCards,
      auto,
      options,
    );
    if (!auto) {
      await this.setOptions(options);
    }
    return result;
  }

  static async getOptions() {
    return SimulatorRepository.getOptions();
  }

  private static async setOptions(options: libs.DeckSupportSimulator.Options) {
    return SimulatorRepository.setOptions(options);
  }

  static async getTableHeaders() {
    return SimulatorRepository.getTableHeaders();
  }

  static async setTableHeaders(headers: SupportTableHeader[]) {
    return SimulatorRepository.setTableHeaders(headers);
  }
}
