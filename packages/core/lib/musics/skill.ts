import {
  AccessoryMap,
  Card,
  CardSkill,
  Condition,
  Deck,
  Idol,
  InspirationSkill,
  KizunaSkill,
  Music,
  Skill,
  SkillEffect,
  SkillMap,
  SkillTarget,
  UserAccessory,
  UserCard,
  UserDeck,
  UserFriend,
  UserIdol,
  UserSkill,
} from '../../entities';
import { CardStatus, Effect, PlayerStatus } from './status';
import { EffectSimulator } from '../decks';
import { sample, sampleWeight, toMap } from '../../utils';
import { simulator } from '../../constants';

const skillIndex = 0;
export const exTypeMap = new Map([
  [SkillTarget.ExVoltage, Card.Type.Vo],
  [SkillTarget.ExSp, Card.Type.Sp],
  [SkillTarget.ExGuard, Card.Type.Gd],
  [SkillTarget.ExSkill, Card.Type.Sk],
]);
export const exAttributeMap = new Map([
  [SkillTarget.ExSmile, Card.Attribute.Smile],
  [SkillTarget.ExPure, Card.Attribute.Pure],
  [SkillTarget.ExCool, Card.Attribute.Cool],
  [SkillTarget.ExActive, Card.Attribute.Active],
  [SkillTarget.ExNatural, Card.Attribute.Natural],
  [SkillTarget.ExElegant, Card.Attribute.Elegant],
]);

export class SchoolIdol {
  status: CardStatus;
  readonly userSkillStats: SkillHandler.UserSkillStats[] = [];
  readonly userAccessoryIds: UserAccessory['id'][] = [];
  constructor(readonly team: Deck.Team, readonly idol: Idol, readonly card: Card, readonly userCard: UserCard) {}
}

export class SkillHandler {
  playerStatus: PlayerStatus = new PlayerStatus(0, 0);
  private acStatus = Music.AcStatus.None;
  private acEnd = 0;
  private sp = false;
  private notes: Value = 0;
  private previousSchoolIdol: SchoolIdol;
  private readonly schoolIdolsMap = new Map<Deck.Team, SchoolIdol[]>();
  private readonly schoolIdols: SchoolIdol[] = [];
  private events: SkillHandler.Event<any>[] = [];
  private readonly idolMap: Map<Idol['id'], Idol>;
  private readonly cardMap: Map<Card['id'], Card>;
  private readonly userCardMap: Map<UserCard['id'], UserCard>;
  private readonly conditionMap: Map<Condition.Type, Condition>;
  private readonly userSkillStatsMap = new Map<Condition.Type, SkillHandler.UserSkillStats[]>();
  private readonly teamEffectReductionMap = new Map<Deck.Team, CardSkill[]>(
    Object.values(Deck.Team).map((team) => [team, []]),
  );
  private readonly tapRateList: { event: Music.TapEvent; rate: Rate }[];
  private readonly userAccessoryMap: Map<UserAccessory['id'], UserAccessory>;
  constructor(
    idols: Idol[],
    cards: Card[],
    private readonly skillMap: SkillMap<Skill>,
    conditions: Condition[],
    inspirationSkills: InspirationSkill[],
    kizunaSkills: KizunaSkill[],
    private readonly accessoryMap: AccessoryMap,
    private readonly liveStage: Music.LiveStage,
    private readonly userDeck: UserDeck,
    userIdols: UserIdol[],
    userCards: UserCard[],
    userAccessories: UserAccessory[],
    private friend: UserFriend | null,
    private readonly tapRateMap: SkillHandler.TapRateMap,
    private readonly logLevel: SkillHandler.LogLevel = SkillHandler.LogLevel.Info,
  ) {
    // TODO: debug won't work because simulator.ts uses events
    this.logLevel = SkillHandler.LogLevel.Info;
    this.idolMap = toMap(idols, 'id');
    this.cardMap = toMap(cards, 'id');
    this.userCardMap = toMap(userCards, 'id');
    this.conditionMap = toMap(conditions, 'type');
    this.userAccessoryMap = toMap(userAccessories, 'id');
    this.tapRateList = Object.entries(tapRateMap)
      .map(([event, rate]) => ({ event: event as Music.TapEvent, rate }))
      .filter((tap) => tap.rate !== 0)
      .sort((t1, t2) => t2.rate - t1.rate);

    const userIdolMap = toMap(userIdols, 'id');
    const inspirationSkillMap = toMap(inspirationSkills, 'id');
    for (const { team, cardId } of userDeck.cards.values()) {
      const userCard = this.userCardMap.get(cardId);
      if (!userCard) {
        throw new Error('User card not found');
      }
      const card = this.cardMap.get(userCard.id);
      if (!card) {
        throw new Error('Card not found');
      }
      const idol = this.idolMap.get(card.idolId);
      if (!idol) {
        throw new Error('Idol not found');
      }
      const schoolIdol = new SchoolIdol(team, idol, card, userCard);
      this.schoolIdols.push(schoolIdol);
      this.schoolIdolsMap.set(team, this.schoolIdolsMap.get(team) ?? []);
      this.schoolIdolsMap.get(team)!.push(schoolIdol);

      this.setUserSkill(schoolIdol, {
        ...userCard.skill,
        skillId: card.skill.skillId,
      });
      for (const [index, skill] of card.personalSkills.entries()) {
        this.setUserSkill(schoolIdol, {
          ...userCard.personalSkills[index],
          skillId: skill.skillId,
        });
      }
      for (const id of userCard.inspirationSkillIds) {
        if (!id) {
          continue;
        }
        const inspirationSkill = inspirationSkillMap.get(id);
        if (!inspirationSkill) {
          throw new Error('Inspiration skill not found');
        }
        this.setUserSkill(schoolIdol, inspirationSkill);
      }
      const userIdol = userIdolMap.get(idol.id);
      if (!userIdol) {
        continue;
      }
      const kizunaSkillMap = toMap(kizunaSkills, 'id');
      for (const skill of userIdol.kizunaSkills) {
        const kizunaSkill = kizunaSkillMap.get(skill.id);
        if (!kizunaSkill) {
          throw new Error('Kizuna skill not found');
        }
        this.setUserSkill(schoolIdol, {
          skillId: kizunaSkill.skillId,
          skillFields: skill.skillFields,
          conditionFields: kizunaSkill.conditionFields,
        });
      }
    }
    for (const { team, id } of userDeck.accessories) {
      const userAccessory = this.userAccessoryMap.get(id);
      if (!userAccessory) {
        throw new Error('User accessory not found');
      }
      const accessory = this.accessoryMap.get(userAccessory.accessoryId);
      if (!accessory) {
        throw new Error('Accessory not found');
      }
      for (const schoolIdol of this.getSchoolIdols(team)) {
        schoolIdol.userAccessoryIds.push(id);
        this.setUserSkill(schoolIdol, {
          skillId: accessory.skillId,
          skillFields: userAccessory.skillFields,
          conditionFields: accessory.conditionFields,
        });
      }
    }

    if (!friend) {
      return;
    }
    const friendCard = this.cardMap.get(friend.card.id);
    if (!friendCard) {
      throw new Error('Friend card not found');
    }
    const center = this.getCenterIdol();
    for (const [index, skill] of friendCard.personalSkills.entries()) {
      this.setUserSkill(center, {
        ...friend.card.personalSkills[index],
        skillId: skill.skillId,
      });
    }
    for (const id of friend.card.inspirationSkillIds) {
      if (!id) {
        continue;
      }
      const inspirationSkill = inspirationSkillMap.get(id);
      if (!inspirationSkill) {
        throw new Error('Inspiration skill not found');
      }
      this.setUserSkill(center, inspirationSkill);
    }
  }

