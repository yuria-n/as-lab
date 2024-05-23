import { FirebaseAnalytics } from '@firebase/analytics-types';
import { entities, libs } from '@as-lab/core';

import { Firebase } from './firebase';
import { config } from '../config';

export enum LogType {
  Simulation = 'simulation',
  SimulationDetail = 'simulation_detail',
  SimulationSupport = 'simulation_support',
  MusicSimulation = 'simulation_music',
  UserAccessoryCreation = 'user_accessory_creation',
  UserAccessoryUpdate = 'user_accessory_update',
  UserAccessoryDeletion = 'user_accessory_deletion',
  UserCardCreation = 'user_card_creation',
  UserCardCreationBatch = 'user_card_creation_batch',
  UserCardSync = 'user_card_sync',
  UserCardUpdate = 'user_card_update',
  UserCardsUpdate = 'user_cards_update',
  UserCardDeletion = 'user_card_deletion',
  UserIdolCreation = 'user_idol_creation',
  UserIdolUpdate = 'user_idol_update',
  UserDeckCreation = 'user_deck_creation',
  UserDeckUpdate = 'user_deck_update',
  UserDeckDeletion = 'user_deck_deletion',
  UserFriendCreation = 'user_friend_creation',
  UserFriendUpdate = 'user_friend_update',
  UserFriendDeletion = 'user_friend_deletion',
  DrawGacha = 'draw_gacha',
  DrawGachaAuto = 'draw_gacha_auto',
  PresetCopy = 'preset_copy',
  VisitHome = 'visit_home',
  VisitCard = 'visit_card',
  VisitMusicSimulator = 'visit_music_simulator',
  VisitLibraryCard = 'visit_library_card',
  VisitGacha = 'visit_gacha',
  VisitGachaFromHash = 'visit_gacha_from_hash',
  VisitLibraryInspirationSkill = 'visit_library_inspiration_skill',
  VisitRequest = 'visit_request',
  VisitAbout = 'visit_about',
  VisitReference = 'visit_reference',
  VisitDeck = 'visit_deck',
  VisitAccessory = 'visit_accessory',
  VisitKizuna = 'visit_kizuna',
  SwitchMobileView = 'switch_mobile_view',
}

interface SimulationPayload extends Omit<libs.DeckSimulator.Options, 'deckCards' | 'attribute'> {
  presetName: string;
  attribute: string;
  deckCards: number;
}
type SimulationSupportPayload = libs.DeckSupportSimulator.Options;

interface MusicSimulationPayload {
  id: string;
  count: number;
  detail: boolean;
}

interface SimulationDetailPayload {
  score: number;
}

interface UserAccessoryPayload {
  id: entities.UserAccessory['accessoryId'];
}

interface UserCardPayload {
  id: entities.Card['id'];
}

interface UserCardBatchPayload {
  ids: string;
}

interface UserIdolPayload {
  id: entities.Idol['id'];
}

interface UserDeckCreationPayload {
  title: entities.UserDeck['title'];
  copy: boolean;
}

type UserDeckUpdatePayload = Pick<UserDeckCreationPayload, 'title'>;

interface UserFriendPayload {
  id: entities.UserFriend['id'];
  name: entities.UserFriend['name'];
  cardId: entities.UserFriend['card']['id'];
}

interface PresetCopyPayload {
  name: string;
}

interface DrawGachaPayload {
  id: entities.Gacha['id'];
  cost: number;
}

interface SwitchMobileViewPayload {
  userAgent: string;
  mobileView: boolean;
}

export class Analytics {
  static key = config.event;
  static analytics: FirebaseAnalytics;
  static init() {
    if (this.analytics || config.development || localStorage.getItem(this.key)) {
      return;
    }
    Firebase.analytics()
      .then((analytics) => {
        this.analytics = analytics;
      })
      .catch((err) => console.debug(err));
  }
  static logEvent(type: LogType.Simulation, payload: SimulationPayload): void;
  static logEvent(type: LogType.SimulationDetail, payload: SimulationDetailPayload): void;
  static logEvent(type: LogType.SimulationSupport, payload: SimulationSupportPayload): void;
  static logEvent(type: LogType.MusicSimulation, payload: MusicSimulationPayload): void;
  static logEvent(type: LogType.PresetCopy, payload: PresetCopyPayload): void;
  static logEvent(type: LogType.DrawGacha | LogType.DrawGachaAuto, payload: DrawGachaPayload): void;
  static logEvent(
    type: LogType.UserAccessoryCreation | LogType.UserAccessoryUpdate | LogType.UserAccessoryDeletion,
    payload: UserAccessoryPayload,
  ): void;
  static logEvent(
    type: LogType.UserCardCreation | LogType.UserCardUpdate | LogType.UserCardDeletion,
    payload: UserCardPayload,
  ): void;
  static logEvent(type: LogType.UserCardCreationBatch, payload: UserCardBatchPayload): void;
  static logEvent(type: LogType.UserDeckCreation, payload: UserDeckCreationPayload): void;
  static logEvent(type: LogType.UserDeckUpdate | LogType.UserDeckDeletion, payload: UserDeckUpdatePayload): void;
  static logEvent(
    type: LogType.UserFriendCreation | LogType.UserFriendUpdate | LogType.UserFriendDeletion,
    payload: UserFriendPayload,
  ): void;
  static logEvent(type: LogType.UserIdolCreation | LogType.UserIdolUpdate, payload: UserIdolPayload): void;
  static logEvent(type: LogType.SwitchMobileView, payload: SwitchMobileViewPayload): void;
  static logEvent(type: LogType): void;
  static logEvent(type: LogType, payload?: any): void {
    payload =
      payload && typeof payload === 'object'
        ? Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, JSON.stringify(value)]))
        : payload;
    if (config.feature) {
      console.debug('analytics event', { type, payload });
      return;
    }
    if (!this.analytics) {
      return;
    }
    try {
      this.analytics.logEvent(type as any, { ...payload, webview: config.webview });
    } catch (err) {}
  }
}
