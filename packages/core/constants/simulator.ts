import { Card, Music } from '../entities';

export const simulator = {
  teamNum: 3,
  changeTeam: {
    notes: 5,
    bonus: {
      voltage: 0.05,
      sp: 300,
      guard: 0.15,
      skill: -2,
    },
  },
  sp: {
    bonusTime: 3,
    gauge: 6000,
    gaugeGain: {
      [Card.Rarity.Ur]: 200,
      [Card.Rarity.Sr]: 150,
      [Card.Rarity.R]: 100,
    },
    voltage: {
      limit: {
        [Music.Difficulty.Easy]: 250000,
        [Music.Difficulty.Medium]: 250000,
        [Music.Difficulty.Hard]: 250000,
        [Music.Difficulty.Expert]: 500000,
      },
    },
  },
  voltage: {
    limit: {
      [Music.Difficulty.Easy]: 100000,
      [Music.Difficulty.Medium]: 100000,
      [Music.Difficulty.Hard]: 100000,
      [Music.Difficulty.Expert]: 250000,
    },
  },
  bonus: {
    team: 0.05,
    ac: 1.1,
    sp: 1.1,
    attribute: {
      card: 0.2,
      accessory: 0.1,
    },
    spTechnique: 1.2,
    critical: 1.5,
    tap: {
      [Music.TapEvent.Miss]: 0,
      [Music.TapEvent.Bad]: 0.8,
      [Music.TapEvent.Good]: 1,
      [Music.TapEvent.Great]: 1.1,
      [Music.TapEvent.Wonderful]: 1.2,
    },
    stamina: [
      {
        threshold: 0.3,
        rate: 0.6,
      },
      {
        threshold: 0.7,
        rate: 0.8,
      },
    ],
    combo: [
      {
        threshold: 70,
        voltageRate: 1.05,
        skillRate: 1,
      },
      {
        threshold: 50,
        voltageRate: 1.03,
        skillRate: 0.8,
      },
      {
        threshold: 30,
        voltageRate: 1.02,
        skillRate: 0.6,
      },
      {
        threshold: 10,
        voltageRate: 1.01,
        skillRate: 0.4,
      },
      {
        threshold: 0,
        voltageRate: 1,
        skillRate: 0.2,
      },
    ],
  },
  critical: {
    slope: 0.003,
    intercept: 14,
  },
  rate: {
    voltage: 1,
    spGaugeGain: 0,
    damageReduction: 0,
    acFailed: 20,
  },
};
