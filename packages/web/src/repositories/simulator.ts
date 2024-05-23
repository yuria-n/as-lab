import { entities, libs, utils } from '@as-lab/core';

import { Analytics, LocalStorage, LogType, StorageKey } from '../clients';

export type SupportTableHeader = keyof libs.DeckSupportSimulator.SupportCard;
interface StoredOptions {
  version: Version;
  headers?: SupportTableHeader[];
  deckOptions?: libs.DeckSupportSimulator.Options;
}

export class SimulatorRepository {
  private static readonly version = 1;
  static async simulate(
    idols: entities.Idol[],
    cards: entities.Card[],
    skillMap: entities.SkillMap<entities.Skill>,
    conditions: entities.Condition[],
    inspirationSkills: entities.InspirationSkill[],
    kizunaSkills: entities.KizunaSkill[],
    userIdols: entities.UserIdol[],
    userCards: entities.UserCard[],
    options: libs.DeckSimulator.Options,
    auto: boolean,
    presetName: string,
  ): Promise<entities.Deck.Card[]> {
    if (!auto) {
      Analytics.logEvent(LogType.Simulation, {
        ...options,
        attribute: options.attribute ?? 'none',
        deckCards: utils.compact(options.deckCards).length,
        presetName,
      });
    }
    return new libs.DeckSimulator(
      idols,
      cards,
      skillMap,
      conditions,
      inspirationSkills,
      kizunaSkills,
      userIdols,
      userCards,
      options,
    ).simulate();
  }

  static async simulateSupport(
    idols: entities.Idol[],
    cards: entities.Card[],
    skillMap: entities.SkillMap<entities.Skill>,
    conditions: entities.Condition[],
    inspirationSkills: entities.InspirationSkill[],
    kizunaSkills: entities.KizunaSkill[],
    userIdols: entities.UserIdol[],
    userCards: entities.UserCard[],
    auto: boolean,
    options: libs.DeckSupportSimulator.Options,
  ): Promise<libs.DeckSupportSimulator.Result> {
    if (!auto) {
      Analytics.logEvent(LogType.SimulationSupport, options);
    }
    return new libs.DeckSupportSimulator(
      idols,
      cards,
      skillMap,
      conditions,
      inspirationSkills,
      kizunaSkills,
      userIdols,
      userCards,
      options,
    ).simulate();
  }

  static async getOptions(): Promise<libs.DeckSupportSimulator.Options | null> {
    return (await this.getStoredOptions()).deckOptions ?? null;
  }

  static async setOptions(options: libs.DeckSupportSimulator.Options) {
    const prev = await this.getStoredOptions();
    await this.setStoredOptions({ ...prev, deckOptions: options });
  }

  static async getTableHeaders(): Promise<SupportTableHeader[] | null> {
    return (await this.getStoredOptions()).headers ?? null;
  }

  static async setTableHeaders(headers: SupportTableHeader[]) {
    const prev = await this.getStoredOptions();
    await this.setStoredOptions({ ...prev, headers });
  }

  private static async getStoredOptions(): Promise<StoredOptions> {
    return LocalStorage.get<StoredOptions>(StorageKey.DeckSupportSimulatorOption) ?? { version: this.version };
  }

  static async setStoredOptions(options: StoredOptions) {
    await LocalStorage.set<StoredOptions>(StorageKey.DeckSupportSimulatorOption, options);
  }
}
