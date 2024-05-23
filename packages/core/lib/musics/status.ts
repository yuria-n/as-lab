import {
  BaseParameter,
  BaseParameterMap,
  BaseRateMap,
  Deck,
  Music,
  Parameter,
  RateParameter,
  SkillEffect,
  UserCard,
  ValueParameter,
} from '../../entities';
import { PriorityQueue } from '../../utils';
import { simulator } from '../../constants';

type Until = Value | Music.Event;

export interface BaseEffect {
  type: SkillEffect;
  value?: Value;
  rate?: Rate;
  until?: Until;
}

interface RateEffect extends BaseEffect {
  type:
    | SkillEffect.AppealPlus
    | SkillEffect.TechniquePlus
    | SkillEffect.StaminaPlus
    | SkillEffect.CriticalPlus
    | SkillEffect.CriticalRatePlus
    | SkillEffect.VoltagePlus
    | SkillEffect.VoltageLimitPlus
    | SkillEffect.SpGaugeGainPlus
    | SkillEffect.SpSkillPlus
    | SkillEffect.SkillInvocationPlus
    | SkillEffect.DamageReductionPlus
    | SkillEffect.AttributeBonusPlus
    | SkillEffect.ChangeTeamPlus
    | SkillEffect.StaminaRecovery
    | SkillEffect.Revival;
  value?: never;
  rate: Rate;
}

interface RateWithUntilEffect extends BaseEffect {
  type:
    | SkillEffect.AppealUp
    | SkillEffect.VoltageUp
    | SkillEffect.TechniqueUp
    | SkillEffect.CriticalUp
    | SkillEffect.CriticalRateUp
    | SkillEffect.SpGaugeGainUp
    | SkillEffect.SkillInvocationUp
    | SkillEffect.DamageReduction;
  value?: never;
  rate: Rate;
  until: Until;
}

interface ValueEffect extends BaseEffect {
  type:
    | SkillEffect.VoltageGain
    | SkillEffect.ShieldGain
    | SkillEffect.StaminaRecovery
    | SkillEffect.Damage
    | SkillEffect.SpGaugeGain
    | SkillEffect.SpSkillUp
    | SkillEffect.ComboCount
    | SkillEffect.ChangeTeamNotesLose;
  value: Value;
  rate?: never;
  until?: never;
}

interface ValueWithUntilEffect extends BaseEffect {
  type: SkillEffect.SpSkillPlusParam;
  value: Value;
  rate?: never;
  until: Until;
}

interface NoValueEffect extends BaseEffect {
  type: SkillEffect.Deactivation;
  value?: never;
  rate?: never;
  until?: never;
}

export type Effect = RateEffect | RateWithUntilEffect | ValueEffect | ValueWithUntilEffect | NoValueEffect;

abstract class BaseStatus {
  protected readonly effectsMap = new Map<BaseEffect['type'], Set<BaseEffect>>();
  private readonly eventEffectsMap = new Map<Music.Event, BaseEffect[]>();
  private readonly effectQueue = new PriorityQueue<BaseEffect>((e1, e2) => {
    const u1 = e1.until ?? Infinity;
    const u2 = e2.until ?? Infinity;
    return u1 < u2;
  });

  prepare(notes: Value) {
    while (this.effectQueue.size() !== 0 && (this.effectQueue.peek().until ?? Infinity) < notes) {
      const effect = this.effectQueue.pop();
      this.effectsMap.get(effect.type)!.delete(effect);
    }
    return this;
  }

  clear(event: Music.Event) {
    const effects = this.eventEffectsMap.get(event);
    if (!effects) {
      return;
    }
    for (const effect of effects) {
      this.effectsMap.get(effect.type)!.delete(effect);
    }
    this.eventEffectsMap.delete(event);
    return this;
  }

  applyEffect(effect: Effect): this {
    // common types
    switch (effect.type) {
      case SkillEffect.SpGaugeGainUp:
      case SkillEffect.SpGaugeGainPlus:
      case SkillEffect.DamageReduction:
      case SkillEffect.DamageReductionPlus: {
        return this.setEffect(effect);
      }
      default: {
        throw new Error(`Invalid effect: ${effect.type}`);
      }
    }
  }

