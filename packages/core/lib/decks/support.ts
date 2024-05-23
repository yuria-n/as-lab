import {
  Card,
  CardSkill,
  Condition,
  Field,
  Grade,
  Idol,
  InspirationSkill,
  KizunaSkill,
  Music,
  Parameter,
  School,
  Skill,
  SkillEffect,
  SkillMap,
  SkillTarget,
  UserCard,
  UserFriend,
  UserIdol,
  UserSkill,
} from '../../entities';
import { CardStatus, Effect as BaseEffect, exAttributeMap, exTypeMap } from '../musics';
import { assert, groupBy, toMap } from '../../utils';
import { simulator } from '../../constants';

export namespace BaseSimulator {
  export type Parameter =
    | Parameter.Voltage
    | Parameter.Appeal
    | Parameter.Technique
    | Parameter.Stamina
    | Parameter.SpVoltage
    | Parameter.SkillInvocation;

  export type ReductionTarget = Card.Type | Card.Attribute | Grade | School;

  export interface Reduction {
    targets?: ReductionTarget[];
    param: Parameter.Appeal | Parameter.SkillInvocation;
    rate: number;
  }

  export interface Options {
    notes: Value;
    acCount: Value;
    attribute?: Card.Attribute;
    reduction?: Reduction;
    school?: School;
    schoolBonus?: Value;
    grade?: Grade;
    gradeBonus?: Value;
    voltageLimit?: Rate;
    damage: Value;
    wonderful: Rate;
    spGauge: Value;
    spGaugeGain: Record<Card.Rarity, Value>;
    changeTeam: Value;
  }
}

export abstract class BaseSimulator {
  protected constructor(
    protected readonly conditionMap: Map<Condition['type'], Condition>,
    protected readonly options: BaseSimulator.Options,
  ) {}

  protected applyAttributeBonusAndReduction(supportCard: SupportCard): SupportCard {
    const attribute = this.options.attribute ?? Card.Attribute.None;
    if (supportCard.card.attribute === attribute) {
      supportCard.applyEffect({
        type: SkillEffect.AttributeBonusPlus,
        rate: simulator.bonus.attribute.card,
      });
    }
    return this.applyReduction(supportCard, this.options.reduction);
  }

  protected applyReduction(supportCard: SupportCard, reduction?: BaseSimulator.Reduction): SupportCard {
    if (!reduction) {
      return supportCard;
    }
    const {
      param,
      rate,
      targets = Object.values(Card.Attribute).filter((attr) => attr !== this.options.attribute),
    } = reduction;
    const available = targets.some((target: BaseSimulator.ReductionTarget) => {
      switch (target) {
        case Card.Type.Vo:
        case Card.Type.Sp:
        case Card.Type.Gd:
        case Card.Type.Sk: {
          return supportCard.card.type === target;
        }
        case Card.Attribute.None:
        case Card.Attribute.Smile:
        case Card.Attribute.Pure:
        case Card.Attribute.Cool:
        case Card.Attribute.Active:
        case Card.Attribute.Natural:
        case Card.Attribute.Elegant: {
          return supportCard.card.attribute === target;
        }
        case Grade.First:
        case Grade.Second:
        case Grade.Third: {
          return supportCard.idol.grade === target;
        }
        case School.Muse:
        case School.Aqua:
        case School.Niji: {
          return supportCard.idol.school === target;
        }
      }
    });
    if (!available) {
      return supportCard;
    }
    switch (param) {
      case Parameter.Appeal: {
        return supportCard.applyEffect({
          type: SkillEffect.AppealPlus,
          rate: -rate,
        });
      }
      case Parameter.SkillInvocation: {
        return supportCard.applyEffect({
          type: SkillEffect.SkillInvocationPlus,
          rate: -rate,
        });
      }
    }
  }

  protected applyIdolBonus(supportCard: SupportCard): SupportCard {
    if (supportCard.idol.school === this.options.school && this.options.schoolBonus) {
      supportCard.applyEffect({
        type: SkillEffect.AttributeBonusPlus,
        rate: this.options.schoolBonus,
      });
    }
    if (supportCard.idol.grade === this.options.grade && this.options.gradeBonus) {
      supportCard.applyEffect({
        type: SkillEffect.AttributeBonusPlus,
        rate: this.options.gradeBonus,
      });
    }
    return supportCard;
  }

  protected applyVoltageLimit(supportCard: SupportCard): SupportCard {
    if (!this.options.voltageLimit) {
      return supportCard;
    }
    return supportCard.applyEffect({
      type: SkillEffect.VoltageLimitPlus,
      rate: this.options.voltageLimit,
    });
  }

  protected applyEffects(supportCards: SupportCard[], helpers: EffectHelper[]): this {
    if (supportCards.length === 0) {
      return this;
    }
    for (const orders of effectDependencyOrders) {
      for (const effect of orders) {
        const effects: { actress: SupportCard; target: SkillTarget; effect: SupportEffect }[] = [];
        for (const [index, helper] of helpers.entries()) {
          const actress = supportCards[index];
          for (const condition of conditionOrder) {
            if (!actress.sameTeam && condition === Condition.Type.Probability) {
              continue;
            }
            const effectValuesMap = helper.getMap(condition);
            if (!effectValuesMap) {
              continue;
            }
            const effectValues = effectValuesMap.get(effect);
            if (!effectValues) {
              continue;
            }
            for (const effectValue of effectValues) {
              for (const effect of this.getEffect(actress, effectValue)) {
                effects.push({ actress, target: effectValue.target, effect });
              }
            }
          }
        }
        // ensure effects to use previous parameters
        for (const { actress, target, effect } of effects) {
          this.applyEffect(actress, supportCards, target, effect);
        }
      }
    }
    return this;
  }

