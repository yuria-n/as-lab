import { StoredUserCards, UserCard } from '../../entities';
import { cards } from './card';
import { omitSkillId } from '../../utils';

export interface PresetUserCards {
  name: string;
  userCards: UserCard[];
}

export const allCards: StoredUserCards = {
  version: 3,
  cards: cards.map((card) => ({
    id: card.id,
    appeal: card.appeal,
    technique: card.technique,
    stamina: card.stamina,
    skill: omitSkillId(card.skill),
    personalSkills: card.personalSkills.map(omitSkillId),
    inspirationSkillIds: [],
  })),
};

export const presetUserCards: PresetUserCards[] = [
  { name: '全てのカード', storedUserCards: allCards },
].map(({ name, storedUserCards }) => ({ name, userCards: storedUserCards.cards }));