  get damageReductionRate(): Rate {
    return this.getRateByTypes(effectsMap[Parameter.DamageReduction]);
  }

  get spGaugeGainRate(): Rate {
    return this.getRateByTypes(effectsMap[Parameter.SpGaugeGain]);
  }

  protected setEffect(effect: Effect) {
    this.effectsMap.set(effect.type, this.effectsMap.get(effect.type) ?? new Set());
    this.effectsMap.get(effect.type)!.add(effect);
    this.effectQueue.push(effect);
    if (effect.until && effect.until >= Music.Event.MusicStart) {
      this.eventEffectsMap.set(effect.until, this.eventEffectsMap.get(effect.until) ?? []);
      this.eventEffectsMap.get(effect.until)!.push(effect);
    }
    return this;
  }

  protected getRate(type: Effect['type'], onlyPositive = false) {
    let rate = 0;
    const set = this.effectsMap.get(type);
    if (!set) {
      return rate;
    }
    for (const effect of set) {
      const effectRate = effect.rate ?? 0;
      if (onlyPositive && effectRate <= 0) {
        continue;
      }
      rate += effectRate;
    }
    return rate;
  }

  protected getRateByTypes(types: Effect['type'][]) {
    return types.reduce((rate, type) => rate + this.getRate(type), 0);
  }

  protected applyRate(value: Value, types: Effect['type'][], onlyPositive = false) {
    for (const type of types) {
      value *= 1 + this.getRate(type, onlyPositive);
    }
    return Math.max(0, Math.floor(value));
  }

  protected getValue(value: Value, types: Effect['type'][]) {
    for (const type of types) {
      const set = this.effectsMap.get(type);
      if (!set) {
        continue;
      }
      for (const effect of set) {
        value += effect.value ?? 0;
      }
    }
    return value;
  }
}

export interface PlayerStatusInterface {
  currentNotes: Value;
  currentTeam: Deck.Team;
  maxStamina: Value;
  maxSpGauge: Value;
  stamina: Value;
  shield: Value;
  combo: Value;
  spGauge: Value;
  totalVoltage: Value;
  spSkillUp: Value;
  changeTeamNotes: Value;
  changeTeamRecoveryBonus: Rate;
  revival: Value;
}

export class PlayerStatus extends BaseStatus implements PlayerStatusInterface {
  currentNotes: Value = 0;
  currentTeam = Deck.Team.Green;
  stamina: Value = 0;
  shield: Value = 0;
  combo: Value = 0;
  spGauge: Value = 0;
  totalVoltage: Value = 0;
  spSkillUp: Value = 0;
  changeTeamNotes: Value = 0;
  changeTeamRecoveryBonus: Rate = 0;
  revival: Value = 0;
  constructor(readonly maxStamina: Value, readonly maxSpGauge: Value) {
    super();
    this.stamina = maxStamina;
  }

  toObject(): PlayerStatusInterface {
    return {
      currentNotes: this.currentNotes,
      currentTeam: this.currentTeam,
      stamina: this.stamina,
      maxStamina: this.maxStamina,
      shield: this.shield,
      combo: this.combo,
      spGauge: this.spGauge,
      maxSpGauge: this.maxSpGauge,
      totalVoltage: this.totalVoltage,
      spSkillUp: this.spSkillUp,
      changeTeamNotes: this.changeTeamNotes,
      changeTeamRecoveryBonus: this.changeTeamRecoveryBonus,
      revival: this.revival,
    };
  }

  prepare(notes: Value) {
    this.reduceChangeTeamNotes(this.currentNotes - notes);
    this.currentNotes = notes;
    return super.prepare(notes);
  }

  isChangeTeamAvailable() {
    return this.changeTeamNotes === 0;
  }

