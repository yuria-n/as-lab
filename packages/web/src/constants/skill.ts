import { entities, libs } from '@as-lab/core';

import rarityN from '../assets/icons/rarity_n.svg';
import rarityNr from '../assets/icons/rarity_nr.svg';
import rarityR from '../assets/icons/rarity_r.svg';
import raritySr from '../assets/icons/rarity_sr.svg';
import rarityUr from '../assets/icons/rarity_ur.svg';
import { toParamOptions } from '../utils';

const Rank = entities.InspirationSkill.Rank;
const Rarity = entities.InspirationSkill.Rarity;
const Place = entities.InspirationSkill.Place;
const Parameter = entities.Parameter;

export const personalSkillNum = 4;

export const rankMap: Record<entities.InspirationSkill.Rank, string> = {
  [Rank.None]: 'なし',
  [Rank.Small]: '小',
  [Rank.Medium]: '中',
  [Rank.Large]: '大',
  [Rank.Special]: '特',
  [Rank.Extreme]: '極',
};

export const rarityImageMap: Record<entities.InspirationSkill.Rarity, string> = {
  [Rarity.N]: rarityN,
  [Rarity.NR]: rarityNr,
  [Rarity.R]: rarityR,
  [Rarity.SR]: raritySr,
  [Rarity.UR]: rarityUr,
};

export const rarityMap: Record<entities.InspirationSkill.Rarity, string> = {
  [Rarity.N]: 'ノーマル',
  [Rarity.NR]: 'ブロンズ',
  [Rarity.R]: 'シルバー',
  [Rarity.SR]: 'ゴールド',
  [Rarity.UR]: 'レインボー',
};

export const placeTextMap: Record<entities.InspirationSkill.Place, string> = {
  [Place.Running]: 'ランニング',
  [Place.Leaflet]: 'ビラ配り',
  [Place.Meditation]: '瞑想',
  [Place.Dance]: 'ダンス',
  [Place.Voice]: 'ボイストレーニング',
  [Place.PushUp]: '腕立て伏せ',
  [Place.Stretch]: 'ストレッチ',
  [Place.Swim]: '水泳',
  [Place.Summer]: '進め！夏合宿 (2020/8/11~2020/9/26)',
};

export const skillParameterTextMap: Record<entities.Parameter, string> = {
  [Parameter.Appeal]: 'アピール',
  [Parameter.Technique]: 'テクニック',
  [Parameter.Stamina]: 'スタミナ',
  [Parameter.Sp]: 'SP',
  [Parameter.SpVoltage]: 'SPボルテージ',
  [Parameter.Critical]: 'クリティカル値',
  [Parameter.CriticalRate]: 'クリティカル率',
  [Parameter.Voltage]: 'ボルテージ',
  [Parameter.VoltageWithCritical]: 'ボルテージ（クリティカルを含む）',
  [Parameter.VoltageLimit]: 'ボルテージ上限',
  [Parameter.SpSkill]: '',
  [Parameter.SpSkillBonus]: '',
  [Parameter.DamageReduction]: 'ダメージ軽減',
  [Parameter.SpGaugeGain]: 'SPゲージ獲得量',
  [Parameter.SkillInvocation]: '特技発動率',
};

export const reductionParamTypeOptions = toParamOptions<libs.BaseSimulator.Reduction['param']>(
  [Parameter.Appeal, Parameter.SkillInvocation],
  skillParameterTextMap,
);
