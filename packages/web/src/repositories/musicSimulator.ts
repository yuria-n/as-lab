import { libs, entities } from '@as-lab/core';

// @ts-ignore
import worker from 'workerize-loader!../workers/simulators/music'; // eslint-disable-line import/no-webpack-loader-syntax
import * as Worker from '../workers/simulators/music';

import { Analytics, LocalStorage, LogType, StorageKey } from '../clients';

const simulator: typeof Worker = worker();

export interface MusicSimulatorOptions extends libs.MusicSimulator.Options {
  deckId?: entities.UserDeck['id'];
  friendId?: entities.UserFriend['id'];
}

export type MusicSimulatorOptionsMap = Record<entities.Music.LiveStage['id'], MusicSimulatorOptions>;

interface StoredOptions {
  version: Version;
  optionsMap: MusicSimulatorOptionsMap;
}

export interface SimulationResult {
  status: libs.PlayerStatusInterface;
  histories: libs.MusicSimulator.History[];
}

export class MusicSimulatorRepository {
  private static version = 1;
  static async simulate(
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
    Analytics.logEvent(LogType.MusicSimulation, {
      id: liveStage.id,
      count,
      detail: options.logLevel !== libs.SkillHandler.LogLevel.None,
    });
    return simulator.simulate(
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

  static async getOptionsMap(): Promise<MusicSimulatorOptionsMap> {
    return LocalStorage.get<StoredOptions>(StorageKey.MusicSimulatorOption)?.optionsMap ?? {};
  }

  static async setOptions(musicId: entities.Music.LiveStage['id'], options: MusicSimulatorOptions) {
    const data = (await this.get()) ?? { version: this.version, optionsMap: {} };
    data.optionsMap[musicId] = options;
    await this.set(data);
    return data.optionsMap;
  }

  private static async get(): Promise<StoredOptions | null> {
    return LocalStorage.get<StoredOptions>(StorageKey.MusicSimulatorOption) ?? null;
  }

  private static async set(data: StoredOptions) {
    LocalStorage.set<StoredOptions>(StorageKey.MusicSimulatorOption, data);
  }
}