  protected getEffect(actress: SupportCard, effectValue: EffectValue): SupportEffect[] {
    const conditionRate = this.getConditionRate(actress, effectValue);
    const payload = this.getPayload(actress, effectValue);
    switch (effectValue.effect) {
      case SkillEffect.AppealUp:
      case SkillEffect.VoltageUp:
      case SkillEffect.TechniqueUp:
      case SkillEffect.CriticalUp:
      case SkillEffect.CriticalRateUp:
      case SkillEffect.SkillInvocationUp:
      case SkillEffect.SpGaugeGainUp: {
        assert('rate' in payload, 'Value payload not supported');
        const rate = payload.rate * conditionRate;
        return [{ type: effectValue.effect, rate, until: Infinity }];
      }
      case SkillEffect.AppealPlus:
      case SkillEffect.VoltagePlus:
      case SkillEffect.TechniquePlus:
      case SkillEffect.CriticalPlus:
      case SkillEffect.CriticalRatePlus:
      case SkillEffect.SkillInvocationPlus:
      case SkillEffect.SpGaugeGainPlus:
      case SkillEffect.SpSkillPlus:
      case SkillEffect.StaminaPlus:
      case SkillEffect.VoltageLimitPlus:
      case SkillEffect.AttributeBonusPlus: {
        if (
          effectValue.effect === SkillEffect.AttributeBonusPlus &&
          actress.card.attribute !== this.options.attribute
        ) {
          return [];
        }
        assert('rate' in payload, 'Value payload not supported');
        const rate = payload.rate * conditionRate;
        return [{ type: effectValue.effect, rate, team: payload.team }];
      }
      case SkillEffect.SpGaugeGain:
      case SkillEffect.SpGaugeGainRate: {
        assert('value' in payload, 'Rate payload not supported');
        const value = payload.value * conditionRate;
        return [{ type: SkillEffect.SpGaugeGain, value }];
      }
      case SkillEffect.DamageReduction:
      case SkillEffect.DamageReductionPlus: {
        assert('rate' in payload, 'Value payload not supported');
        const value = payload.rate * this.options.damage * conditionRate;
        return [{ type: SkillEffect.Damage, value }];
      }
      case SkillEffect.StaminaRecovery:
      case SkillEffect.VoltageGain:
      case SkillEffect.SpSkillUp:
      case SkillEffect.ShieldGain: {
        assert('value' in payload, 'Rate payload not supported');
        const value = payload.value * conditionRate;
        return [{ type: effectValue.effect, value }];
      }
      case SkillEffect.TeamEffectReductionPlus: {
        assert('rate' in payload, 'Value payload not supported');
        assert(payload.effect, 'Effect should exist');
        return [{ type: effectValue.effect, rate: payload.rate, effect: payload.effect, team: true }];
      }
      case SkillEffect.ChangeTeamNotesLose: {
        return [];
      }
      // TODO: implement other effects
      default: {
        return [];
      }
    }
  }

  private getConditionRate(actress: SupportCard, effectValue: EffectValue): Rate {
    const condition = this.conditionMap.get(effectValue.condition.type);
    assert(condition, 'Condition should exist');
    const baseRate = EffectSimulator.getRateField(condition.fields, 'rate', effectValue.condition.fields);
    const limit = EffectSimulator.getField(condition.fields, 'times', effectValue.condition.fields, 0);

    const onceDivider = effectValue.effect.endsWith('Plus') ? 1 : this.options.notes;
    switch (condition.type) {
      case Condition.Type.Passive: {
        return 1;
      }
      // skill
      case Condition.Type.Probability: {
        const base = Math.max(0, Math.min(1, baseRate + actress.skillInvocationRate));
        return base / simulator.teamNum;
      }
      // TODO: these skills are not player skills
      case Condition.Type.Always:
      case Condition.Type.Success:
      case Condition.Type.SuccessType:
      case Condition.Type.Music: {
        return 0;
      }
      case Condition.Type.Damage:
      case Condition.Type.DamageTimes: {
        const damage = EffectSimulator.getField(condition.fields, 'damage', effectValue.condition.fields, 0);
        const rate = limit > 0 ? (baseRate * limit) / this.options.notes : baseRate;
        return this.options.damage >= damage ? rate : 0;
      }
      case Condition.Type.TargetVoltage: {
        return baseRate / this.options.notes;
      }
      // TODO: depends on music difficulty
      case Condition.Type.Stamina:
      case Condition.Type.StaminaTimes: {
        return 0;
      }
      // TODO: depends on change team settings
      case Condition.Type.ChangeTeam: {
        return baseRate * (this.options.changeTeam / this.options.notes);
      }
      case Condition.Type.ChangeTeamOnce: {
        return baseRate / onceDivider;
      }
      case Condition.Type.ChangeTeamTimes: {
        const count = Math.max(this.options.changeTeam, limit);
        return baseRate * (count / this.options.notes);
      }
      // TODO: change by effect type
      case Condition.Type.MusicStart: {
        return baseRate / onceDivider;
      }
      case Condition.Type.AcStart:
      case Condition.Type.AcSuccess: {
        return baseRate * (this.options.acCount / this.options.notes);
      }
      case Condition.Type.AcStartOnce:
      case Condition.Type.AcSuccessOnce: {
        return baseRate / onceDivider;
      }
      case Condition.Type.AcStartTimes:
      case Condition.Type.AcSuccessTimes: {
        return (baseRate * limit) / this.options.notes;
      }
      case Condition.Type.AcFailed: {
        return 0;
      }
      case Condition.Type.SpSkill: {
        const requiredNotes = this.options.spGauge / actress.spGaugeGain;
        const count = this.options.notes / requiredNotes;
        return (baseRate * count) / this.options.notes;
      }
      case Condition.Type.SpSkillOnce: {
        return baseRate / onceDivider;
      }
      case Condition.Type.SpSkillTimes: {
        const requiredNotes = this.options.spGauge / actress.spGaugeGain;
        const count = Math.min(limit, this.options.notes / requiredNotes);
        return (baseRate * count) / this.options.notes;
      }
      case Condition.Type.Appeal: {
        return baseRate / simulator.teamNum;
      }
      case Condition.Type.Critical: {
        return (baseRate * actress.criticalRate) / simulator.teamNum;
      }
      case Condition.Type.CriticalTimes: {
        return ((baseRate * actress.criticalRate) / this.options.notes) * simulator.teamNum;
      }
      case Condition.Type.SameAttribute: {
        return actress.card.attribute === this.options.attribute ? baseRate : 0;
      }
      // TODO:
      default: {
        throw new Error('Not implemented!!');
      }
    }
  }

  private getPayload(actress: SupportCard, { payload }: EffectValue): ValuePayload | RatePayload {
    if ('param' in payload) {
      switch (payload.param) {
        case Parameter.Sp: {
          return {
            type: EffectPayloadType.Value,
            value: this.options.spGauge * payload.rate,
          };
        }
        default: {
          return {
            type: EffectPayloadType.Value,
            value: actress[payload.param] * payload.rate,
          };
        }
      }
    }
    return payload;
  }

