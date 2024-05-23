/* auto generated */

import { BaseMasterSkill, BaseSkill } from './BaseSkill';
import { Condition } from './Condition';
import { Field } from './Field';
import { SkillTarget } from './SkillTarget';

export enum SkillEffect {
  AppealUp = 'appealUp', // ${'notes'}ノーツの間アピールが${'rate'}％増加
  AppealUpAndStaminaRecovery = 'appealUpAndStaminaRecovery', // ${'notes'}ノーツの間アピールが${'rate1'}％増加 ${'parameter'}の${'rate2'}スタミナを回復
  AppealUpType = 'appealUpType', // ${'notes'}ノーツの間ライブ編成に含まれる${'type'}タイプの数×${'rate'}％アピール増加
  AppealDown = 'appealDown', // ${'notes'}ノーツの間アピールが${'rate'}％減少
  AppealDownTeam = 'appealDownTeam', // 作戦を切り替えるまでアピールを${'rate'}％減少
  AppealPlus = 'appealPlus', // 基本アピールが${'rate'}％増加
  AppealPlusStamina = 'appealPlusStamina', // ゲーム終了まで残りスタミナが多いほど基本アピールが増加（最大${'rate'}％）
  AppealPlusAndStaminaPlus = 'appealPlusAndStaminaPlus', // 基本アピールが${'rate1'}％増加 基本スタミナが${'rate2'}％増加
  AppealPlusAndTechniquePlus = 'appealPlusAndTechniquePlus', // 基本アピールが${'rate1'}％増加 基本テクニックが${'rate2'}％増加
  AppealMinus = 'appealMinus', // 基本アピールを${'rate'}％減少
  VoltageUp = 'voltageUp', // ${'notes'}ノーツの間獲得ボルテージが${'rate'}％増加
  VoltageUpAc = 'voltageUpAc', // AC終了まで獲得ボルテージが${'rate'}％増加
  VoltagePlus = 'voltagePlus', // 基本獲得ボルテージが${'rate'}％増加
  VoltageLimitPlus = 'voltageLimitPlus', // ゲーム終了まで獲得する基本獲得ボルテージの上限が${'rate'}％増加
  VoltageLimitPlusCritical = 'voltageLimitPlusCritical', // ゲーム終了までクリティカル時のみ獲得ボルテージの上限が${'rate'}％増加
  VoltageGain = 'voltageGain', // ${'parameter'}の${'rate'}％のボルテージを獲得
  VoltageGainAndAppealUp = 'voltageGainAndAppealUp', // ${'parameter'}の${'rate1'}％のボルテージを獲得し${'notes'}ノーツの間アピールが${'rate2'}％増加
  TechniqueUp = 'techniqueUp', // ${'notes'}ノーツの間テクニックが${'rate'}％上昇
  TechniquePlus = 'techniquePlus', // 基本テクニックが${'rate'}％増加
  TechniquePlusAndStaminaPlus = 'techniquePlusAndStaminaPlus', // 基本テクニックが${'rate1'}％増加 基本スタミナが${'rate2'}％増加
  CriticalUp = 'criticalUp', // ${'notes'}ノーツの間クリティカル値が${'value'}％上昇
  CriticalUpAc = 'criticalUpAc', // AC終了までクリティカル値が${'value'}％上昇
  CriticalUpType = 'criticalUpType', // ${'notes'}ノーツの間ライブ編成に含まれる${'type'}タイプの数×${'rate'}％クリティカル率上昇
  CriticalPlus = 'criticalPlus', // 基本クリティカル値が${'rate'}％上昇
  CriticalPlusCombo = 'criticalPlusCombo', // ゲーム終了まで残りコンボ数に応じて基本クリティカル値が上昇（最大${'rate'}％）
  CriticalPlusStamina = 'criticalPlusStamina', // ゲーム終了まで残りスタミナが多いほど基本クリティカル値が上昇（最大${'rate'}％）
  CriticalRateUp = 'criticalRateUp', // ${'notes'}ノーツの間クリティカル率が${'rate'}％上昇
  CriticalRateAc = 'criticalRateAc', // AC終了までクリティカル率${'rate'}％上昇
  CriticalRatePlus = 'criticalRatePlus', // 基本クリティカル率が${'rate'}％上昇
  CriticalRateUpAndCriticalUp = 'criticalRateUpAndCriticalUp', // ${'notes'}ノーツの間クリティカル率が${'rate1'}％上昇し、クリティカル値が${'rate2'}％上昇
  CriticalRateUpAndVoltageUp = 'criticalRateUpAndVoltageUp', // ${'notes'}ノーツの間クリティカル率が${'rate1'}％上昇し、獲得ボルテージが${'rate2'}％増加
  ComboCount = 'comboCount', // コンボ数を${'value'}増加
  SkillInvocationUp = 'skillInvocationUp', // ${'notes'}ノーツの間特技発動率が${'rate'}%上昇
  SkillInvocationUpAc = 'skillInvocationUpAc', // AC終了まで特技発動率が${'rate'}%上昇
  SkillInvocationPlus = 'skillInvocationPlus', // 基本特技発動率が${'rate'}％上昇
  SkillInvocationPlusStamina = 'skillInvocationPlusStamina', // ゲーム終了まで残りスタミナが多いほど基本特技発動率が上昇（最大${'rate'}％）
  SkillInvocationDown = 'skillInvocationDown', // ${'notes'}ノーツの間特技発動率が${'rate'}%減少
  SpSkillUp = 'spSkillUp', // 次に発動するSP特技で獲得するボルテージが${'parameter'}の${'rate'}％増加
  SpSkillPlus = 'spSkillPlus', // SP特技の獲得ボルテージを${'rate'}％増加
  SpSkillPlusParam = 'spSkillPlusParam', // SP特技の獲得ボルテージを${'parameter'}の${'rate'}％増加
  SpSkillPlusType = 'spSkillPlusType', // ${'type'}タイプの数×${'rate'}基本SP特技の獲得ボルテージ増加
  SpGaugeGainUp = 'spGaugeGainUp', // ${'notes'}ノーツの間SPゲージ獲得量が${'rate'}％上昇
  SpGaugeGainUpAc = 'spGaugeGainUpAc', // AC終了までSPゲージ獲得量が${'rate'}％上昇
  SpGaugeGainPlus = 'spGaugeGainPlus', // ゲーム終了時まで基本SPゲージ獲得量が${'rate'}％上昇
  SpGaugeGainMinus = 'spGaugeGainMinus', // ゲーム終了時まで基本SPゲージ獲得量が${'rate'}％減少
  SpGaugeGainPlusStamina = 'spGaugeGainPlusStamina', // ゲーム終了まで残りスタミナが多いほど基本SPゲージ獲得量が上昇（最大${'rate'}％）
  SpGaugeGain = 'spGaugeGain', // SPゲージを${'value'}獲得
  SpGaugeGainRate = 'spGaugeGainRate', // ${'parameter'}の${'rate'}％のSPゲージを獲得
  SpGaugeGainRateAndSpSkillUp = 'spGaugeGainRateAndSpSkillUp', // ${'parameter1'}の${'rate1'}％ゲージを獲得し次に発動するSP特技で獲得するボルテージが${'parameter2'}の${'rate2'}％増加
  StaminaPlus = 'staminaPlus', // 基本スタミナが${'rate'}％増加
  StaminaRecovery = 'staminaRecovery', // ${'parameter'}の${'rate'}％のスタミナを回復
  StaminaRecoveryCombo = 'staminaRecoveryCombo', // 発動時のコンボ数に応じてスタミナを回復（最大${'value'}）
  StaminaRecoveryType = 'staminaRecoveryType', // ライブ編成に含まれる${'type'}タイプの数×${'value'}スタミナを回復
  StaminaRecoveryAndShieldGain = 'staminaRecoveryAndShieldGain', // ${'parameter1'}の${'rate1'}％スタミナを回復し${'parameter2'}の${'rate2'}％シールドを獲得
  Damage = 'damage', // ${'value'}スタミナを減少
  DamageReduction = 'damageReduction', // ${'notes'}ノーツの間スタミナダメージを${'rate'}％軽減
  DamageReductionPlus = 'damageReductionPlus', // ゲーム終了までスタミナダメージを${'rate'}％軽減
  DamageReductionPlusStamina = 'damageReductionPlusStamina', // ゲーム終了まで残りスタミナが多いほどスタミナダメージを軽減（最大${'rate'}％）
  DamageReductionAc = 'damageReductionAc', // AC終了までスタミナダメージを${'rate'}％軽減
  ShieldGain = 'shieldGain', // ${'parameter'}の${'rate'}％のシールドを獲得
  ShieldGainValue = 'shieldGainValue', // シールドを${'value'}獲得
  ShieldGainValueCombo = 'shieldGainValueCombo', // 発動時のコンボ数に応じてシールドを獲得（最大${'value'}）
  Deactivation = 'deactivation', // すべての低下/減少効果を解除（基本低下/基本減少を除く）
  Revival = 'revival', // スタミナが0になると${'rate'}％回復し復活する効果を付与する
  ChangeTeamNotesLose = 'changeTeamNotesLose', // 作戦切替に必要なノーツが${'value'}減る
  ChangeTeamPlus = 'changeTeamPlus', // 作戦切替ボーナスによるスタミナ回復量を${'rate'}％上昇
  TeamEffectReductionPlus = 'teamEffectReductionPlus', // ${'type'}のマイナス作戦効果を${'rate'}％軽減
  AttributeBonusPlus = 'attributeBonusPlus', // 属性一致ボーナスを${'rate'}％上昇
  SpSkillOverChargeAndSpSkillUpEx = 'spSkillOverChargeAndSpSkillUpEx', // SP特技ゲージを${'rate1'}％までオーバーチャージ可能となり、SP特技ゲージの消費量に応じてSP特技で獲得するボルテージが最大${'rate2'}％増加
}

