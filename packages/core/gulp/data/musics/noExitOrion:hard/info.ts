import { Card, Music } from '../../../../entities';
import { MusicInfo } from '../../../tasks';

export const info: MusicInfo = {
  title: 'No Exit Orion',
  attribute: Card.Attribute.Cool,
  difficulty: Music.Difficulty.Hard,
  spGauge: 6000,
  damage: 227,
  stamina: 47700,
  targetVoltage: 2485100,
  gimmickMap: {
    notes: [
      {
        id: 50000023,
        effect_m_id: 50014101,
        skillId: 'appealUp_success_cool',
        skillFields: [10, 10],
        conditionFields: [],
      },
      {
        id: 50000093,
        effect_m_id: 50021101,
        skillId: 'spGaugeGainUp_success_cool',
        skillFields: [10, 10],
        conditionFields: [],
      },
      {
        id: 50000003,
        effect_m_id: 50012101,
        skillId: 'skillInvocationUp_success_cool',
        skillFields: [10, 10],
        conditionFields: [],
      },
    ],
    stages: [
      {
        gimmick_master_id: 1000021,
        skill_master_id: 50004501,
        skillId: 'skillInvocationDown_always_exCool',
        skillFields: [157, 10],
        conditionFields: [],
        description: "特技発動率${'rate'}％減少",
      },
    ],
    appealChances: [
      {
        skill: null,
      },
      {
        skill: null,
      },
      {
        skill: null,
      },
      {
        skill: null,
      },
      {
        skill: null,
      },
    ],
  },
};
