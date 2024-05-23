import { entities, masters, utils } from '@as-lab/core';

import { Analytics, Firebase, LocalStorage, LogType, StorageKey } from '../clients';
import { BadRequestError } from '../hooks';

interface UserCardV1 {
  id: entities.Card['id'];
  appeal: Value;
  technique: Value;
  stamina: Value;
  skill: entities.UserSkill;
  personalSkills: entities.UserSkill[];
  inspirationSkillIds: entities.InspirationSkill['id'][];
}
interface Version1 {
  version: 1;
  cards: UserCardV1[];
}

interface Version2 {
  version: 2;
  cards: UserCardV1[];
}

interface Version3 extends entities.StoredUserCards {
  version: 3;
}

interface Version4 extends entities.StoredUserCards {
  version: 4;
}

export enum SyncField {
  Appeal = 'appeal',
  Technique = 'technique',
  Stamina = 'stamina',
  InspirationSkillIds = 'inspirationSkillIds',
  UpdatedAt = 'updatedAt',
}
export type SyncUserCard = Partial<Pick<entities.UserCard, SyncField>> & Pick<entities.UserCard, SyncField.UpdatedAt>;
export type SyncUserCardMap = Record<Id, SyncUserCard>;

export class UserCardRepository {
  private static version = 3;
  static async getUserCards(): Promise<entities.UserCard[]> {
    return (await this.get())?.cards ?? [];
  }

  static async getPresetUserCards(): Promise<masters.PresetUserCards[]> {
    return masters.presetUserCards;
  }

  static async createUserCard(userCard: entities.UserCard): Promise<void> {
    const userCards = await this.getUserCards();
    if (userCards.some((card) => card.id === userCard.id)) {
      throw new Error('Card already exists');
    }
    Analytics.logEvent(LogType.UserCardCreation, { id: userCard.id });
    await this.set([userCard, ...userCards].sort((c1, c2) => c1.id.localeCompare(c2.id)));
  }

  static async createUserCards(newUserCards: entities.UserCard[]): Promise<void> {
    const userCards = await this.getUserCards();
    const userCardIdSet = new Set(userCards.map((card) => card.id));
    if (newUserCards.some((card) => userCardIdSet.has(card.id))) {
      throw new Error(`Duplicate card found`);
    }
    Analytics.logEvent(LogType.UserCardCreationBatch, { ids: newUserCards.map((card) => card.id).toString() });
    await this.set([...newUserCards, ...userCards].sort((c1, c2) => c1.id.localeCompare(c2.id)));
  }

  static async updateUserCard(userCard: entities.UserCard): Promise<void> {
    Analytics.logEvent(LogType.UserCardUpdate, { id: userCard.id });
    const userCards = await this.getUserCards();
    await this.set([userCard, ...userCards.filter(({ id }) => id !== userCard.id)]);
  }

  static async updateUserCards(nextUserCards: entities.UserCard[]): Promise<void> {
    Analytics.logEvent(LogType.UserCardsUpdate);
    const userCards = await this.getUserCards();
    const cardSet = new Set(nextUserCards.map((card) => card.id));
    await this.set([...nextUserCards, ...userCards.filter(({ id }) => !cardSet.has(id))]);
  }

  static async deleteUserCard(cardId: entities.UserCard['id']): Promise<void> {
    Analytics.logEvent(LogType.UserCardDeletion, { id: cardId });
    const userCards = await this.getUserCards();
    await this.set([...userCards.filter(({ id }) => id !== cardId)]);
  }

  static async deleteUserCards(cardIds: entities.UserCard['id'][]): Promise<void> {
    Analytics.logEvent(LogType.UserCardDeletion, { id: cardIds.toString() });
    const userCards = await this.getUserCards();
    const idSet = new Set(cardIds);
    await this.set([...userCards.filter(({ id }) => !idSet.has(id))]);
  }

  static async fetchUserCardMap(uid: string): Promise<SyncUserCardMap> {
    const firestore = await Firebase.firestore();
    const snapshot = await firestore.collection('user_cards').doc(uid).get();
    return snapshot.data() as SyncUserCardMap;
  }

  static export() {
    return this.get();
  }

  static import(data: entities.StoredUserCards) {
    return this.set(data.cards, data.version);
  }

  static async copy(presetName: string) {
    const presets = await this.getPresetUserCards();
    const preset = presets.find((preset) => preset.name === presetName);
    if (!preset) {
      throw new BadRequestError('プリセットが見つかりませんでした');
    }
    Analytics.logEvent(LogType.PresetCopy, { name: presetName });
    await this.set(preset.userCards);
    return this.getUserCards();
  }

  private static async get(): Promise<entities.StoredUserCards | null> {
    return this.migrate(LocalStorage.get<entities.StoredUserCards>(StorageKey.UserCard) ?? null);
  }

  private static async set(userCards: entities.UserCard[], version = this.version) {
    LocalStorage.set(StorageKey.UserCard, {
      version,
      cards: userCards,
    });
  }

  private static migrate(
    data: Version1 | Version2 | Version3 | entities.StoredUserCards | null,
  ): entities.StoredUserCards | null {
    if (!data) {
      return data;
    }
    switch (data.version) {
      case 1: {
        return this.migrate(this.migrate1(data as any));
      }
      case 2: {
        return this.migrate(this.migrate2(data as any));
      }
      case 3: {
        return this.migrate(this.migrate3(data as any));
      }
      default: {
        return {
          version: data.version,
          cards: data.cards.filter((card) => card.id),
        };
      }
    }
  }

  /**
   * migrate inspiration skills, ids have been changed
   */
  private static migrate1(data: Version1): Version2 {
    const map = masters.migration.userCardV1;
    for (const card of data.cards) {
      card.inspirationSkillIds = card.inspirationSkillIds
        .map((id) => {
          if (!id) {
            return null;
          }
          const rarity = map[id];
          if (!rarity) {
            return null;
          }
          const [effect, condition, target, rank] = id.split('_');
          return [effect, condition, target, rarity, rank].join('_');
        })
        .filter((id) => id) as string[];
    }
    return {
      version: 2,
      cards: data.cards,
    };
  }

  /**
   * shioriko id has been changed and preset has all card info so omit the card info.
   * Also all skill ids have been omitted from UserCard
   */
  private static migrate2(data: Version2): Version3 {
    const cards = data.cards.map((card) => ({
      id: card.id,
      appeal: card.appeal,
      technique: card.technique,
      stamina: card.stamina,
      skill: utils.omitSkillId(card.skill),
      personalSkills: card.personalSkills.map(utils.omitSkillId),
      inspirationSkillIds: card.inspirationSkillIds,
    }));
    return {
      version: 3,
      cards,
    };
  }

  /**
   * fix inspiration skill names
   */
  private static migrate3(data: Version3): Version4 {
    const map: Record<string, string> = {
      voltageGain_acSuccess_none_NR_medium: 'voltageGain_acSuccess_none_NR_small',
      voltageGain_stamina_none_NR_medium: 'voltageGain_stamina_none_NR_small',
      voltageGain_targetVoltage_none_NR_medium: 'voltageGain_targetVoltage_none_NR_small',
    };
    const cards = data.cards.map((card) => ({
      ...card,
      inspirationSkillIds: card.inspirationSkillIds.map((id) => map[id] ?? id),
    }));
    return {
      version: 4,
      cards,
    };
  }
}
