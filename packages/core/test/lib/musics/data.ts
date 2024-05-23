import { Deck, IdolId, UserAccessory, UserDeck, UserIdol } from '../../../entities';

export const deckCards: Deck.Card[] = [
  {
    team: Deck.Team.Red,
    cardId: '18',
  },
  {
    team: Deck.Team.Green,
    cardId: '251',
  },
  {
    team: Deck.Team.Green,
    cardId: '28',
  },
  {
    team: Deck.Team.Red,
    cardId: '112',
  },
  {
    team: Deck.Team.Red,
    cardId: '263',
  },
  {
    team: Deck.Team.Green,
    cardId: '12',
  },
  {
    team: Deck.Team.Blue,
    cardId: '157',
  },
  {
    team: Deck.Team.Blue,
    cardId: '122',
  },
  {
    team: Deck.Team.Blue,
    cardId: '139',
  },
];

export const userIdols: UserIdol[] = [
  {
    id: IdolId.Honoka,
    kizunaSkills: [
      {
        id: 'criticalRatePlus',
        skillFields: [0.5],
      },
      {
        id: 'criticalPlus',
        skillFields: [10],
      },
      {
        id: 'spGaugeGainPlus',
        skillFields: [3],
      },
      {
        id: 'spSkillPlus',
        skillFields: [1.4],
      },
      {
        id: 'teamEffectReductionPlusVo',
        skillFields: ['voltage', 0],
      },
      {
        id: 'teamEffectReductionPlusSp',
        skillFields: ['sp', 0],
      },
      {
        id: 'teamEffectReductionPlusGd',
        skillFields: ['guard', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSk',
        skillFields: ['skill', 0],
      },
      {
        id: 'attributeBonusPlus',
        skillFields: [2.5],
      },
    ],
  },
  {
    id: IdolId.Umi,
    kizunaSkills: [
      {
        id: 'criticalRatePlus',
        skillFields: [2],
      },
      {
        id: 'criticalPlus',
        skillFields: [30],
      },
      {
        id: 'spGaugeGainPlus',
        skillFields: [3.5],
      },
      {
        id: 'spSkillPlus',
        skillFields: [1.4],
      },
      {
        id: 'teamEffectReductionPlusVo',
        skillFields: ['voltage', 0],
      },
      {
        id: 'teamEffectReductionPlusSp',
        skillFields: ['sp', 0.5],
      },
      {
        id: 'teamEffectReductionPlusGd',
        skillFields: ['guard', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSk',
        skillFields: ['skill', 0.5],
      },
      {
        id: 'attributeBonusPlus',
        skillFields: [7.5],
      },
    ],
  },
  {
    id: IdolId.Nozomi,
    kizunaSkills: [
      {
        id: 'criticalRatePlus',
        skillFields: [0.5],
      },
      {
        id: 'criticalPlus',
        skillFields: [10],
      },
      {
        id: 'spGaugeGainPlus',
        skillFields: [2.5],
      },
      {
        id: 'spSkillPlus',
        skillFields: [1.4],
      },
      {
        id: 'teamEffectReductionPlusVo',
        skillFields: ['voltage', 0],
      },
      {
        id: 'teamEffectReductionPlusSp',
        skillFields: ['sp', 0],
      },
      {
        id: 'teamEffectReductionPlusGd',
        skillFields: ['guard', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSk',
        skillFields: ['skill', 0],
      },
      {
        id: 'attributeBonusPlus',
        skillFields: [2.5],
      },
    ],
  },
  {
    id: IdolId.Chika,
    kizunaSkills: [
      {
        id: 'criticalRatePlus',
        skillFields: [2],
      },
      {
        id: 'criticalPlus',
        skillFields: [30],
      },
      {
        id: 'spGaugeGainPlus',
        skillFields: [3],
      },
      {
        id: 'spSkillPlus',
        skillFields: [1.4],
      },
      {
        id: 'teamEffectReductionPlusVo',
        skillFields: ['voltage', 0],
      },
      {
        id: 'teamEffectReductionPlusSp',
        skillFields: ['sp', 0],
      },
      {
        id: 'teamEffectReductionPlusGd',
        skillFields: ['guard', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSk',
        skillFields: ['skill', 0.5],
      },
      {
        id: 'attributeBonusPlus',
        skillFields: [2.5],
      },
    ],
  },
  {
    id: IdolId.Ruby,
    kizunaSkills: [
      {
        id: 'criticalRatePlus',
        skillFields: [1.5],
      },
      {
        id: 'criticalPlus',
        skillFields: [10],
      },
      {
        id: 'spGaugeGainPlus',
        skillFields: [3],
      },
      {
        id: 'spSkillPlus',
        skillFields: [1.4],
      },
      {
        id: 'teamEffectReductionPlusVo',
        skillFields: ['voltage', 0],
      },
      {
        id: 'teamEffectReductionPlusSp',
        skillFields: ['sp', 0],
      },
      {
        id: 'teamEffectReductionPlusGd',
        skillFields: ['guard', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSk',
        skillFields: ['skill', 0.5],
      },
      {
        id: 'attributeBonusPlus',
        skillFields: [2.5],
      },
    ],
  },
  {
    id: IdolId.Hanamaru,
    kizunaSkills: [
      {
        id: 'criticalRatePlus',
        skillFields: [1.5],
      },
      {
        id: 'criticalPlus',
        skillFields: [10],
      },
      {
        id: 'spGaugeGainPlus',
        skillFields: [3],
      },
      {
        id: 'spSkillPlus',
        skillFields: [1.4],
      },
      {
        id: 'teamEffectReductionPlusVo',
        skillFields: ['voltage', 0],
      },
      {
        id: 'teamEffectReductionPlusSp',
        skillFields: ['sp', 0],
      },
      {
        id: 'teamEffectReductionPlusGd',
        skillFields: ['guard', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSk',
        skillFields: ['skill', 0.5],
      },
      {
        id: 'attributeBonusPlus',
        skillFields: [2.5],
      },
    ],
  },
  {
    id: IdolId.Kanan,
    kizunaSkills: [
      {
        id: 'criticalRatePlus',
        skillFields: [2.5],
      },
      {
        id: 'criticalPlus',
        skillFields: [35],
      },
      {
        id: 'spGaugeGainPlus',
        skillFields: [3.5],
      },
      {
        id: 'spSkillPlus',
        skillFields: [2.4],
      },
      {
        id: 'teamEffectReductionPlusVo',
        skillFields: ['voltage', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSp',
        skillFields: ['sp', 0.5],
      },
      {
        id: 'teamEffectReductionPlusGd',
        skillFields: ['guard', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSk',
        skillFields: ['skill', 0.5],
      },
      {
        id: 'attributeBonusPlus',
        skillFields: [7.5],
      },
    ],
  },
  {
    id: IdolId.You,
    kizunaSkills: [
      {
        id: 'criticalRatePlus',
        skillFields: [1.5],
      },
      {
        id: 'criticalPlus',
        skillFields: [10],
      },
      {
        id: 'spGaugeGainPlus',
        skillFields: [3],
      },
      {
        id: 'spSkillPlus',
        skillFields: [1.4],
      },
      {
        id: 'teamEffectReductionPlusVo',
        skillFields: ['voltage', 0],
      },
      {
        id: 'teamEffectReductionPlusSp',
        skillFields: ['sp', 0],
      },
      {
        id: 'teamEffectReductionPlusGd',
        skillFields: ['guard', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSk',
        skillFields: ['skill', 0.5],
      },
      {
        id: 'attributeBonusPlus',
        skillFields: [2.5],
      },
    ],
  },
  {
    id: IdolId.Setsuna,
    kizunaSkills: [
      {
        id: 'criticalRatePlus',
        skillFields: [2],
      },
      {
        id: 'criticalPlus',
        skillFields: [30],
      },
      {
        id: 'spGaugeGainPlus',
        skillFields: [3.5],
      },
      {
        id: 'spSkillPlus',
        skillFields: [1.4],
      },
      {
        id: 'teamEffectReductionPlusVo',
        skillFields: ['voltage', 0],
      },
      {
        id: 'teamEffectReductionPlusSp',
        skillFields: ['sp', 0.5],
      },
      {
        id: 'teamEffectReductionPlusGd',
        skillFields: ['guard', 0.5],
      },
      {
        id: 'teamEffectReductionPlusSk',
        skillFields: ['skill', 0.5],
      },
      {
        id: 'attributeBonusPlus',
        skillFields: [7.5],
      },
    ],
  },
];

export const userAccessories: UserAccessory[] = [
  {
    id: 'brooch_cool_1',
    accessoryId: 'brooch_cool',
    appeal: 732,
    stamina: 549,
    technique: 549,
    skillFields: [3.8],
  },
  {
    id: 'brooch_cool_2',
    accessoryId: 'brooch_cool',
    appeal: 670,
    stamina: 502,
    technique: 502,
    skillFields: [3.1],
  },
  {
    id: 'brooch_natural_1',
    accessoryId: 'brooch_natural',
    appeal: 670,
    stamina: 502,
    technique: 502,
    skillFields: [3.1],
  },
  {
    id: 'keyHolder_elegant_1',
    accessoryId: 'keyHolder_elegant',
    appeal: 732,
    stamina: 549,
    technique: 549,
    skillFields: [3.2],
  },
  {
    id: 'belt_cool_1',
    accessoryId: 'belt_cool',
    appeal: 502,
    stamina: 419,
    technique: 754,
    skillFields: ['technique', 1.1],
  },
  {
    id: 'ribbon_smile_1',
    accessoryId: 'ribbon_smile',
    appeal: 670,
    stamina: 502,
    technique: 502,
    skillFields: [315],
  },
  {
    id: 'ribbon_pure_1',
    accessoryId: 'ribbon_pure',
    appeal: 670,
    stamina: 502,
    technique: 502,
    skillFields: [315],
  },
  {
    id: 'necklace_elegant_1',
    accessoryId: 'necklace_elegant',
    appeal: 732,
    stamina: 549,
    technique: 549,
    skillFields: [1.3],
  },
  {
    id: 'bracelet_smile_1',
    accessoryId: 'bracelet_smile',
    appeal: 670,
    stamina: 502,
    technique: 502,
    skillFields: ['appeal', 3.1],
  },
  {
    id: 'bracelet_active_1',
    accessoryId: 'bracelet_active',
    appeal: 670,
    stamina: 502,
    technique: 502,
    skillFields: ['appeal', 3.0],
  },
];

export const userDeck: UserDeck = {
  id: 'test',
  title: 'test',
  cards: deckCards,
  accessories: [],
};