export interface MasterSkill extends BaseMasterSkill {
  effect: SkillEffect;
  title: string;
  slug: string;
  description: string;
  fields: Field[];
}

export interface Skill extends BaseSkill {
  id: string;
  effect: SkillEffect;
  title: string;
  description: string;
  slug: string;
  fields: Field[];
  condition: Condition.Type;
  target: SkillTarget;
}

export enum Parameter {
  Appeal = 'appeal', // value
  Technique = 'technique', // value
  Stamina = 'stamina', // value
  Sp = 'sp', // value 最大SP
  SpVoltage = 'spVoltage', // value Spボルテージ
  Critical = 'critical', // rate クリティカル値
  CriticalRate = 'criticalRate', // rate クリティカル率
  Voltage = 'voltage', // rate ボルテージ
  VoltageWithCritical = 'voltageWithCritical', // rate ボルテージ＋クリティカル
  VoltageLimit = 'voltageLimit', // value ボルテージの最大値
  SpSkill = 'spSkill', // rate Sp特技の獲得ボルテージ増加
  SpSkillBonus = 'spSkillBonus', // value Spボルテージ獲得量増加
  DamageReduction = 'damageReduction', // rate スタミナ減少量
  SpGaugeGain = 'spGaugeGain', // rate SPゲージ獲得量増加
  SkillInvocation = 'skillInvocation', // rate 特技発動率
}

