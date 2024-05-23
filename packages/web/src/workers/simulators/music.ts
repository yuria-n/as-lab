import { entities, libs, utils } from '@as-lab/core';

export interface SimulationResult {
  status: libs.PlayerStatusInterface;
  histories: libs.MusicSimulator.History[];
}

export async function simulate(
  idols: entities.Idol[],
  cards: entities.Card[],
  skillMap: entities.SkillMap<entities.Skill>,
  conditions: entities.Condition[],
  inspirationSkills: entities.InspirationSkill[],
  kizunaSkills: entities.KizunaSkill[],
  accessoryMap: entities.AccessoryMap,
  liveStage: entities.Music.LiveStage,
  acConditions: entities.AcCondition[],
  userDeck: entities.UserDeck,
  userIdols: entities.UserIdol[],
  userCards: entities.UserCard[],
  userAccessories: entities.UserAccessory[],
  count: Value,
  options: libs.MusicSimulator.Options,
): Promise<SimulationResult[]> {
  return utils.times(count, () => {
    const simulator = new libs.MusicSimulator(
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
      options,
    );
    simulator.simulate();
    return {
      status: simulator.getPlayerStatus().toObject(),
      histories: simulator.getHistories(),
    };
  });
}