  private applyEffect<T extends SupportEffect>(
    actress: SupportCard | null,
    supportCards: SupportCard[],
    target: SkillTarget,
    effect: T,
  ): this {
    switch (target) {
      case SkillTarget.Everyone: {
        for (const supportCard of supportCards) {
          supportCard.applyEffect(effect);
        }
        return this;
      }
      case SkillTarget.Voltage:
      case SkillTarget.Sp:
      case SkillTarget.Guard:
      case SkillTarget.Skill: {
        for (const supportCard of supportCards) {
          if (supportCard.card.type === (target as string)) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
      case SkillTarget.ExVoltage:
      case SkillTarget.ExSp:
      case SkillTarget.ExGuard:
      case SkillTarget.ExSkill: {
        const type = exTypeMap.get(target);
        for (const supportCard of supportCards) {
          if (supportCard.card.type !== type) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
      case SkillTarget.Smile:
      case SkillTarget.Pure:
      case SkillTarget.Cool:
      case SkillTarget.Active:
      case SkillTarget.Natural:
      case SkillTarget.Elegant: {
        for (const supportCard of supportCards) {
          if (supportCard.card.attribute === (target as string)) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
      case SkillTarget.ExSmile:
      case SkillTarget.ExPure:
      case SkillTarget.ExCool:
      case SkillTarget.ExActive:
      case SkillTarget.ExNatural:
      case SkillTarget.ExElegant: {
        const attribute = exAttributeMap.get(target);
        for (const supportCard of supportCards) {
          if (supportCard.card.attribute !== attribute) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
    }
    if (!actress) {
      throw new Error('Actress is required');
    }
    switch (target) {
      case SkillTarget.None: {
        actress.applyEffect(effect);
        return this;
      }
      case SkillTarget.Myself: {
        actress.applyEffect(effect);
        return this;
      }
      case SkillTarget.SameTeam: {
        if (!actress.sameTeam) {
          return this;
        }
        for (const supportCard of supportCards) {
          supportCard.applyEffect(effect);
        }
        return this;
      }
      case SkillTarget.SameGrade: {
        for (const supportCard of supportCards) {
          if (supportCard.idol.grade === actress.idol.grade) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
      case SkillTarget.SameSchool: {
        for (const supportCard of supportCards) {
          if (supportCard.idol.school === actress.idol.school) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
      case SkillTarget.Friends: {
        for (const supportCard of supportCards) {
          if (supportCard !== actress) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
      case SkillTarget.SameType: {
        for (const supportCard of supportCards) {
          if (supportCard.card.type === actress.card.type) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
      case SkillTarget.SameAttribute: {
        for (const supportCard of supportCards) {
          if (supportCard.card.attribute === actress.card.attribute) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
      case SkillTarget.Honoka:
      case SkillTarget.Eri:
      case SkillTarget.Kotori:
      case SkillTarget.Umi:
      case SkillTarget.Rin:
      case SkillTarget.Maki:
      case SkillTarget.Nozomi:
      case SkillTarget.Hanayo:
      case SkillTarget.Niko:
      case SkillTarget.Chika:
      case SkillTarget.Riko:
      case SkillTarget.Kanan:
      case SkillTarget.Dia:
      case SkillTarget.You:
      case SkillTarget.Yoshiko:
      case SkillTarget.Hanamaru:
      case SkillTarget.Mari:
      case SkillTarget.Ruby:
      case SkillTarget.Ayumu:
      case SkillTarget.Kasumi:
      case SkillTarget.Shizuku:
      case SkillTarget.Karin:
      case SkillTarget.Ai:
      case SkillTarget.Kanata:
      case SkillTarget.Setsuna:
      case SkillTarget.Emma:
      case SkillTarget.Rina: {
        for (const supportCard of supportCards) {
          if (supportCard.idol.id === (target as string)) {
            supportCard.applyEffect(effect);
          }
        }
        return this;
      }
    }
  }
}

type Options = DeckSupportSimulator.Options & typeof DeckSupportSimulator.defaultOptions;

export class DeckSupportSimulator extends BaseSimulator {
  static readonly defaultOptions: Required<Pick<DeckSupportSimulator.Options, DeckSupportSimulator.DefaultOption>> = {
    notes: 150,
    acCount: 5,
    reduction: { param: Parameter.Appeal, rate: 0.2 },
    schoolBonus: 0.2,
    gradeBonus: 0.2,
    voltageLimit: 0.2,
    damage: 300,
    wonderful: 1,
    difficulty: Music.Difficulty.Hard,
    spGauge: 6000,
    spGaugeGain: simulator.sp.gaugeGain,
    changeTeam: 1,
  };
  protected readonly options: Options;
  private readonly effectSimulator: EffectSimulator;
  private readonly idolMap: Map<Id, Idol>;
  private readonly cardMap: Map<Id, Card>;
  private readonly userCards: UserCard[];
  private readonly userIdolMap: Map<UserIdol['id'], UserIdol>;
  constructor(
    private readonly idols: Idol[],
    private readonly cards: Card[],
    private readonly skillMap: SkillMap<Skill>,
    private readonly conditions: Condition[],
    private readonly inspirationSkills: InspirationSkill[],
    private readonly kizunaSkills: KizunaSkill[],
    private readonly userIdols: UserIdol[],
    userCards: UserCard[],
    options: DeckSupportSimulator.Options = {},
  ) {
    super(toMap(conditions, 'type'), {
      ...DeckSupportSimulator.defaultOptions,
      ...options,
    });

    this.idolMap = toMap(idols, 'id');
    this.cardMap = toMap(cards, 'id');
    this.userCards = userCards.filter((card) => (this.cardMap.get(card.id)?.rarity ?? Card.Rarity.R) !== Card.Rarity.R);
    this.userIdolMap = toMap(userIdols, 'id');
    this.effectSimulator = new EffectSimulator(
      this.cardMap,
      this.skillMap,
      toMap(inspirationSkills, 'id'),
      toMap(kizunaSkills, 'id'),
      this.userIdolMap,
      this.options.centerCardId ?? null,
      this.options.friend ?? null,
    );
  }

  /**
   * it simulates all effects to user cards with selected card effects
   */
  simulate(): DeckSupportSimulator.Result {
    const selectedCardSet = new Set(this.options.selectedCardIds);
    const selectedUserCards = this.userCards.filter((card) => selectedCardSet.has(card.id));
    const otherUserCards = this.userCards.filter((card) => !selectedCardSet.has(card.id));
    const selectedCards = this.simulateTeam(selectedUserCards, []);
    const selectedTotalVoltage = this.getTotalVoltage(selectedCards);
    const otherCards = otherUserCards.map((userCard) => {
      const supportCards = this.simulateTeam([...selectedUserCards, userCard], []);
      const supportCard = supportCards.find((card) => card.id === userCard.id);
      assert(supportCard, 'Support card should exist');
      supportCard.setTeamScore(this.getTeamScore(supportCards));
      if (selectedUserCards.length === 0) {
        return supportCard;
      }
      const supportScore =
        this.getTotalVoltage(this.simulateTeam(selectedUserCards, [userCard])) - selectedTotalVoltage;
      return supportCard.setSupportScore(supportScore);
    });
    const selectedTeamScore = this.getTeamScore(selectedCards);
    return { selectedCards: selectedCards.map((card) => card.setTeamScore(selectedTeamScore)), otherCards };
  }

  private getTotalVoltage(cards: SupportCard[]) {
    return cards.reduce((sum, card) => sum + card.totalVoltage, 0);
  }

  private getTeamScore(cards: SupportCard[]) {
    return (this.getTotalVoltage(cards) / cards.length) * simulator.teamNum;
  }

  /**
   * simulate team effects and scores
   */
  simulateTeam(selectedCards: UserCard[], supportUserCards: UserCard[]): SupportCard[] {
    const supportCardSet = new Set(supportUserCards);
    const userCards = [...selectedCards, ...supportUserCards];
    const helpers = userCards.map((userCard) => this.effectSimulator.getHelper(userCard));
    const supportCards: SupportCard[] = userCards
      .map((userCard) => {
        const card = this.cardMap.get(userCard.id);
        assert(card, 'Card should exist');
        const idol = this.idolMap.get(card.idolId);
        assert(idol, 'Idol should exist');
        return new SupportCard(userCard, card, idol, !supportCardSet.has(userCard), this.options);
      })
      .map((supportCard) => this.applyAttributeBonusAndReduction(supportCard))
      .map((supportCard) => this.applyIdolBonus(supportCard))
      .map((supportCard) => this.applyVoltageLimit(supportCard));
    this.applyEffects(supportCards, helpers);
    return supportCards.filter((card) => card.sameTeam);
  }
}

type SupportEffect =
  | BaseEffect
  | {
      type: TeamEffect;
      rate: Rate;
      team?: true;
    }
  | {
      type: SkillEffect.TeamEffectReductionPlus;
      rate: Rate;
      effect: TeamEffect;
      team: true;
    };

// TODO: rename
export class SupportCard extends CardStatus implements DeckSupportSimulator.SupportCard {
  private valueEffectMap = {
    [SkillEffect.VoltageGain]: 0,
    [SkillEffect.ShieldGain]: 0,
    [SkillEffect.SpGaugeGain]: 0,
    [SkillEffect.SpSkillUp]: 0, // sp voltage gain
    [SkillEffect.StaminaRecovery]: 0,
    [SkillEffect.Damage]: 0, // damage reduction
  };
  private teamReductionMap: Record<TeamEffect, number> = {
    [SkillEffect.DamageReductionPlus]: 0,
    [SkillEffect.SkillInvocationPlus]: 0,
    [SkillEffect.SpGaugeGainPlus]: 0,
    [SkillEffect.VoltagePlus]: 0,
  };
  teamScore = 0;
  supportScore = 0;
  constructor(
    userCard: UserCard,
    readonly card: Card,
    readonly idol: Idol,
    readonly sameTeam: boolean,
    private readonly options: Options,
  ) {
    super(userCard);
  }

  /**
   * This Effect should be transformed by DeckSupportSimulator#getEffect
   */
  applyEffect(effect: SupportEffect): this {
    if ('team' in effect && effect.team) {
      if (effect.type === SkillEffect.TeamEffectReductionPlus) {
        this.teamReductionMap[effect.effect] += effect.rate;
        return this;
      }
      if (effect.rate < 0) {
        const reduction = Math.min(-effect.rate, this.teamReductionMap[effect.type]);
        this.teamReductionMap[effect.type] -= reduction;
        effect = { ...effect, rate: effect.rate + reduction };
      }
    }
    switch (effect.type) {
      case SkillEffect.VoltageGain:
      case SkillEffect.ShieldGain:
      case SkillEffect.SpGaugeGain:
      case SkillEffect.SpSkillUp:
      case SkillEffect.StaminaRecovery:
      case SkillEffect.Damage: {
        if (effect.value === 0) {
          return this;
        }
        assert(effect.value, 'Value should exist');
        this.valueEffectMap[effect.type] += effect.value;
        return this;
      }
      default: {
        try {
          return super.applyEffect(effect);
        } catch (err) {
          console.error({ err, effect });
          return this;
        }
      }
    }
  }

  setTeamScore(score: Value) {
    this.teamScore = score;
    return this;
  }

  setSupportScore(score: Value) {
    this.supportScore = score;
    return this;
  }

  private get tapRate() {
    return (
      this.options.wonderful * simulator.bonus.tap[Music.TapEvent.Wonderful] +
      (1 - this.options.wonderful) * simulator.bonus.tap[Music.TapEvent.Great]
    );
  }

  get totalVoltage(): Value {
    const voltage = this.voltageWithCritical / simulator.teamNum;
    const spCount = (this.spGaugeGain * this.options.notes) / this.options.spGauge;
    const spVoltage = (this.spVoltage * spCount) / this.options.notes;
    return voltage + this.voltageGain + spVoltage;
  }

  get voltage(): Value {
    return Math.min(super.voltage * this.tapRate, this.voltageLimit);
  }

  get voltageWithCritical(): Value {
    return this.voltage * (1 - this.criticalRate) + this.criticalValue * this.criticalRate;
  }

  get voltageLimit(): Value {
    return simulator.voltage.limit[this.options.difficulty] * super.voltageLimitRate;
  }

  get criticalValue(): Value {
    return Math.min(super.criticalValue * this.tapRate, this.voltageLimit);
  }

  get spVoltage() {
    return super.spVoltage + this.spSkillBonus;
  }

  get voltageGain(): Value {
    return this.valueEffectMap[SkillEffect.VoltageGain];
  }

  get spVoltageGain() {
    return this.valueEffectMap[SkillEffect.SpSkillUp];
  }

  get staminaRecovery(): Value {
    return this.valueEffectMap[SkillEffect.StaminaRecovery];
  }

  get shieldGain(): Value {
    return this.valueEffectMap[SkillEffect.ShieldGain];
  }

  get staminaAndShield() {
    return this.staminaRecovery + this.shieldGain;
  }

  get damageReduction() {
    return this.valueEffectMap[SkillEffect.Damage];
  }

  get spGaugeGain() {
    const rate = 1 + this.spGaugeGainRate;
    return simulator.sp.gaugeGain[this.card.rarity] * rate + this.valueEffectMap[SkillEffect.SpGaugeGain];
  }
}

export class EffectSimulator {
  static setField(fields: Field[], name: Name, userFields: any[], value: any) {
    userFields = [...userFields];
    const index = fields.findIndex((field) => field.name === name);
    if (index === -1) {
      console.error(`${name} not found in ${fields}`);
      return userFields;
    }
    userFields[index] = value;
    return userFields;
  }

  static getField<T>(fields: Field[], name: Name, userFields: any[], defaultValue: T): T {
    const index = fields.findIndex((field) => field.name === name);
    return userFields[index] ?? defaultValue;
  }

  static getRateField(fields: Field[], name: Name, userFields: any[]) {
    return this.getField(fields, name, userFields, 0) / 100;
  }

  private readonly helperMap: Map<UserCard['id'], EffectHelper> = new Map();

  constructor(
    private readonly cardMap: Map<Card['id'], Card>,
    private readonly skillMap: Map<Skill['id'], Skill>,
    private readonly inspirationSkillMap: Map<InspirationSkill['id'], InspirationSkill>,
    private readonly kizunaSkillMap: Map<KizunaSkill['id'], KizunaSkill>,
    private readonly userIdolMap: Map<UserIdol['id'], UserIdol>,
    private centerCardId: UserCard['id'] | null,
    private readonly friend: UserFriend | null,
  ) {}

  getCenterCardId() {
    return this.centerCardId;
  }

  setCenterCardId(cardId: UserCard['id']) {
    if (this.centerCardId) {
      this.helperMap.delete(this.centerCardId);
    }
    this.centerCardId = cardId;
    this.helperMap.delete(cardId);
    return this;
  }

  getHelper(userCard: UserCard): EffectHelper {
    if (this.helperMap.has(userCard.id)) {
      return this.helperMap.get(userCard.id)!;
    }
    const helper = new EffectHelper();
    const card = this.cardMap.get(userCard.id);
    assert(card, `Card not found. cardId: ${userCard.id}`);
    const rate = simulator.bonus.team;
    switch (card.type) {
      case Card.Type.Vo: {
        helper
          .set(Condition.Type.Passive, [], SkillEffect.VoltagePlus, SkillTarget.SameTeam, {
            type: EffectPayloadType.Rate,
            rate,
            team: true,
          })
          .set(Condition.Type.Passive, [], SkillEffect.DamageReductionPlus, SkillTarget.SameTeam, {
            type: EffectPayloadType.Rate,
            rate: -rate,
            team: true,
          });
        break;
      }
      case Card.Type.Sp: {
        helper
          .set(Condition.Type.Passive, [], SkillEffect.SpGaugeGainPlus, SkillTarget.SameTeam, {
            type: EffectPayloadType.Rate,
            rate,
            team: true,
          })
          .set(Condition.Type.Passive, [], SkillEffect.SkillInvocationPlus, SkillTarget.SameTeam, {
            type: EffectPayloadType.Rate,
            rate: -rate,
            team: true,
          });
        break;
      }
      case Card.Type.Gd: {
        helper
          .set(Condition.Type.Passive, [], SkillEffect.DamageReductionPlus, SkillTarget.SameTeam, {
            type: EffectPayloadType.Rate,
            rate,
            team: true,
          })
          .set(Condition.Type.Passive, [], SkillEffect.SpGaugeGainPlus, SkillTarget.SameTeam, {
            type: EffectPayloadType.Rate,
            rate: -rate,
            team: true,
          });
        break;
      }
      case Card.Type.Sk: {
        helper
          .set(Condition.Type.Passive, [], SkillEffect.SkillInvocationPlus, SkillTarget.SameTeam, {
            type: EffectPayloadType.Rate,
            rate,
            team: true,
          })
          .set(Condition.Type.Passive, [], SkillEffect.VoltagePlus, SkillTarget.SameTeam, {
            type: EffectPayloadType.Rate,
            rate: -rate,
            team: true,
          });
        break;
      }
    }

    const skill = this.skillMap.get(card.skill.skillId);
    if (skill) {
      this.applyEffect(helper, skill, userCard.skill);
    }
    this.applyPersonalSkills(helper, card.personalSkills, userCard.personalSkills);
    this.applyInspirationSkills(helper, userCard.inspirationSkillIds);
    if (card.id === this.centerCardId && this.friend) {
      const friendCard = this.cardMap.get(this.friend.card.id);
      assert(friendCard, 'Friend card id is invalid');
      this.applyPersonalSkills(helper, friendCard.personalSkills, this.friend.card.personalSkills);
      this.applyInspirationSkills(helper, this.friend.card.inspirationSkillIds);
    }

    const kizunaSkills = this.userIdolMap.get(card.idolId)?.kizunaSkills ?? [];
    for (const userSkill of kizunaSkills) {
      const kizunaSkill = this.kizunaSkillMap.get(userSkill.id);
      assert(kizunaSkill, 'Kizuna skill should exist');
      const skill = this.skillMap.get(kizunaSkill.skillId);
      assert(skill, 'Skill should exist');
      this.applyEffect(helper, skill, {
        skillFields: userSkill.skillFields,
        conditionFields: kizunaSkill.conditionFields,
      });
    }

    this.helperMap.set(userCard.id, helper);
    return helper;
  }

  private applyPersonalSkills(helper: EffectHelper, personalSkills: CardSkill[], userSkills: UserSkill[]) {
    for (const [index, personalSkill] of personalSkills.entries()) {
      const skill = this.skillMap.get(personalSkill.skillId);
      assert(skill, `Personal skill not found id: ${personalSkill.skillId}`);
      const userSkill = userSkills[index];
      if (!userSkill) {
        continue;
      }
      this.applyEffect(helper, skill, userSkill);
    }
  }

  private applyInspirationSkills(helper: EffectHelper, inspirationSkillIds: string[]) {
    for (const id of inspirationSkillIds) {
      if (!id) {
        continue;
      }
      const inspirationSkill = this.inspirationSkillMap.get(id);
      assert(inspirationSkill, `Inspiration skill not found. skillId: ${id}`);
      const skill = this.skillMap.get(inspirationSkill.skillId);
      assert(skill, `Inspiration skill not found id: ${inspirationSkill.skillId}`);
      this.applyEffect(helper, skill, inspirationSkill);
    }
  }

  private applyEffect(
    helper: EffectHelper,
    { effect, fields, target, condition: conditionType }: Skill,
    { skillFields, conditionFields }: UserSkill,
  ): EffectHelper {
    const rate = EffectSimulator.getRateField(fields, 'rate', skillFields);
    switch (effect) {
      case SkillEffect.AppealUp:
      case SkillEffect.VoltageUp:
      case SkillEffect.TechniqueUp:
      case SkillEffect.CriticalUp:
      case SkillEffect.CriticalRateUp:
      case SkillEffect.SkillInvocationUp:
      case SkillEffect.SpGaugeGainUp:
      case SkillEffect.DamageReduction: {
        const notes = EffectSimulator.getField(fields, 'notes', skillFields, 0);
        return helper.set(conditionType, conditionFields, effect, target, {
          type: EffectPayloadType.Rate,
          rate: rate * notes,
        });
      }
      case SkillEffect.AppealPlus:
      case SkillEffect.VoltagePlus:
      case SkillEffect.TechniquePlus:
      case SkillEffect.CriticalPlus:
      case SkillEffect.CriticalRatePlus:
      case SkillEffect.SkillInvocationPlus:
      case SkillEffect.SpGaugeGainPlus:
      case SkillEffect.SpSkillPlus:
      case SkillEffect.DamageReductionPlus:
      case SkillEffect.AttributeBonusPlus:
      case SkillEffect.StaminaPlus: {
        return helper.set(conditionType, conditionFields, effect, target, { type: EffectPayloadType.Rate, rate });
      }
      case SkillEffect.AppealPlusAndStaminaPlus:
      case SkillEffect.AppealPlusAndTechniquePlus:
      case SkillEffect.TechniquePlusAndStaminaPlus: {
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', skillFields);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', skillFields);
        switch (effect) {
          case SkillEffect.AppealPlusAndStaminaPlus: {
            return helper
              .set(conditionType, conditionFields, SkillEffect.AppealPlus, target, {
                type: EffectPayloadType.Rate,
                rate: rate1,
              })
              .set(conditionType, conditionFields, SkillEffect.StaminaPlus, target, {
                type: EffectPayloadType.Rate,
                rate: rate2,
              });
          }
          case SkillEffect.AppealPlusAndTechniquePlus: {
            return helper
              .set(conditionType, conditionFields, SkillEffect.AppealPlus, target, {
                type: EffectPayloadType.Rate,
                rate: rate1,
              })
              .set(conditionType, conditionFields, SkillEffect.TechniquePlus, target, {
                type: EffectPayloadType.Rate,
                rate: rate2,
              });
          }
          case SkillEffect.TechniquePlusAndStaminaPlus: {
            return helper
              .set(conditionType, conditionFields, SkillEffect.TechniquePlus, target, {
                type: EffectPayloadType.Rate,
                rate: rate1,
              })
              .set(conditionType, conditionFields, SkillEffect.StaminaPlus, target, {
                type: EffectPayloadType.Rate,
                rate: rate2,
              });
          }
        }
        throw new Error('Invalid effect');
      }
      case SkillEffect.SpGaugeGain:
      case SkillEffect.ShieldGainValue: {
        switch (effect) {
          case SkillEffect.ShieldGainValue: {
            effect = SkillEffect.ShieldGain;
          }
        }
        const value = EffectSimulator.getField(fields, 'value', skillFields, 0);
        return helper.set(conditionType, conditionFields, effect, SkillTarget.Myself, {
          type: EffectPayloadType.Value,
          value,
        });
      }
      case SkillEffect.AppealUpType:
      case SkillEffect.CriticalUpType: {
        switch (effect) {
          case SkillEffect.AppealUpType: {
            effect = SkillEffect.AppealUp;
            break;
          }
          case SkillEffect.CriticalUpType: {
            effect = SkillEffect.CriticalUp;
            break;
          }
        }
        const rate = EffectSimulator.getField(fields, 'rate', skillFields, 0);
        return helper.set(conditionType, conditionFields, effect, target, {
          type: EffectPayloadType.Rate,
          rate,
        });
      }
      case SkillEffect.StaminaRecoveryType: {
        // this is not correct, but not that important
        const value = EffectSimulator.getField(fields, 'value', skillFields, 0);
        return helper.set(conditionType, conditionFields, SkillEffect.StaminaRecovery, SkillTarget.Myself, {
          type: EffectPayloadType.Value,
          value,
        });
      }
      case SkillEffect.VoltageGain:
      case SkillEffect.ShieldGain:
      case SkillEffect.StaminaRecovery:
      case SkillEffect.SpGaugeGainRate:
      case SkillEffect.SpSkillUp: {
        const param = EffectSimulator.getField(fields, 'parameter', skillFields, '') as Parameter;
        return helper.set(conditionType, conditionFields, effect, SkillTarget.Myself, { param, rate });
      }
      case SkillEffect.SpSkillOverChargeAndSpSkillUpEx: {
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', skillFields);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', skillFields);
        return helper.set(conditionType, conditionFields, SkillEffect.SpSkillUp, SkillTarget.Myself, {
          param: Parameter.SpVoltage,
          rate: rate2 / rate1,
        });
      }
      case SkillEffect.SpGaugeGainRateAndSpSkillUp:
      case SkillEffect.StaminaRecoveryAndShieldGain: {
        let effect1: SkillEffect;
        let effect2: SkillEffect;
        switch (effect) {
          case SkillEffect.SpGaugeGainRateAndSpSkillUp: {
            effect1 = SkillEffect.SpGaugeGain;
            effect2 = SkillEffect.SpSkillUp;
            break;
          }
          case SkillEffect.StaminaRecoveryAndShieldGain: {
            effect1 = SkillEffect.StaminaRecovery;
            effect2 = SkillEffect.ShieldGain;
          }
        }
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', skillFields);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', skillFields);
        const param1 = EffectSimulator.getField(fields, 'parameter1', skillFields, '') as Parameter;
        const param2 = EffectSimulator.getField(fields, 'parameter2', skillFields, '') as Parameter;
        return helper
          .set(conditionType, conditionFields, effect1, SkillTarget.Myself, {
            param: param1,
            rate: rate1,
          })
          .set(conditionType, conditionFields, effect2, SkillTarget.Myself, {
            param: param2,
            rate: rate2,
          });
      }
      case SkillEffect.VoltageGainAndAppealUp: {
        const param1 = EffectSimulator.getField(fields, 'parameter', skillFields, '') as Parameter;
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', skillFields);
        const notes = EffectSimulator.getField(fields, 'notes', skillFields, 0);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', skillFields);
        return helper
          .set(conditionType, conditionFields, SkillEffect.VoltageGain, SkillTarget.Myself, {
            param: param1,
            rate: rate1,
          })
          .set(conditionType, conditionFields, SkillEffect.AppealUp, target, {
            type: EffectPayloadType.Rate,
            rate: rate2 * notes,
          });
      }
      case SkillEffect.CriticalRateUpAndVoltageUp: {
        const notes = EffectSimulator.getField(fields, 'notes', skillFields, 0);
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', skillFields);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', skillFields);
        return helper
          .set(conditionType, conditionFields, SkillEffect.CriticalRateUp, target, {
            type: EffectPayloadType.Rate,
            rate: rate1 * notes,
          })
          .set(conditionType, conditionFields, SkillEffect.VoltageUp, target, {
            type: EffectPayloadType.Rate,
            rate: rate2 * notes,
          });
      }
      case SkillEffect.CriticalRateAc:
      case SkillEffect.SkillInvocationUpAc:
      case SkillEffect.DamageReductionAc: {
        switch (effect) {
          case SkillEffect.CriticalRateAc: {
            effect = SkillEffect.CriticalUp;
            break;
          }
          case SkillEffect.SkillInvocationUpAc: {
            effect = SkillEffect.SkillInvocationUp;
            break;
          }
          case SkillEffect.DamageReductionAc: {
            effect = SkillEffect.DamageReduction;
            break;
          }
        }
        const rate = EffectSimulator.getRateField(fields, 'rate', skillFields);
        // TODO: ac notes count
        const notes = 30;
        return helper.set(conditionType, conditionFields, effect, target, {
          type: EffectPayloadType.Rate,
          rate: rate * notes,
        });
      }
      case SkillEffect.TeamEffectReductionPlus: {
        const type = EffectSimulator.getField(fields, 'type', skillFields, '') as Card.Type;
        const rate = EffectSimulator.getRateField(fields, 'rate', skillFields);
        let targetEffect: TeamEffect;
        switch (type) {
          case Card.Type.Vo: {
            targetEffect = SkillEffect.DamageReductionPlus;
            break;
          }
          case Card.Type.Sp: {
            targetEffect = SkillEffect.SkillInvocationPlus;
            break;
          }
          case Card.Type.Gd: {
            targetEffect = SkillEffect.SpGaugeGainPlus;
            break;
          }
          case Card.Type.Sk: {
            targetEffect = SkillEffect.VoltagePlus;
            break;
          }
        }
        return helper.set(conditionType, conditionFields, effect, SkillTarget.SameTeam, {
          type: EffectPayloadType.Rate,
          rate,
          effect: targetEffect,
        });
      }
      case SkillEffect.Deactivation:
      case SkillEffect.Revival: {
        return helper;
      }
      default: {
        // throw new Error('Implement!!');
        return helper;
      }
    }
  }
}

const effectDependencyGraph: Record<EffectType, EffectType[]> = {
  [SkillEffect.TeamEffectReductionPlus]: [],
  [SkillEffect.AppealUp]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.AppealPlus]: [],
  [SkillEffect.VoltageUp]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.VoltagePlus]: [SkillEffect.TeamEffectReductionPlus],
  [SkillEffect.VoltageLimitPlus]: [],
  [SkillEffect.VoltageGain]: [SkillEffect.SkillInvocationUp, SkillEffect.AppealUp, SkillEffect.TechniqueUp],
  [SkillEffect.TechniqueUp]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.TechniquePlus]: [],
  [SkillEffect.CriticalUp]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.CriticalPlus]: [],
  [SkillEffect.CriticalRateUp]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.CriticalRatePlus]: [],
  [SkillEffect.ComboCount]: [],
  [SkillEffect.SkillInvocationUp]: [SkillEffect.SkillInvocationPlus],
  [SkillEffect.SkillInvocationPlus]: [SkillEffect.TeamEffectReductionPlus],
  [SkillEffect.SpSkillUp]: [SkillEffect.SkillInvocationUp, SkillEffect.AppealUp, SkillEffect.TechniqueUp],
  [SkillEffect.SpSkillPlus]: [],
  [SkillEffect.SpSkillPlusParam]: [],
  [SkillEffect.SpGaugeGainUp]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.SpGaugeGainPlus]: [SkillEffect.TeamEffectReductionPlus],
  [SkillEffect.SpGaugeGain]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.SpGaugeGainRate]: [SkillEffect.SkillInvocationUp, SkillEffect.AppealUp, SkillEffect.TechniqueUp],
  [SkillEffect.StaminaPlus]: [],
  [SkillEffect.StaminaRecovery]: [SkillEffect.SkillInvocationUp, SkillEffect.AppealUp, SkillEffect.TechniqueUp],
  [SkillEffect.Damage]: [SkillEffect.DamageReduction],
  [SkillEffect.DamageReduction]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.DamageReductionPlus]: [SkillEffect.TeamEffectReductionPlus],
  [SkillEffect.ShieldGain]: [SkillEffect.SkillInvocationUp, SkillEffect.AppealUp, SkillEffect.TechniqueUp],
  [SkillEffect.Deactivation]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.Revival]: [SkillEffect.SkillInvocationUp],
  [SkillEffect.ChangeTeamNotesLose]: [],
  [SkillEffect.ChangeTeamPlus]: [],
  [SkillEffect.AttributeBonusPlus]: [],
};

const effectDependencyOrders = (() => {
  const remaining = Object.entries(effectDependencyGraph) as [EffectType, EffectType[]][];
  const orders: EffectType[][] = [];
  const resolved = new Set<EffectType>();
  while (remaining.length) {
    const next: typeof remaining = [];
    const nextResolved = new Set<EffectType>();
    const order: EffectType[] = [];
    while (remaining.length) {
      const [effect, deps] = remaining.shift()!;
      if (deps.every((dep) => resolved.has(dep))) {
        nextResolved.add(effect);
        order.push(effect);
        continue;
      }
      next.push([effect, deps]);
    }
    orders.push(order);
    remaining.push(...next);
    for (const effect of nextResolved) {
      resolved.add(effect);
    }
  }
  return orders;
})();

const conditionOrder = [
  Condition.Type.Passive,
  Condition.Type.Always,
  Condition.Type.Success,
  Condition.Type.SuccessType,
  Condition.Type.Music,
  Condition.Type.Damage,
  Condition.Type.DamageTimes,
  Condition.Type.TargetVoltage,
  Condition.Type.Stamina,
  Condition.Type.StaminaTimes,
  Condition.Type.ChangeTeam,
  Condition.Type.ChangeTeamOnce,
  Condition.Type.ChangeTeamTimes,
  Condition.Type.MusicStart,
  Condition.Type.AcStart,
  Condition.Type.AcStartOnce,
  Condition.Type.AcStartTimes,
  Condition.Type.AcSuccess,
  Condition.Type.AcSuccessOnce,
  Condition.Type.AcSuccessTimes,
  Condition.Type.AcFailed,
  Condition.Type.SpSkill,
  Condition.Type.SpSkillOnce,
  Condition.Type.SpSkillTimes,
  Condition.Type.Appeal,
  Condition.Type.Critical,
  Condition.Type.CriticalTimes,
  Condition.Type.Probability,
  Condition.Type.SameAttribute,
];
assert(conditionOrder.length === Object.keys(Condition.Type).length, 'All conditions should be registered');

enum EffectPayloadType {
  Value = 'value',
  Rate = 'rate',
}

type TeamEffect =
  | SkillEffect.DamageReductionPlus
  | SkillEffect.SkillInvocationPlus
  | SkillEffect.SpGaugeGainPlus
  | SkillEffect.VoltagePlus;

interface ValuePayload {
  type: EffectPayloadType.Value;
  value: Value;
}

interface RatePayload {
  type: EffectPayloadType.Rate;
  rate: Rate;
  team?: true;
  effect?: TeamEffect;
}

interface RateWithParamPayload<T extends Parameter> {
  param: T;
  rate: Rate;
}

interface EffectCondition {
  type: Condition.Type;
  fields: any[];
}

interface RateWithParamEffect extends RateWithParamPayload<Parameter> {
  type:
    | SkillEffect.VoltageGain
    | SkillEffect.ShieldGain
    | SkillEffect.StaminaRecovery
    | SkillEffect.DamageReduction
    | SkillEffect.SpGaugeGainRate;
}

interface TeamReductionEffect {
  type: SkillEffect.TeamEffectReductionPlus;
}

type Effect = BaseEffect | RateWithParamEffect | TeamReductionEffect;

type EffectType = Effect['type'];

interface EffectValue {
  effect: EffectType;
  target: SkillTarget;
  condition: EffectCondition;
  payload: ValuePayload | RatePayload | RateWithParamPayload<Parameter>;
}

class EffectHelper {
  private readonly effectsMap = new Map<Condition.Type, EffectValue[]>();
  private readonly conditionMap = new Map<Condition.Type, Map<EffectValue['effect'], EffectValue[]>>();

  getMap(conditionType: Condition.Type) {
    const map = this.conditionMap.get(conditionType);
    if (map) {
      return map;
    }
    const effects = this.effectsMap.get(conditionType);
    if (!effects) {
      return null;
    }
    const effectMap = groupBy(effects, ({ effect }) => effect);
    this.conditionMap.set(conditionType, effectMap);
    return effectMap;
  }

  set(
    conditionType: Condition.Type,
    conditionFields: any[],
    effect: EffectType,
    target: SkillTarget,
    payload: ValuePayload | RatePayload | RateWithParamPayload<Parameter>,
  ) {
    // remove cache
    this.conditionMap.delete(conditionType);
    const effects = this.effectsMap.get(conditionType) ?? [];
    effects.push({
      condition: {
        type: conditionType,
        fields: conditionFields,
      },
      effect,
      target,
      payload,
    });
    this.effectsMap.set(conditionType, effects);
    return this;
  }
}

export namespace DeckSupportSimulator {
  export interface Options {
    notes?: Value;
    acCount?: Value;
    attribute?: Card.Attribute;
    reduction?: BaseSimulator.Reduction;
    centerCardId?: UserCard['id'];
    selectedCardIds?: UserCard['id'][];
    school?: School;
    schoolBonus?: Value;
    grade?: Grade;
    gradeBonus?: Value;
    voltageLimit?: Rate;
    damage?: Value;
    wonderful?: Rate;
    difficulty?: Music.Difficulty;
    spGauge?: Value;
    spGaugeGain?: Record<Card.Rarity, Value>;
    changeTeam?: Value;
    friend?: UserFriend | null;
  }
  export type DefaultOption =
    | 'notes'
    | 'acCount'
    | 'reduction'
    | 'schoolBonus'
    | 'gradeBonus'
    | 'voltageLimit'
    | 'damage'
    | 'wonderful'
    | 'difficulty'
    | 'spGauge'
    | 'spGaugeGain'
    | 'changeTeam';

  export interface Result {
    selectedCards: SupportCard[];
    otherCards: SupportCard[];
  }

  export interface SupportCard {
    id: UserCard['id'];
    card: Card;
    userCard: UserCard;
    idol: Idol;
    // per notes
    teamScore: Value;
    supportScore: Value;
    // per tap
    appeal: Value;
    technique: Value;
    stamina: Value;
    voltage: Value;
    totalVoltage: Value;
    voltageWithCritical: Value;
    criticalValue: Value;
    criticalRate: Rate;
    // per sp voltage
    spVoltage: Value;
    // per notes
    voltageGain: Value;
    spVoltageGain: Value;
    spGaugeGain: Value;
    staminaRecovery: Value;
    shieldGain: Value;
    staminaAndShield: Value;
    damageReduction: Value;
    skillInvocationRate: Rate;
  }
}