  init() {
    this.notes = 0;
    this.clearEvents();
    for (const schoolIdol of this.schoolIdols) {
      schoolIdol.status = new CardStatus(schoolIdol.userCard);
      for (const userAccessoryId of schoolIdol.userAccessoryIds) {
        const userAccessory = this.userAccessoryMap.get(userAccessoryId)!;
        const accessory = this.accessoryMap.get(userAccessory.accessoryId)!;
        const bonus = 1 + (accessory.attribute === schoolIdol.card.attribute ? simulator.bonus.attribute.accessory : 0);
        schoolIdol.status.addParameter(userAccessory, bonus);
      }
    }
    this.invokeAttributeBonus().invoke(Music.Event.Passive);
    const stamina = this.schoolIdols.reduce((sum, schoolIdol) => sum + schoolIdol.status.stamina, 0);
    this.playerStatus = new PlayerStatus(stamina, this.liveStage.spGauge);
    return this;
  }

  private get currentTeam() {
    return this.playerStatus.currentTeam;
  }

  private get currentSchoolIdols() {
    return this.getSchoolIdols(this.currentTeam);
  }

  getEvents() {
    return this.events;
  }

  clearEvents() {
    this.events = [];
    return this;
  }

  prepare(notes: Value) {
    this.notes = notes;
    this.playerStatus.prepare(notes);
    for (const schoolIdol of this.schoolIdols) {
      schoolIdol.status.prepare(this.notes);
    }
    return this;
  }

  play(acStatus: Music.AcStatus, sp: boolean, notesSkill?: CardSkill): this {
    this.acStatus = acStatus;
    this.sp = sp;
    this.invokeTeamEffects().invoke(Music.Event.Music);
    const schoolIdols = this.currentSchoolIdols;
    const schoolIdol = sample(schoolIdols.filter((schoolIdol) => schoolIdol !== this.previousSchoolIdol));
    this.previousSchoolIdol = schoolIdol;

    const critical = Math.random() < schoolIdol.status.criticalRate;
    const tapRate = sampleWeight(this.tapRateList);
    const miss = tapRate.event === Music.TapEvent.Miss;
    const tapEvent = miss || !critical ? tapRate.event : Music.TapEvent.Critical;
    const tapBonus = simulator.bonus.tap[tapRate.event];
    const base = tapEvent === Music.TapEvent.Critical ? schoolIdol.status.criticalValue : schoolIdol.status.voltage;

    const { staminaRate, combo } = this.playerStatus;
    const staminaBonus = simulator.bonus.stamina.find((bonus) => staminaRate <= bonus.threshold)?.rate ?? 1;
    const comboBonus = simulator.bonus.combo.find((bonus) => combo >= bonus.threshold)!.voltageRate;
    const acBonus = acStatus !== Music.AcStatus.None ? simulator.bonus.ac : 1;
    const spBonus = sp ? simulator.bonus.sp : 1;
    const bonus = tapBonus * acBonus * spBonus * staminaBonus * comboBonus;
    const voltageLimit = simulator.voltage.limit[this.liveStage.difficulty] * schoolIdol.status.voltageLimitRate;
    const voltage = Math.min(voltageLimit, Math.floor(base * bonus));

    const spGaugeGainRate = 1 + this.playerStatus.spGaugeGainRate + schoolIdol.status.spGaugeGainRate;
    const spGaugeGain = Math.floor(simulator.sp.gaugeGain[schoolIdol.card.rarity] * spGaugeGainRate);

    const actor = SkillHandler.Actor.Idol;
    const event = miss ? Music.Event.TapFailed : Music.Event.TapSucceeded;
    const target = SkillTarget.None;
    this.applyEffect(actor, event, schoolIdol, target, false, {
      type: SkillEffect.VoltageGain,
      value: voltage,
      tapEvent,
    })
      .applyEffect(actor, event, schoolIdol, target, false, {
        type: SkillEffect.SpGaugeGain,
        value: spGaugeGain,
      })
      .applyEffect(actor, event, schoolIdol, target, false, {
        type: SkillEffect.ComboCount,
        value: miss ? -combo : 1,
      })
      .invokeUserSkillBySkillStats(event, schoolIdol.userSkillStats[skillIndex], false)
      .invokeNotesSkill(event, notesSkill);

    if (acStatus !== Music.AcStatus.Success) {
      this.applyDamage(actor, event, schoolIdol, this.liveStage.damage);
    }

    if (tapEvent === Music.TapEvent.Critical) {
      this.invoke(Music.Event.Critical);
    }
    return this;
  }

  alive() {
    return this.playerStatus.stamina > 0;
  }

