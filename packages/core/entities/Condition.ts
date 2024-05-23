/* auto generated */

import { Field } from './Field';
import { UserSkill } from './BaseSkill';

export type ConditionMap = Map<Condition['type'], Condition>;

export class Condition {
  type: Condition.Type;
  title: string;
  fields: Field[];
  description: string;
  once: boolean;
  validator?: (userSkill: UserSkill) => boolean;
}

export namespace Condition {
  export enum Type {
    Passive = 'passive', //
    Always = 'always', // 必ず発動
    Success = 'success', // 成功時
    SuccessType = 'successType', // ${'type'}で成功時
    Music = 'music', // 楽曲中
    Probability = 'probability', // 発動確率: ${'rate'}％
    Damage = 'damage', // ${'damage'}ダメージ以上受けた時に${'rate'}％の確率で発動
    DamageTimes = 'damageTimes', // ${'damage'}ダメージ以上受けた時に${'rate'}％の確率で${'times'}回だけ発動
    TargetVoltage = 'targetVoltage', // 目標ボルテージ${'voltage'}％達成時に${'rate'}％の確率で１回だけ発動
    Stamina = 'stamina', // スタミナが${'stamina'}％以下で${'rate'}％の確率で１回だけ発動
    StaminaTimes = 'staminaTimes', // スタミナが${'stamina'}％以下で${'rate'}％の確率で${'times'}回だけ発動
    ChangeTeam = 'changeTeam', // 作戦切替時に${'rate'}％の確率で発動
    ChangeTeamOnce = 'changeTeamOnce', // 作戦切替時に${'rate'}％の確率で１回だけ発動
    ChangeTeamTimes = 'changeTeamTimes', // 作戦切替時に${'rate'}％の確率で${'times'}回だけ発動
    MusicStart = 'musicStart', // 曲開始時に${'rate'}％の確率で発動
    AcStart = 'acStart', // AC開始時に${'rate'}％の確率で発動
    AcStartOnce = 'acStartOnce', // AC開始時に${'rate'}％の確率で１回だけ発動
    AcStartTimes = 'acStartTimes', // AC開始時に${'rate'}％の確率で${'times'}回だけ発動
    AcSuccess = 'acSuccess', // AC成功時に${'rate'}％の確率で発動
    AcSuccessOnce = 'acSuccessOnce', // AC成功時に${'rate'}％の確率で１回だけ発動
    AcSuccessTimes = 'acSuccessTimes', // AC成功時に${'rate'}％の確率で${'times'}回だけ発動
    AcFailed = 'acFailed', // AC失敗時に${'rate'}％の確率で発動
    SpSkill = 'spSkill', // SP特技発動時に${'rate'}％の確率で発動
    SpSkillOnce = 'spSkillOnce', // SP特技発動時に${'rate'}％の確率で１回だけ発動
    SpSkillTimes = 'spSkillTimes', // SP特技発動時に${'rate'}％の確率で${'times'}回だけ発動
    Appeal = 'appeal', // 自身のアピール時の${'rate'}％の確率で発動
    Critical = 'critical', // 自身のクリティカル時の${'rate'}％の確率で発動
    CriticalTimes = 'criticalTimes', // 自身のクリティカル時の${'rate'}％の確率で${'times'}回だけ発動
    SameAttribute = 'sameAttribute', // 楽曲と属性一致時に${'rate'}％の確率で発動
  }
}