  changeTeam(team: Deck.Team) {
    if (this.changeTeamNotes > 0) {
      throw new Error('Cannot change team');
    }
    if (this.currentTeam === team) {
      throw new Error('Next team is the same as previous one');
    }
    this.currentTeam = team;
    this.reduceChangeTeamNotes(simulator.changeTeam.notes);
    return this;
  }

  applyEffect(effect: Effect): this {
    switch (effect.type) {
      case SkillEffect.VoltageGain: {
        return this.grantVoltage(effect.value);
      }
      case SkillEffect.ShieldGain: {
        return this.grantShield(effect.value);
      }
      case SkillEffect.StaminaRecovery: {
        return effect.rate ? this.recover(Math.floor(this.maxStamina * effect.rate)) : this.recover(effect.value!);
      }
      // reduction will be calculated upper level
      case SkillEffect.Damage: {
        return this.damage(effect.value);
      }
      case SkillEffect.SpGaugeGain: {
        return this.grantSpGauge(effect.value);
      }
      case SkillEffect.SpSkillUp: {
        return this.grantSpSkillUp(effect.value);
      }
      case SkillEffect.ComboCount: {
        return this.grantCombo(effect.value);
      }
      case SkillEffect.ChangeTeamPlus: {
        return this.grantChangeTeamRecoveryBonus(effect.rate);
      }
      case SkillEffect.ChangeTeamNotesLose: {
        return this.reduceChangeTeamNotes(effect.value);
      }
      case SkillEffect.Revival: {
        return this.grantRevival(Math.floor(this.maxStamina * effect.rate));
      }
      default: {
        return super.applyEffect(effect);
      }
    }
  }

  get staminaRate(): Rate {
    return this.stamina / this.maxStamina;
  }

  isSpSkillAvailable() {
    return this.maxSpGauge === this.spGauge;
  }

  invokeSpSkill(value: Value) {
    if (!this.isSpSkillAvailable()) {
      throw new Error('Cannot invoke sp skill');
    }
    [value, this.spSkillUp] = [value + this.spSkillUp, 0];
    this.spGauge = 0;
    return value;
  }

  revive() {
    if (this.revival <= 0) {
      return false;
    }
    this.recover(this.revival);
    this.revival = 0;
    return true;
  }

  private recover(value: Value) {
    this.stamina = Math.min(this.stamina + value, this.maxStamina);
    return this;
  }

  private damage(value: Value) {
    const shieldReduction = Math.min(this.shield, value);
    this.shield -= shieldReduction;
    this.stamina = Math.max(0, this.stamina - value + shieldReduction);
    return this;
  }

  private grantShield(value: Value) {
    this.shield = Math.min(this.shield + value, this.maxStamina);
    return this;
  }

  private grantRevival(value: Value) {
    this.revival += value;
    return this;
  }

  private grantVoltage(value: Value) {
    this.totalVoltage += value;
    return this;
  }

  private grantSpGauge(value: Value) {
    this.spGauge = Math.min(this.spGauge + value, this.maxSpGauge);
    return this;
  }

  private grantSpSkillUp(value: Value) {
    this.spSkillUp += value;
    return this;
  }

  private grantCombo(value: Value) {
    this.combo += value;
    return this;
  }

  private grantChangeTeamRecoveryBonus(rate: Rate) {
    this.changeTeamRecoveryBonus += rate;
    return this;
  }