  private applyDamage(
    actor: SkillHandler.Actor,
    event: Music.Event,
    actress: SchoolIdol | null,
    baseDamage: Value,
  ): this {
    const baseReductionRate = this.playerStatus.damageReductionRate;
    const teamReductionRate = actress?.status.damageReductionRate ?? 0;
    const totalReductionRate = baseReductionRate + teamReductionRate;
    const damage = Math.floor(baseDamage * Math.max(1 - totalReductionRate, 0));
    return this.applyEffect(actor, event, actress, SkillTarget.None, false, {
      type: SkillEffect.Damage,
      value: damage,
    });
  }

  private getCenterIdol(): SchoolIdol {
    return this.schoolIdols[Math.floor(this.schoolIdols.length / 2)];
  }

  invokeSpSkill(ac: Music.AcStatus) {
    const center = this.getCenterIdol();
    const spTeamVoltage = this.schoolIdols
      .slice(simulator.teamNum, simulator.teamNum * 2)
      .reduce((sum, schoolIdol) => sum + schoolIdol.status.spVoltage, 0);
    const acBonus = ac !== Music.AcStatus.None ? simulator.bonus.ac : 1;
    const idolBonus = this.schoolIdols.reduce((sum, schoolIdol) => sum + schoolIdol.status.spSkillBonus, 0);
    const voltage = Math.floor(this.playerStatus.invokeSpSkill(spTeamVoltage * acBonus) + idolBonus);
    const actor = SkillHandler.Actor.Idol;
    const event = Music.Event.SpSkill;
    return this.applyEffect(actor, event, center, SkillTarget.None, false, {
      type: SkillEffect.VoltageGain,
      value: voltage,
    }).invoke(event);
  }

  changeTeam(team: Deck.Team): this {
    this.playerStatus.changeTeam(team);
    const schoolIdol = sample(this.getSchoolIdols(team));
    switch (schoolIdol.card.type) {
      case Card.Type.Vo: {
        this.applyEffect(SkillHandler.Actor.Idol, Music.Event.ChangeTeam, schoolIdol, SkillTarget.None, false, {
          type: SkillEffect.VoltageGain,
          value: Math.floor(schoolIdol.status.appeal * simulator.changeTeam.bonus.voltage),
        });
        break;
      }
      case Card.Type.Sp: {
        this.applyEffect(SkillHandler.Actor.Idol, Music.Event.ChangeTeam, schoolIdol, SkillTarget.None, false, {
          type: SkillEffect.SpGaugeGain,
          value: simulator.changeTeam.bonus.sp,
        });
        break;
      }
      case Card.Type.Gd: {
        this.applyEffect(SkillHandler.Actor.Idol, Music.Event.ChangeTeam, schoolIdol, SkillTarget.None, false, {
          type: SkillEffect.StaminaRecovery,
          rate: simulator.changeTeam.bonus.guard,
        });
        break;
      }
      case Card.Type.Sk: {
        this.applyEffect(SkillHandler.Actor.Idol, Music.Event.ChangeTeam, schoolIdol, SkillTarget.None, false, {
          type: SkillEffect.ChangeTeamNotesLose,
          value: simulator.changeTeam.bonus.skill,
        });
        break;
      }
      default: {
        throw new Error('Change team failed');
      }
    }
    return this.invoke(Music.Event.ChangeTeam);
  }

  invoke(event: Music.Event): this {
    this.playerStatus.clear(event);
    for (const schoolIdol of this.schoolIdols) {
      schoolIdol.status.clear(event);
    }
    switch (event) {
      case Music.Event.Passive: {
        return this.invokeUserSkillsByCondition(event, Condition.Type.Passive);
      }
      case Music.Event.Music: {
        return this.invokeUserSkillsByCondition(event, Condition.Type.Music);
      }
      case Music.Event.MusicStart: {
        // TODO: friend skills
        for (const stageGimmick of this.liveStage.stageGimmicks) {
          this.invokeMusicSkill(event, stageGimmick, false).invokeUserSkillsByCondition(
            Music.Event.MusicStart,
            Condition.Type.MusicStart,
          );
        }
        return this;
      }
      case Music.Event.MusicFailed: {
        this.playerStatus.revive();
        return this;
      }
      case Music.Event.AcStart: {
        return this.invokeUserSkillsByCondition(event, Condition.Type.AcStart).invokeUserSkillsByCondition(
          event,
          Condition.Type.AcStartOnce,
        );
      }
      case Music.Event.AcSuccess: {
        return this.invokeUserSkillsByCondition(event, Condition.Type.AcSuccess)
          .invokeUserSkillsByCondition(event, Condition.Type.AcSuccessOnce)
          .invokeUserSkillsByCondition(event, Condition.Type.AcSuccessTimes);
      }
      case Music.Event.AcEnd: {
        return this;
      }
      case Music.Event.AcFailed: {
        return this.invokeUserSkillsByCondition(event, Condition.Type.AcFailed);
      }
      case Music.Event.ChangeTeam: {
        return this.invokeUserSkillsByCondition(event, Condition.Type.ChangeTeam).invokeUserSkillsByCondition(
          event,
          Condition.Type.ChangeTeamOnce,
        );
      }
      case Music.Event.Critical: {
        return this.invokeUserSkillsByCondition(event, Condition.Type.Critical);
      }
      case Music.Event.VoltageGain: {
        return this.invokeUserSkillsByCondition(event, Condition.Type.TargetVoltage);
      }
      case Music.Event.SpSkill: {
        return this.invokeUserSkillsByCondition(event, Condition.Type.SpSkill);
      }
      case Music.Event.TapFailed:
      case Music.Event.TapSucceeded:
      case Music.Event.TeamEffect:
      case Music.Event.Damage: {
        throw new Error(`Event: ${event} is not a skill event`);
      }
    }
    throw new Error('Invalid event');
  }

  invokeDamageSkill(damage: Value): this {
    return this.invokeUserSkillsByCondition(Music.Event.Damage, Condition.Type.Damage, { damage });
  }

  invokeAcSkill(acSkill: CardSkill | null, acEnd: Value): this {
    this.acEnd = acEnd;
    if (!acSkill) {
      return this;
    }
    return this.invokeMusicSkill(Music.Event.AcStart, acSkill, false, Music.Event.AcEnd);
  }

  applyAcBonusVoltage(voltage: Value): this {
    return this.applyEffect(SkillHandler.Actor.System, Music.Event.AcEnd, null, SkillTarget.None, false, {
      type: SkillEffect.VoltageGain,
      value: voltage,
    });
  }

