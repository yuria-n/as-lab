import { Card, Music } from '../../../../entities';
import { MusicInfo } from '../../../tasks';

export const info: MusicInfo = {
  title: 'LIKE IT ! LOVE IT !',
  attribute: Card.Attribute.Cool,
  difficulty: Music.Difficulty.Hard,
  spGauge: 6000,
  damage: 450,
  stamina: 81000,
  targetVoltage: 10960000,
  gimmickMap: {
    notes: [
      {
        id: 50000368,
        effect_m_id: 50066201,
        skillId: 'appealUp_successType_skill',
        skillFields: [10, 10],
        conditionFields: ['skill'],
      },
      {
        id: 50000300,
        effect_m_id: 50065101,
        skillId: 'spGaugeGainUp_success_sp',
        skillFields: [20, 10],
        conditionFields: [],
      },
      {
        id: 50000372,
        effect_m_id: 50067101,
        skillId: 'criticalUp_success_skill',
        skillFields: [20, 50],
        conditionFields: [],
      },
      {
        id: 50000203,
        effect_m_id: 50066801,
        skillId: 'appealUp_success_sp',
        skillFields: [20, 10],
        conditionFields: [],
      },
      {
        id: 50000373,
        effect_m_id: 50067201,
        skillId: 'skillInvocationUp_success_skill',
        skillFields: [20, 50],
        conditionFields: [],
      },
    ],
    stages: [
      {
        gimmick_master_id: 1000330,
        skill_master_id: 50066601,
        skillId: 'appealDown_always_voltage',
        skillFields: [186, 20],
        conditionFields: [],
        description: "アピール${'rate'}％減少",
      },
      {
        gimmick_master_id: 1000330,
        skill_master_id: 50066601,
        skillId: 'appealDown_always_guard',
        skillFields: [186, 20],
        conditionFields: [],
        description: "アピール${'rate'}％減少",
      },
    ],
    appealChances: [
      {
        skill: {
          skillId: 'appealMinus_always_exSkill',
          skillFields: [50],
          conditionFields: [],
        },
      },
      {
        skill: {
          skillId: 'spGaugeGainPlus_always_sp',
          skillFields: [50],
          conditionFields: [],
        },
      },
      {
        skill: {
          skillId: 'staminaRecoveryType_acSuccess_none',
          skillFields: ['skill', 4000],
          conditionFields: [],
        },
      },
      {
        skill: {
          skillId: 'spSkillPlusType_always_everyone',
          skillFields: ['skill', 10],
          conditionFields: [],
        },
      },
      {
        skill: {
          skillId: 'appealMinus_always_exSp',
          skillFields: [50],
          conditionFields: [],
        },
      },
      {
        skill: {
          skillId: 'staminaRecoveryType_acSuccess_none',
          skillFields: ['skill', 4000],
          conditionFields: [],
        },
      },
      {
        skill: {
          skillId: 'spGaugeGainPlus_always_sp',
          skillFields: [50],
          conditionFields: [],
        },
      },
    ],
  },
};