  private reduceChangeTeamNotes(value: Value) {
    this.changeTeamNotes = Math.max(0, this.changeTeamNotes + value);
    return this;
  }
}
const effectsMap: Record<BaseParameter, Effect['type'][]> = {
  [Parameter.Appeal]: [SkillEffect.AppealPlus, SkillEffect.AppealUp, SkillEffect.AttributeBonusPlus],
  [Parameter.Technique]: [SkillEffect.TechniquePlus, SkillEffect.TechniqueUp, SkillEffect.AttributeBonusPlus],
  [Parameter.Stamina]: [SkillEffect.StaminaPlus, SkillEffect.AttributeBonusPlus],
  [Parameter.Critical]: [SkillEffect.CriticalPlus, SkillEffect.CriticalUp],
  [Parameter.CriticalRate]: [SkillEffect.CriticalRatePlus, SkillEffect.CriticalRateUp],
  [Parameter.SkillInvocation]: [SkillEffect.SkillInvocationPlus, SkillEffect.SkillInvocationUp],
  [Parameter.Voltage]: [SkillEffect.VoltagePlus, SkillEffect.VoltageUp],
  [Parameter.VoltageLimit]: [SkillEffect.VoltageLimitPlus],
  [Parameter.SpSkill]: [SkillEffect.VoltagePlus, SkillEffect.VoltageUp, SkillEffect.SpSkillPlus],
  [Parameter.SpSkillBonus]: [SkillEffect.SpSkillUp, SkillEffect.SpSkillPlusParam],
  [Parameter.DamageReduction]: [SkillEffect.DamageReduction, SkillEffect.DamageReductionPlus],
  [Parameter.SpGaugeGain]: [SkillEffect.SpGaugeGainPlus, SkillEffect.SpGaugeGainUp],
};

const deactivationTypes = [
  SkillEffect.AppealUp,
  SkillEffect.VoltageUp,
  SkillEffect.TechniquePlus,
  SkillEffect.CriticalUp,
  SkillEffect.CriticalRateUp,
  SkillEffect.SpGaugeGainUp,
  SkillEffect.DamageReduction,
  SkillEffect.SkillInvocationUp,
];

export class CardStatus extends BaseStatus {
  private readonly base: BaseParameterMap;
  private readonly extra = new BaseParameterMap();
  private readonly passiveEffectRate = new BaseRateMap();
  private readonly criticalBonus: boolean;
  constructor(readonly userCard: UserCard) {
    super();
    this.base = new BaseParameterMap({
      appeal: userCard.appeal,
      technique: userCard.technique,
      stamina: userCard.stamina,
      critical: simulator.bonus.critical,
      criticalRate: 0,
    });
    this.criticalBonus =
      Math.max(this.base[Parameter.Appeal], this.base[Parameter.Technique], this.base[Parameter.Stamina]) ===
      this.base[Parameter.Technique];
  }

  addParameter(param: Record<Parameter.Appeal | Parameter.Technique | Parameter.Stamina, Value>, bonusRate: Rate) {
    this.extra.appeal += Math.floor(param.appeal * bonusRate);
    this.extra.technique += Math.floor(param.technique * bonusRate);
    this.extra.stamina += Math.floor(param.stamina * bonusRate);
    return this;
  }

  applyPassiveEffect(effect: Effect): this {
    switch (effect.type) {
      case SkillEffect.AppealPlus: {
        this.passiveEffectRate[Parameter.Appeal] += effect.rate;
        break;
      }
      case SkillEffect.TechniquePlus: {
        this.passiveEffectRate[Parameter.Technique] += effect.rate;
        break;
      }
      case SkillEffect.StaminaPlus: {
        this.passiveEffectRate[Parameter.Stamina] += effect.rate;
        break;
      }
      case SkillEffect.AttributeBonusPlus: {
        this.applyEffect(effect);
        break;
      }
      case SkillEffect.VoltagePlus: {
        this.passiveEffectRate[Parameter.Voltage] += effect.rate;
        break;
      }
      case SkillEffect.CriticalPlus: {
        this.passiveEffectRate[Parameter.Critical] += effect.rate;
        break;
      }
      case SkillEffect.CriticalRatePlus: {
        this.passiveEffectRate[Parameter.CriticalRate] += effect.rate;
        break;
      }
      case SkillEffect.SkillInvocationPlus: {
        this.passiveEffectRate[Parameter.SkillInvocation] += effect.rate;
        break;
      }
      case SkillEffect.DamageReductionPlus: {
        this.passiveEffectRate[Parameter.DamageReduction] += effect.rate;
        break;
      }
      case SkillEffect.SpGaugeGainPlus: {
        this.passiveEffectRate[Parameter.SpGaugeGain] += effect.rate;
        break;
      }
      case SkillEffect.SpSkillPlus: {
        this.passiveEffectRate[Parameter.SpSkill] += effect.rate;
        break;
      }
      default: {
        throw new Error(`Invalid effect ${effect.type}`);
      }
    }
    return this;
  }