  applyAcFailedDamage(damage: Value): this {
    return this.applyDamage(SkillHandler.Actor.System, Music.Event.AcFailed, null, damage).invoke(Music.Event.AcFailed);
  }

  private invokeNotesSkill(event: Music.Event, skill?: CardSkill): this {
    if (skill) {
      this.invokeUserSkillByCondition(SkillHandler.Actor.System, event, null, skill, 0, false);
    }
    return this;
  }

  getSchoolIdols(team?: Deck.Team) {
    return team ? this.schoolIdolsMap.get(team)! : this.schoolIdols;
  }

  private setUserSkill(schoolIdol: SchoolIdol, cardSkill: CardSkill) {
    const skill = this.skillMap.get(cardSkill.skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }
    if (skill.effect === SkillEffect.TeamEffectReductionPlus) {
      this.teamEffectReductionMap.get(schoolIdol.team)!.push(cardSkill);
      return this;
    }
    const stats: SkillHandler.UserSkillStats = { cardSkill, schoolIdol, count: 0 };
    this.userSkillStatsMap.set(skill.condition, this.userSkillStatsMap.get(skill.condition) ?? []);
    this.userSkillStatsMap.get(skill.condition)!.push(stats);
    schoolIdol.userSkillStats.push(stats);
    return this;
  }

  private invokeAttributeBonus() {
    for (const schoolIdol of this.schoolIdols) {
      if (this.liveStage.attribute !== schoolIdol.card.attribute) {
        continue;
      }
      this.applyCardEffect(SkillHandler.Actor.System, Music.Event.Passive, null, schoolIdol, true, {
        type: SkillEffect.AttributeBonusPlus,
        rate: simulator.bonus.attribute.card,
      });
    }
    return this;
  }

  private invokeTeamEffects() {
    const teamEffects = [
      SkillEffect.VoltagePlus,
      SkillEffect.DamageReductionPlus,
      SkillEffect.SpGaugeGainPlus,
      SkillEffect.SkillInvocationPlus,
    ] as const;
    const schoolIdols = this.currentSchoolIdols;
    const reductionMap = Object.fromEntries(teamEffects.map((effect) => [effect, 0]));
    for (const cardSkill of this.teamEffectReductionMap.get(this.currentTeam)!) {
      const skill = this.skillMap.get(cardSkill.skillId)!;
      const type = EffectSimulator.getField(skill.fields, 'type', cardSkill.skillFields, '') as Card.Type;
      const rate = EffectSimulator.getRateField(skill.fields, 'rate', cardSkill.skillFields);
      switch (type) {
        case Card.Type.Vo: {
          reductionMap[SkillEffect.DamageReductionPlus] += rate;
          break;
        }
        case Card.Type.Sp: {
          reductionMap[SkillEffect.SkillInvocationPlus] += rate;
          break;
        }
        case Card.Type.Gd: {
          reductionMap[SkillEffect.SpGaugeGainPlus] += rate;
          break;
        }
        case Card.Type.Sk: {
          reductionMap[SkillEffect.VoltagePlus] += rate;
          break;
        }
      }
    }
    const bonusMap = Object.fromEntries(teamEffects.map((effect) => [effect, 0]));
    const bonusRate = simulator.bonus.team;
    for (const actress of schoolIdols) {
      let reductionEffect: SkillEffect;
      switch (actress.card.type) {
        case Card.Type.Vo: {
          bonusMap[SkillEffect.VoltagePlus] += bonusRate;
          reductionEffect = SkillEffect.DamageReductionPlus;
          break;
        }
        case Card.Type.Sp: {
          bonusMap[SkillEffect.SpGaugeGainPlus] += bonusRate;
          reductionEffect = SkillEffect.SkillInvocationPlus;
          break;
        }
        case Card.Type.Gd: {
          bonusMap[SkillEffect.DamageReductionPlus] += bonusRate;
          reductionEffect = SkillEffect.SpGaugeGainPlus;
          break;
        }
        case Card.Type.Sk: {
          bonusMap[SkillEffect.SkillInvocationPlus] += bonusRate;
          reductionEffect = SkillEffect.VoltagePlus;
          break;
        }
      }
      const reduction = Math.min(bonusRate, reductionMap[reductionEffect]);
      reductionMap[reductionEffect] -= reduction;
      bonusMap[reductionEffect] -= bonusRate - reduction;
    }
    for (const type of teamEffects) {
      const rate = bonusMap[type] ?? 0;
      if (rate === 0) {
        continue;
      }
      this.applyEffect(SkillHandler.Actor.System, Music.Event.TeamEffect, null, SkillTarget.Everyone, false, {
        type,
        rate,
        until: this.notes,
      });
    }
    return this;
  }

  private invokeUserSkillsByCondition(event: Music.Event, conditionType: Condition.Type, payload?: any) {
    const userSkillStats = this.userSkillStatsMap.get(conditionType);
    if (!userSkillStats) {
      return this;
    }
    for (const stats of userSkillStats) {
      this.invokeUserSkillBySkillStats(event, stats, conditionType === Condition.Type.Passive, payload);
    }
    return this;
  }

  private invokeUserSkillBySkillStats(
    event: Music.Event,
    stats: SkillHandler.UserSkillStats,
    passive: boolean,
    payload?: any,
  ) {
    const invoked = this.invokeUserSkillByCondition(
      SkillHandler.Actor.Idol,
      event,
      stats.schoolIdol,
      stats.cardSkill,
      stats.count,
      passive,
      payload,
    );
    if (invoked) {
      stats.count++;
    }
    return this;
  }

  private invokeUserSkillByCondition(
    actor: SkillHandler.Actor,
    event: Music.Event,
    actress: SchoolIdol | null,
    cardSkill: CardSkill,
    count: Value,
    passive: boolean,
    payload?: any,
  ) {
    if (!this.checkCondition(event, actress, cardSkill, count, payload)) {
      return false;
    }
    this.invokeUserSkill(actor, event, actress, cardSkill, passive);
    return true;
  }