export type ValueParameter = Parameter.Appeal | Parameter.Stamina | Parameter.Technique | Parameter.SpSkillBonus;
export type RateParameter =
  | Parameter.Critical
  | Parameter.CriticalRate
  | Parameter.Voltage
  | Parameter.VoltageLimit
  | Parameter.SpSkill
  | Parameter.DamageReduction
  | Parameter.SpGaugeGain
  | Parameter.SkillInvocation;
export type BaseParameter = ValueParameter | RateParameter;

export class BaseParameterMap implements Record<BaseParameter, Value | Rate> {
  [Parameter.Appeal]: Value = 0;
  [Parameter.Stamina]: Value = 0;
  [Parameter.Technique]: Value = 0;
  [Parameter.Critical]: Rate = 0;
  [Parameter.CriticalRate]: Rate = 0;
  [Parameter.DamageReduction]: Rate = 0;
  [Parameter.SkillInvocation]: Rate = 0;
  [Parameter.SpGaugeGain]: Rate = 0;
  [Parameter.SpSkill]: Rate = 0;
  [Parameter.SpSkillBonus]: Value = 0;
  [Parameter.Voltage]: Rate = 0;
  [Parameter.VoltageLimit]: Rate = 0;
  constructor(params: Partial<Record<Parameter, Value | Rate>> = {}) {
    Object.assign(this, params);
  }
}

export class BaseRateMap implements Record<BaseParameter, Rate> {
  [Parameter.Appeal]: Rate = 1;
  [Parameter.Stamina]: Rate = 1;
  [Parameter.Technique]: Rate = 1;
  [Parameter.Critical]: Rate = 1;
  [Parameter.CriticalRate]: Rate = 1;
  [Parameter.DamageReduction]: Rate = 1;
  [Parameter.SkillInvocation]: Rate = 1;
  [Parameter.SpGaugeGain]: Rate = 1;
  [Parameter.SpSkill]: Rate = 1;
  [Parameter.SpSkillBonus]: Rate = 1;
  [Parameter.Voltage]: Rate = 1;
  [Parameter.VoltageLimit]: Rate = 1;
  constructor(params: Partial<Record<Parameter, Rate>> = {}) {
    Object.assign(this, params);
  }
}
