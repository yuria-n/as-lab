import { entities, libs } from '@as-lab/core';

import { MusicSimulatorOptions, MusicSimulatorRepository } from '../repositories';
import { IdolService } from './idol';
import { CardService } from './card';
import { SkillService } from './skill';
import { ConditionService } from './condition';
import { InspirationSkillService } from './inspirationSkill';
import { AccessoryService } from './accessory';
import { AcConditionService } from './acCondition';
import { UserIdolService } from './userIdol';
import { UserCardService } from './userCard';
import { KizunaService } from './kizuna';
import { UserAccessoryService } from './userAccessory';

export class MusicSimulatorService {
  static async simulate(
    userDeck: entities.UserDeck,
    liveStage: entities.Music.LiveStage,
    count: Value,
    options: libs.MusicSimulator.Options,
  ) {
    const [
      idols,
      cards,
      skillMap,
      conditions,
      inspirationSkills,
      kizunaSkills,
      accessoryMap,
      acConditions,
    ] = await Promise.all([
      IdolService.getIdols(),
      CardService.getCards(),
      SkillService.getSkillMap(),
      ConditionService.getConditions(),
      InspirationSkillService.getInspirationSkills(),
      KizunaService.getKizunaSkills(),
      AccessoryService.getMap(),
      AcConditionService.getAcConditions(),
    ]);
    const [userIdols, userCards, userAccessories] = await Promise.all([
      UserIdolService.getUserIdols(),
      UserCardService.getUserCards(),
      UserAccessoryService.getUserAccessories(),
    ]);

    return MusicSimulatorRepository.simulate(
      idols,
      cards,
      skillMap,
      conditions,
      inspirationSkills,
      kizunaSkills,
      accessoryMap,
      liveStage,
      acConditions,
      userDeck,
      userIdols,
      userCards,
      userAccessories,
      count,
      options,
    );
  }

  static async getOptionsMap() {
    return MusicSimulatorRepository.getOptionsMap();
  }

  static async setOptions(musicId: entities.Music.LiveStage['id'], options: MusicSimulatorOptions) {
    return MusicSimulatorRepository.setOptions(musicId, options);
  }
}