  private checkCondition(
    event: Music.Event,
    actress: SchoolIdol | null,
    cardSkill: CardSkill,
    count: Value,
    payload?: any,
  ) {
    const skill = this.skillMap.get(cardSkill.skillId)!;
    const condition = this.conditionMap.get(skill.condition)!;
    if (skill.effect === SkillEffect.AttributeBonusPlus && this.liveStage.attribute !== actress?.card.attribute) {
      return false;
    }
    switch (this.checkConditionType(event, actress, condition, cardSkill.conditionFields, count, payload)) {
      case CheckConditionType.Success: {
        return true;
      }
      case CheckConditionType.Failed: {
        return false;
      }
      case CheckConditionType.Rate: {
        if (event === Music.Event.TapFailed) {
          return false;
        }
        break;
      }
    }
    const baseRate = EffectSimulator.getRateField(condition.fields, 'rate', cardSkill.conditionFields);
    // TODO: multiplication?
    return Math.random() < baseRate + (actress?.status.skillInvocationRate ?? 0);
  }

  private checkConditionType(
    event: Music.Event,
    actress: SchoolIdol | null,
    condition: Condition,
    conditionFields: UserSkill['conditionFields'],
    count: Value,
    payload?: any,
  ): CheckConditionType {
    if (condition.once && count >= 1) {
      return CheckConditionType.Failed;
    }
    switch (condition.type) {
      case Condition.Type.Passive:
      case Condition.Type.Always:
      case Condition.Type.Music: {
        return CheckConditionType.Success;
      }
      case Condition.Type.Success: {
        return event === Music.Event.TapSucceeded ? CheckConditionType.Success : CheckConditionType.Failed;
      }
      case Condition.Type.SuccessType: {
        const type: Card.Type | string = EffectSimulator.getField(condition.fields, 'type', conditionFields, '');
        if (type !== actress?.card.type) {
          return CheckConditionType.Failed;
        }
        return event === Music.Event.TapSucceeded ? CheckConditionType.Success : CheckConditionType.Failed;
      }
      case Condition.Type.Probability: {
        return CheckConditionType.Rate;
      }
      case Condition.Type.SameAttribute: {
        return actress?.card.attribute === this.liveStage.attribute
          ? CheckConditionType.Success
          : CheckConditionType.Failed;
      }
      case Condition.Type.Damage: {
        const damage = payload?.damage;
        if (!damage) {
          throw new Error('Damage not found');
        }
        const target = EffectSimulator.getField(condition.fields, 'damage', conditionFields, 0);
        return damage >= target ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
      case Condition.Type.TargetVoltage: {
        const targetRate = EffectSimulator.getField(condition.fields, 'voltage', conditionFields, 0);
        const target = this.liveStage.targetVoltage * targetRate;
        return this.playerStatus.totalVoltage >= target ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
      case Condition.Type.Stamina:
      case Condition.Type.StaminaTimes: {
        const target = EffectSimulator.getField(condition.fields, 'stamina', conditionFields, 0);
        if (this.playerStatus.stamina > target) {
          return CheckConditionType.Failed;
        }
        if (condition.type === Condition.Type.Stamina) {
          return CheckConditionType.Rate;
        }
      }
      // falls through
      case Condition.Type.ChangeTeamTimes:
      case Condition.Type.AcStartTimes:
      case Condition.Type.AcSuccessTimes:
      case Condition.Type.CriticalTimes:
      case Condition.Type.SpSkillTimes:
      case Condition.Type.DamageTimes: {
        let targetEvent: Music.Event;
        switch (condition.type) {
          case Condition.Type.ChangeTeamTimes: {
            targetEvent = Music.Event.ChangeTeam;
            break;
          }
          case Condition.Type.AcStartTimes: {
            targetEvent = Music.Event.AcStart;
            break;
          }
          case Condition.Type.AcSuccessTimes: {
            targetEvent = Music.Event.AcSuccess;
            break;
          }
          case Condition.Type.CriticalTimes: {
            targetEvent = Music.Event.Critical;
            break;
          }
          case Condition.Type.SpSkillTimes: {
            targetEvent = Music.Event.SpSkill;
            break;
          }
          case Condition.Type.DamageTimes: {
            targetEvent = Music.Event.Damage;
            break;
          }
          case Condition.Type.StaminaTimes: {
            targetEvent = event;
            break;
          }
        }
        if (event !== targetEvent) {
          return CheckConditionType.Failed;
        }
        const limit = EffectSimulator.getField(condition.fields, 'times', conditionFields, 0);
        return count < limit ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
      case Condition.Type.ChangeTeam:
      case Condition.Type.ChangeTeamOnce: {
        return event === Music.Event.ChangeTeam ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
      case Condition.Type.MusicStart: {
        return event === Music.Event.MusicStart ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
      case Condition.Type.AcStart:
      case Condition.Type.AcStartOnce: {
        return event === Music.Event.AcStart ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
      case Condition.Type.AcSuccess:
      case Condition.Type.AcSuccessOnce: {
        return event === Music.Event.AcSuccess ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
      case Condition.Type.AcFailed: {
        return event === Music.Event.AcFailed ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
      case Condition.Type.SpSkill:
      case Condition.Type.SpSkillOnce: {
        return event === Music.Event.SpSkill ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
      case Condition.Type.Appeal: {
        return event === Music.Event.TapSucceeded || event === Music.Event.TapFailed
          ? CheckConditionType.Rate
          : CheckConditionType.Failed;
      }
      case Condition.Type.Critical: {
        return event === Music.Event.Critical ? CheckConditionType.Rate : CheckConditionType.Failed;
      }
    }
  }

  private applyPlayerEffect(actor: SkillHandler.Actor, event: Music.Event, actress: SchoolIdol | null, effect: Effect) {
    if (this.logLevel === SkillHandler.LogLevel.Debug) {
      this.events.push({ actor, event, cardId: actress?.card.id ?? null, payload: { effect } });
    }
    this.playerStatus.applyEffect(effect);
    switch (effect.type) {
      case SkillEffect.VoltageGain: {
        return this.invoke(Music.Event.VoltageGain);
      }
      case SkillEffect.StaminaRecovery: {
        if (effect.value && effect.value < 0) {
          return this.invokeDamageSkill(-effect.value);
        }
      }
    }
    return this;
  }

  private applyCardEffect(
    actor: SkillHandler.Actor,
    event: Music.Event,
    actress: SchoolIdol | null,
    target: SchoolIdol,
    passive: boolean,
    effect: Effect,
  ) {
    if (this.logLevel === SkillHandler.LogLevel.Debug) {
      this.events.push({ actor, event, cardId: actress?.card.id ?? null, payload: { target: target.card.id, effect } });
    }
    if (passive) {
      target.status.applyPassiveEffect(effect);
    } else {
      target.status.applyEffect(effect);
    }
    return this;
  }

  private applyEffect<T extends Effect>(
    actor: SkillHandler.Actor,
    event: Music.Event,
    actress: SchoolIdol | null,
    target: SkillTarget,
    passive: boolean,
    effect: T,
  ): this {
    if (this.logLevel === SkillHandler.LogLevel.Info) {
      this.events.push({ actor, event, cardId: actress?.card.id ?? null, payload: { effect } });
    }
    switch (target) {
      case SkillTarget.None: {
        return this.applyPlayerEffect(actor, event, actress, effect);
      }
      case SkillTarget.Everyone: {
        for (const schoolIdol of this.schoolIdols) {
          this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
        }
        return this;
      }
      case SkillTarget.Voltage:
      case SkillTarget.Sp:
      case SkillTarget.Guard:
      case SkillTarget.Skill: {
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol.card.type === (target as string)) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
          }
        }
        return this;
      }
      case SkillTarget.ExVoltage:
      case SkillTarget.ExSp:
      case SkillTarget.ExGuard:
      case SkillTarget.ExSkill: {
        const type = exTypeMap.get(target);
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol.card.type !== type) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
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
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol.card.attribute === (target as string)) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
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
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol.card.attribute !== attribute) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
          }
        }
        return this;
      }
    }
    if (!actress) {
      throw new Error('Actress is required');
    }
    switch (target) {
      case SkillTarget.Myself: {
        return this.applyCardEffect(actor, event, actress, actress, passive, effect);
      }
      case SkillTarget.SameTeam: {
        for (const schoolIdol of this.schoolIdolsMap.get(actress.team)!) {
          this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
        }
        return this;
      }
      case SkillTarget.SameGrade: {
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol.idol.grade === actress.idol.grade) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
          }
        }
        return this;
      }
      case SkillTarget.SameSchool: {
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol.idol.school === actress.idol.school) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
          }
        }
        return this;
      }
      case SkillTarget.Friends: {
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol !== actress) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
          }
        }
        return this;
      }
      case SkillTarget.SameType: {
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol.card.type === actress.card.type) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
          }
        }
        return this;
      }
      case SkillTarget.SameAttribute: {
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol.card.attribute === actress.card.attribute) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
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
        for (const schoolIdol of this.schoolIdols) {
          if (schoolIdol.idol.id === (target as string)) {
            this.applyCardEffect(actor, event, actress, schoolIdol, passive, effect);
          }
        }
        return this;
      }
    }
  }

  private invokeUserSkill(
    actor: SkillHandler.Actor,
    event: Music.Event,
    actress: SchoolIdol | null,
    cardSkill: CardSkill,
    passive: boolean,
    until?: Music.Event,
  ): this {
    const skill = this.skillMap.get(cardSkill.skillId)!;
    const { fields } = skill;
    let coefficient = 1;
    let { target, effect: skillEffect } = skill;
    switch (skillEffect) {
      case SkillEffect.DamageReduction:
      case SkillEffect.AppealUp:
      case SkillEffect.AppealDown:
      case SkillEffect.VoltageUp:
      case SkillEffect.TechniqueUp:
      case SkillEffect.CriticalUp:
      case SkillEffect.CriticalRateUp:
      case SkillEffect.SkillInvocationUp:
      case SkillEffect.SkillInvocationDown:
      case SkillEffect.SpGaugeGainUp: {
        switch (skillEffect) {
          case SkillEffect.AppealDown: {
            coefficient = -1;
            skillEffect = SkillEffect.AppealUp;
            break;
          }
          case SkillEffect.SkillInvocationDown: {
            coefficient = -1;
            skillEffect = SkillEffect.SkillInvocationUp;
            break;
          }
        }
        const rate = coefficient * EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        const notes = EffectSimulator.getField(fields, 'notes', cardSkill.skillFields, 0);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
          rate,
          until: until ?? this.notes + notes + 1,
        });
      }
      case SkillEffect.AppealDownTeam: {
        const rate = -1 * EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.AppealUp,
          rate,
          until: until ?? Music.Event.ChangeTeam,
        });
      }
      case SkillEffect.VoltageUpAc:
      case SkillEffect.CriticalRateAc:
      case SkillEffect.CriticalUpAc:
      case SkillEffect.SpGaugeGainUpAc:
      case SkillEffect.SkillInvocationUpAc:
      case SkillEffect.DamageReductionAc: {
        switch (skillEffect) {
          case SkillEffect.VoltageUpAc: {
            skillEffect = SkillEffect.VoltageUp;
            break;
          }
          case SkillEffect.CriticalRateAc:
          case SkillEffect.CriticalUpAc: {
            skillEffect = SkillEffect.CriticalUp;
            break;
          }
          case SkillEffect.SkillInvocationUpAc: {
            skillEffect = SkillEffect.SkillInvocationUp;
            break;
          }
          case SkillEffect.SpGaugeGainUpAc: {
            skillEffect = SkillEffect.SpGaugeGainUp;
            break;
          }
          case SkillEffect.DamageReductionAc: {
            skillEffect = SkillEffect.DamageReduction;
            break;
          }
        }
        const rate = EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
          rate,
          until: until ?? this.acEnd + 1,
        });
      }
      case SkillEffect.AppealUpType:
      case SkillEffect.CriticalUpType: {
        switch (skillEffect) {
          case SkillEffect.AppealUpType: {
            skillEffect = SkillEffect.AppealUp;
            break;
          }
          case SkillEffect.CriticalUpType: {
            skillEffect = SkillEffect.CriticalUp;
            break;
          }
        }
        const rate = EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        const type: Card.Type | string = EffectSimulator.getField(fields, 'type', cardSkill.skillFields, '');
        const notes = EffectSimulator.getField(fields, 'notes', cardSkill.skillFields, 0);
        const count = this.schoolIdols.reduce((sum, schoolIdol) => sum + Number(schoolIdol.card.type === type), 0);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
          rate: rate * count,
          until: until ?? this.notes + notes + 1,
        });
      }
      case SkillEffect.StaminaRecoveryType: {
        const value = EffectSimulator.getField(fields, 'value', cardSkill.skillFields, 0);
        const type: Card.Type | string = EffectSimulator.getField(fields, 'type', cardSkill.skillFields, '');
        const count = this.schoolIdols.reduce((sum, schoolIdol) => sum + Number(schoolIdol.card.type === type), 0);
        return this.applyEffect(actor, event, actress, SkillTarget.None, passive, {
          type: SkillEffect.StaminaRecovery,
          value: value * count,
        });
      }
      case SkillEffect.DamageReductionPlus:
      case SkillEffect.ChangeTeamPlus:
      case SkillEffect.AppealPlus:
      case SkillEffect.AppealMinus:
      case SkillEffect.VoltagePlus:
      case SkillEffect.VoltageLimitPlus:
      case SkillEffect.TechniquePlus:
      case SkillEffect.CriticalPlus:
      case SkillEffect.CriticalRatePlus:
      case SkillEffect.SkillInvocationPlus:
      case SkillEffect.SpSkillPlus:
      case SkillEffect.SpGaugeGainPlus:
      case SkillEffect.SpGaugeGainMinus:
      case SkillEffect.StaminaPlus: {
        switch (skillEffect) {
          case SkillEffect.DamageReductionPlus:
          case SkillEffect.ChangeTeamPlus: {
            target = SkillTarget.None;
            break;
          }
          case SkillEffect.AppealMinus: {
            coefficient = -1;
            skillEffect = SkillEffect.AppealPlus;
            break;
          }
          case SkillEffect.SpGaugeGainMinus: {
            coefficient = -1;
            skillEffect = SkillEffect.SpGaugeGainPlus;
            break;
          }
        }
        const rate = coefficient * EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
          rate,
          until,
        });
      }
      case SkillEffect.VoltageLimitPlusCritical: {
        // TODO: implement this case
        return this;
      }
      case SkillEffect.Deactivation: {
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
        });
      }
      case SkillEffect.AppealUpAndStaminaRecovery: {
        if (!actress) {
          throw new Error('Actress not found');
        }
        const notes = EffectSimulator.getRateField(fields, 'notes', cardSkill.skillFields);
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', cardSkill.skillFields);
        const targetParam = EffectSimulator.getField(fields, 'parameter', cardSkill.skillFields, '');
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', cardSkill.skillFields);
        const targetValue = actress.status[targetParam] ?? 0;
        const bonus = this.getTargetParameterBonus(targetParam);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.AppealUp,
          rate: rate1,
          until: this.notes + notes + 1,
        }).applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.StaminaRecovery,
          value: Math.floor(targetValue * rate2 * bonus),
        });
      }
      case SkillEffect.CriticalRateUpAndCriticalUp: {
        const notes = EffectSimulator.getRateField(fields, 'notes', cardSkill.skillFields);
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', cardSkill.skillFields);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.CriticalRateUp,
          rate: rate1,
          until: this.notes + notes + 1,
        }).applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.CriticalUp,
          rate: rate2,
          until: this.notes + notes + 1,
        });
      }
      case SkillEffect.AppealPlusAndStaminaPlus: {
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', cardSkill.skillFields);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.AppealPlus,
          rate: rate1,
        }).applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.StaminaPlus,
          rate: rate2,
        });
      }
      case SkillEffect.AppealPlusAndTechniquePlus: {
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', cardSkill.skillFields);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.AppealPlus,
          rate: rate1,
        }).applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.TechniquePlus,
          rate: rate2,
        });
      }
      case SkillEffect.TechniquePlusAndStaminaPlus: {
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', cardSkill.skillFields);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.TechniquePlus,
          rate: rate1,
        }).applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.StaminaPlus,
          rate: rate2,
        });
      }
      case SkillEffect.SpGaugeGainRate:
      case SkillEffect.StaminaRecovery:
      case SkillEffect.VoltageGain:
      case SkillEffect.SpSkillUp:
      case SkillEffect.ShieldGain: {
        if (!actress) {
          throw new Error('Actress not found');
        }
        switch (skillEffect) {
          case SkillEffect.SpGaugeGainRate: {
            skillEffect = SkillEffect.SpGaugeGain;
            break;
          }
        }
        const rate = EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        const targetParam = EffectSimulator.getField(fields, 'parameter', cardSkill.skillFields, '');
        const targetValue = actress.status[targetParam] ?? 0;
        const bonus = this.getTargetParameterBonus(targetParam);
        return this.applyEffect(actor, event, actress, SkillTarget.None, passive, {
          type: skillEffect,
          value: Math.floor(targetValue * rate * bonus),
        });
      }
      case SkillEffect.SpSkillPlusParam: {
        if (!actress) {
          throw new Error('Actress not found');
        }
        const rate = EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        const targetParam = EffectSimulator.getField(fields, 'parameter', cardSkill.skillFields, '');
        const targetValue = actress.status[targetParam] ?? 0;
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
          value: Math.floor(targetValue * rate),
          until: this.notes + 1 + 1,
        });
      }
      case SkillEffect.SpSkillPlusType: {
        const rate = EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        const type: Card.Type | string = EffectSimulator.getField(fields, 'type', cardSkill.skillFields, '');
        const counts = this.schoolIdols.filter((schoolIdol) => schoolIdol.card.type === type).length;
        return this.applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.SpSkillPlus,
          rate: rate * counts,
          until,
        });
      }
      case SkillEffect.VoltageGainAndAppealUp: {
        if (!actress) {
          throw new Error('Actress not found');
        }
        const targetParam = EffectSimulator.getField(fields, 'parameter', cardSkill.skillFields, '');
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', cardSkill.skillFields);
        const notes = EffectSimulator.getField(fields, 'notes', cardSkill.skillFields, 0);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', cardSkill.skillFields);
        const targetValue = actress.status[targetParam] ?? 0;
        const bonus = this.getTargetParameterBonus(targetParam);
        return this.applyEffect(actor, event, actress, SkillTarget.None, passive, {
          type: SkillEffect.VoltageGain,
          value: Math.floor(targetValue * rate1 * bonus),
        }).applyEffect(actor, event, actress, target, passive, {
          type: SkillEffect.AppealUp,
          rate: rate2,
          until: until ?? this.notes + notes + 1,
        });
      }
      case SkillEffect.ShieldGainValue: {
        skillEffect = SkillEffect.ShieldGain;
      }
      // falls through
      case SkillEffect.SpGaugeGain:
      case SkillEffect.Damage:
      case SkillEffect.ComboCount:
      case SkillEffect.ChangeTeamNotesLose: {
        const value = EffectSimulator.getField(fields, 'value', cardSkill.skillFields, 0);
        return this.applyEffect(actor, event, actress, SkillTarget.None, passive, {
          type: skillEffect,
          value,
        });
      }
      case SkillEffect.SpGaugeGainRateAndSpSkillUp:
      case SkillEffect.StaminaRecoveryAndShieldGain: {
        let effect1: SkillEffect;
        let effect2: SkillEffect;
        switch (skillEffect) {
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
        const rate1 = EffectSimulator.getRateField(fields, 'rate1', cardSkill.skillFields);
        const rate2 = EffectSimulator.getRateField(fields, 'rate2', cardSkill.skillFields);
        const param1 = EffectSimulator.getField(fields, 'parameter1', cardSkill.skillFields, '');
        const param2 = EffectSimulator.getField(fields, 'parameter2', cardSkill.skillFields, '');
        const targetValue1 = status[param1] ?? 0;
        const targetValue2 = status[param2] ?? 0;
        const target = SkillTarget.None;
        return this.applyEffect(actor, event, actress, target, passive, {
          type: effect1,
          value: Math.floor(targetValue1 * rate1),
        }).applyEffect(actor, event, actress, target, passive, {
          type: effect2,
          value: Math.floor(targetValue2 * rate2),
        });
      }
      case SkillEffect.Revival: {
        const rate = EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, SkillTarget.None, passive, {
          type: skillEffect,
          rate,
        });
      }
      case SkillEffect.AttributeBonusPlus: {
        const rate = EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
          rate,
        });
      }
      case SkillEffect.TeamEffectReductionPlus: {
        throw new Error('Team Effect Reduction should not be called as UserSkill');
      }
      // accessory skills
      case SkillEffect.AppealPlusStamina:
      case SkillEffect.CriticalPlusStamina:
      case SkillEffect.SkillInvocationPlusStamina:
      case SkillEffect.SpGaugeGainPlusStamina:
      case SkillEffect.DamageReductionPlusStamina: {
        switch (skillEffect) {
          case SkillEffect.AppealPlusStamina: {
            skillEffect = SkillEffect.AppealUp;
            break;
          }
          case SkillEffect.CriticalPlusStamina: {
            skillEffect = SkillEffect.CriticalUp;
            break;
          }
          case SkillEffect.SkillInvocationPlusStamina: {
            skillEffect = SkillEffect.SkillInvocationUp;
            break;
          }
          case SkillEffect.SpGaugeGainPlusStamina: {
            skillEffect = SkillEffect.SpGaugeGainUp;
            break;
          }
          case SkillEffect.DamageReductionPlusStamina: {
            skillEffect = SkillEffect.DamageReduction;
            break;
          }
        }
        const rate = EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
          rate: rate * this.playerStatus.staminaRate,
          until: this.notes + 1,
        });
      }
      case SkillEffect.CriticalPlusCombo: {
        switch (skillEffect) {
          case SkillEffect.CriticalPlusCombo: {
            skillEffect = SkillEffect.CriticalUp;
            break;
          }
        }
        const rate = EffectSimulator.getRateField(fields, 'rate', cardSkill.skillFields);
        const comboBonus = simulator.bonus.combo.find((bonus) => this.playerStatus.combo >= bonus.threshold)!.skillRate;
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
          rate: rate * comboBonus,
          until: this.notes + 1,
        });
      }
      case SkillEffect.StaminaRecoveryCombo:
      case SkillEffect.ShieldGainValueCombo: {
        switch (skillEffect) {
          case SkillEffect.StaminaRecoveryCombo: {
            skillEffect = SkillEffect.StaminaRecovery;
            break;
          }
          case SkillEffect.ShieldGainValueCombo: {
            skillEffect = SkillEffect.ShieldGain;
            break;
          }
        }
        const value = EffectSimulator.getField(fields, 'value', cardSkill.skillFields, 0);
        const comboBonus = simulator.bonus.combo.find((bonus) => this.playerStatus.combo >= bonus.threshold)!.skillRate;
        return this.applyEffect(actor, event, actress, target, passive, {
          type: skillEffect,
          value: Math.floor(value * comboBonus),
        });
      }
      // TODO: implement
      case SkillEffect.CriticalRateUpAndVoltageUp:
      case SkillEffect.SpSkillOverChargeAndSpSkillUpEx: {
        return this;
      }
    }
  }

  private getTargetParameterBonus(targetParam: string) {
    const bonuses: Rate[] = [];
    if (this.sp) {
      bonuses.push(simulator.bonus.sp);
    }
    switch (targetParam) {
      case 'appeal': {
        if (this.acStatus !== Music.AcStatus.None) {
          bonuses.push(simulator.bonus.ac);
        }
      }
    }
    return bonuses.reduce((sum, rate) => sum * rate, 1);
  }

  private invokeMusicSkill(event: Music.Event, cardSkill: CardSkill, passive: boolean, until?: Music.Event): this {
    if (!cardSkill.skillId) {
      return this;
    }
    return this.invokeUserSkill(SkillHandler.Actor.System, event, null, cardSkill, passive, until);
  }
}

enum CheckConditionType {
  Success,
  Rate,
  Failed,
}

export namespace SkillHandler {
  export type TapRateMap = Omit<Record<Music.TapEvent, Rate>, Music.TapEvent.Critical>;

  export enum Actor {
    System,
    Idol,
    Accessory,
  }

  export interface UserSkillStats {
    cardSkill: CardSkill;
    schoolIdol: SchoolIdol;
    count: Value;
  }

  export interface Event<T> {
    actor: Actor;
    event: Music.Event;
    cardId: Id | null;
    payload?: T;
  }

  export interface SystemEvent<T> extends Event<T> {
    actor: Actor.System;
  }

  export interface IdolEvent<T> extends Event<T> {
    actor: Actor.Idol;
    cardId: Id;
    index: number;
  }

  export interface AccessoryEvent<T> extends Event<T> {
    actor: Actor.Accessory;
    index: number;
  }

  export enum LogLevel {
    Debug,
    Info,
    None,
  }
}