  private getBaseValue(param: ValueParameter) {
    return this.base[param] * this.passiveEffectRate[param] + this.extra[param];
  }

  private getBaseRate(param: RateParameter) {
    return this.base[param] + this.passiveEffectRate[param] - 1 + this.extra[param];
  }

  applyEffect(effect: Effect): this {
    switch (effect.type) {
      case SkillEffect.Deactivation: {
        return this.deactivate();
      }
      case SkillEffect.AppealUp:
      case SkillEffect.AppealPlus:
      case SkillEffect.TechniqueUp:
      case SkillEffect.TechniquePlus:
      case SkillEffect.StaminaPlus:
      case SkillEffect.CriticalUp:
      case SkillEffect.CriticalPlus:
      case SkillEffect.CriticalRateUp:
      case SkillEffect.CriticalRatePlus:
      case SkillEffect.VoltageUp:
      case SkillEffect.VoltagePlus:
      case SkillEffect.VoltageLimitPlus:
      case SkillEffect.SpSkillPlus:
      case SkillEffect.SpSkillPlusParam:
      case SkillEffect.SkillInvocationUp:
      case SkillEffect.SkillInvocationPlus:
      case SkillEffect.AttributeBonusPlus: {
        return this.setEffect(effect);
      }
      default: {
        return super.applyEffect(effect);
      }
    }
  }

  private deactivate() {
    for (const type of deactivationTypes) {
      const set = this.effectsMap.get(type);
      if (!set) {
        continue;
      }
      for (const effect of set) {
        if (effect.rate && effect.rate < 0) {
          set.delete(effect);
        }
      }
    }
    return this;
  }

  get id() {
    return this.userCard.id;
  }

  get appeal(): Value {
    return this.applyRate(this.getBaseValue(Parameter.Appeal), effectsMap[Parameter.Appeal]);
  }

  get technique(): Value {
    return this.applyRate(this.getBaseValue(Parameter.Technique), effectsMap[Parameter.Technique]);
  }

  get stamina(): Value {
    return this.applyRate(this.getBaseValue(Parameter.Stamina), effectsMap[Parameter.Stamina]);
  }

  get criticalValue(): Value {
    const rate = this.getBaseRate(Parameter.Critical) + this.getRateByTypes(effectsMap[Parameter.Critical]);
    return Math.floor(this.voltage * rate);
  }

  get criticalRate(): Rate {
    const rate =
      (this.technique * simulator.critical.slope + (this.criticalBonus ? simulator.critical.intercept : 0)) / 100;
    return Math.min(
      1,
      rate + this.getBaseRate(Parameter.CriticalRate) + this.getRateByTypes(effectsMap[Parameter.CriticalRate]),
    );
  }

  get skillInvocationRate(): Rate {
    return this.getBaseRate(Parameter.SkillInvocation) + this.getRateByTypes(effectsMap[Parameter.SkillInvocation]);
  }

  get voltage(): Value {
    const rate = 1 + this.getBaseRate(Parameter.Voltage);
    return Math.max(0, this.applyRate(this.appeal * rate, effectsMap[Parameter.Voltage]));
  }

  get voltageLimitRate(): Rate {
    return 1 + this.getBaseRate(Parameter.VoltageLimit) + this.getRateByTypes(effectsMap[Parameter.VoltageLimit]);
  }

  get spVoltage(): Value {
    const appeal = this.appeal;
    const technique = this.technique * simulator.bonus.spTechnique;
    const rate = 1 + this.getBaseRate(Parameter.SpSkill);
    return this.applyRate((appeal + technique) * rate, effectsMap[Parameter.SpSkill]);
  }

  get spSkillBonus(): Value {
    return this.getValue(this.getBaseValue(Parameter.SpSkillBonus), effectsMap[Parameter.SpSkillBonus]);
  }
}
