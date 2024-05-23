import { BaseSimulator, EffectSimulator, SupportCard } from './support';
import {
  Card,
  Condition,
  Deck,
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
  UserCard,
  UserFriend,
  UserIdol,
} from '../../entities';
import { PriorityQueue, assert, compact, groupBy, sortBy, sum, times, toMap, uniq } from '../../utils';
import { simulator } from '../../constants';

export enum TeamType {
  Voltage = 'voltage',
  Appeal = 'appeal',
  Technique = 'technique',
  Stamina = 'stamina',
  SkillInvocation = 'skillInvocation',
  Sp = 'sp',
  Support = 'support',
}

const first = 0;
const center = Math.floor((simulator.teamNum * 3) / 2);
const voltageWeight = 1_000_000;

export class DeckSimulator extends BaseSimulator {
  static readonly defaultOptions: Required<Pick<DeckSimulator.Options, DeckSimulator.DefaultOption>> = {
    teams: [
      { team: Deck.Team.Red, type: TeamType.Voltage, defender: true, reductions: [] },
      { team: Deck.Team.Green, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
      { team: Deck.Team.Blue, type: TeamType.Support, target: Deck.Team.Red, reductions: [] },
    ],
    spTeam: true,
    notes: 150,
    acCount: 5,
    reduction: { param: Parameter.Appeal, rate: 0.2 },
    schoolBonus: 0.2,
    gradeBonus: 0.2,
    voltageLimit: 0.2,
    damage: 300,
    wonderful: 1,
    difficulty: Music.Difficulty.Hard,
    spWeight: 1,
    spGauge: simulator.sp.gauge,
    spGaugeGain: simulator.sp.gaugeGain,
    changeTeam: 1,
  };
  static readonly defenderEffectSet = new Set([
    SkillEffect.StaminaRecovery,
    SkillEffect.StaminaRecoveryAndShieldGain,
    SkillEffect.ShieldGain,
  ]);

  private readonly effectSimulator: EffectSimulator;
  protected options: DeckSimulator.Options & typeof DeckSimulator.defaultOptions;
  private readonly userCards: UserCard[];
  private readonly userFriend: UserCard | null;
  private readonly userCardMap: Map<Id, UserCard>;
  private readonly idolMap: Map<Id, Idol>;
  private readonly cardMap: Map<Id, Card>;
  private readonly inspirationSkillMap: Map<Id, InspirationSkill>;
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
    options: DeckSimulator.Options = {},
  ) {
    super(toMap(conditions, 'type'), {
      ...DeckSimulator.defaultOptions,
      ...options,
    });
    this.idolMap = toMap(idols, 'id');
    this.cardMap = toMap(cards, 'id');
    this.userCards = userCards.filter((card) => (this.cardMap.get(card.id)?.rarity ?? Card.Rarity.R) !== Card.Rarity.R);
    this.userCardMap = toMap(userCards, 'id');
    this.userIdolMap = toMap(userIdols, 'id');
    this.inspirationSkillMap = toMap(inspirationSkills, 'id');
    this.effectSimulator = new EffectSimulator(
      this.cardMap,
      this.skillMap,
      toMap(inspirationSkills, 'id'),
      toMap(kizunaSkills, 'id'),
      this.userIdolMap,
      null,
      this.options.friend ?? null,
    );
    this.validate();
  }

  private validate() {
    assert(this.userCards.length >= simulator.teamNum * 3, 'Insufficient user cards');
    assert(
      this.userCards.every((card) => this.cardMap.has(card.id)),
      'Card not found',
    );
    if (!this.options.deckCards) {
      return;
    }
    assert(this.options.deckCards.length === 9, 'Invalid deck card size');
    const map = groupBy(this.options.deckCards, (card) => card?.team);
    assert(
      Object.values(Deck.Team).every((team) => map.get(team)?.length ?? 0 <= simulator.teamNum),
      'Invalid team size',
    );
  }

  simulate(): Deck.Card[] {
    const bestSpTeam = this.options.spTeam ? this.simulateSpTeam(this.userCards) : [];
    this.setCenterForFriend(bestSpTeam);

    const teamMap = new Map<Deck.Team, UserCard[]>();
    const taken: UserCard[] = [];
    for (const options of this.options.teams) {
      if (options.type === TeamType.Support) {
        continue;
      }
      const userCards = this.simulateMainTeam(options, bestSpTeam, taken);
      taken.push(...userCards);
      teamMap.set(options.team, userCards);
    }

    for (const options of this.options.teams) {
      if (options.type !== TeamType.Support) {
        continue;
      }
      const mainCards = teamMap.get(options.target);
      if (!mainCards) {
        throw new Error('Invalid target');
      }
      const mainOptions = this.options.teams.find(({ team }) => options.target === team);
      if (!mainOptions) {
        throw new Error('Main team not found');
      }
      if (mainOptions.type === TeamType.Support) {
        throw new Error('Invalid main type');
      }
      const userCards = this.simulateSupportTeam(options, mainOptions, mainCards, bestSpTeam, taken);
      taken.push(...userCards);
      teamMap.set(options.team, userCards);
    }
    const takenSet = new Set(taken);
    const spTeam =
      this.options.spTeam && bestSpTeam.every((team) => takenSet.has(team)) ? bestSpTeam : this.simulateSpTeam(taken);

    const reverseMap = new Map<UserCard, Deck.Team>();
    for (const [team, userCards] of teamMap) {
      for (const card of userCards) {
        reverseMap.set(card, team);
      }
    }

    // fill pre-registered cards
    const spSet = new Set(spTeam);
    const mainSet = new Set(teamMap.values().next().value);
    const deckCards = [...(this.options.deckCards ?? [])];
    const removeCard = (userCard: UserCard): Deck.Card => {
      spSet.delete(userCard);
      mainSet.delete(userCard);
      const team = reverseMap.get(userCard);
      if (!team) {
        throw new Error('User card has been removed');
      }
      reverseMap.delete(userCard);
      return { team, cardId: userCard.id };
    };
    for (const deckCard of deckCards) {
      if (!deckCard) {
        continue;
      }
      removeCard(this.userCardMap.get(deckCard.cardId)!);
    }

    // fill center
    if (!deckCards[center]) {
      const mainCard = spTeam.find((card) => mainSet.has(card)) ?? spTeam[first];
      deckCards[center] = removeCard(mainCard);
    }
    const centerCard = deckCards[center];
    assert(centerCard, 'Center should exist');
    if (this.options.friend && centerCard.cardId !== this.effectSimulator.getCenterCardId()) {
      const deckCards = this.options.deckCards ?? [];
      assert(!deckCards[center], 'Pre registered center should not exist');
      deckCards[center] = { cardId: centerCard.cardId, team: centerCard.team };
      this.options = { ...this.options, deckCards };
      return this.simulate();
    }

    // fill sp team
    times(simulator.teamNum, (count) => {
      const index = count + simulator.teamNum;
      if (deckCards[index]) {
        return;
      }
      deckCards[index] = removeCard(spSet.values().next().value);
    });

    return times(simulator.teamNum * 3, (index) => {
      const deckCard = deckCards[index];
      if (deckCard) {
        return deckCard;
      }
      return removeCard(reverseMap.keys().next().value);
    });
  }

  private setCenterForFriend(spTeam: UserCard[]) {
    const reservedCenter = this.options.deckCards?.[center];
    if (reservedCenter) {
      this.effectSimulator.setCenterCardId(reservedCenter.cardId);
      return this;
    }
    if (spTeam.length !== 0) {
      this.effectSimulator.setCenterCardId(spTeam[first].id);
      return this;
    }
    return this;
  }

  private simulateMainTeam(options: DeckSimulator.MainTeamOptions, spCards: UserCard[], skipCards: UserCard[]) {
    const deckCards = compact(this.options.deckCards);
    const reservedCards = deckCards
      .filter((card) => card.team === options.team)
      .map(({ cardId }) => this.userCardMap.get(cardId)!);
    if (reservedCards.length === simulator.teamNum) {
      return reservedCards;
    }
    const spVoltage = this.getSpVoltage(spCards);
    const skipCardSet = new Set([...deckCards.map(({ cardId }) => this.userCardMap.get(cardId)!), ...skipCards]);
    const userCards = this.userCards.filter((card) => !skipCardSet.has(card));
    const [param, second] = this.getParameter(options);
    const top3 = this.simulateTeam(
      param,
      second,
      simulator.teamNum,
      spVoltage,
      reservedCards,
      userCards,
      options.reductions,
    );
    if (!options.defender || this.hasDefender(top3)) {
      return top3;
    }
    const top2 = this.simulateTeam(
      param,
      second,
      simulator.teamNum - 1,
      spVoltage,
      reservedCards,
      userCards,
      options.reductions,
    );
    const defenders = this.hasDefender(top2)
      ? userCards
      : userCards.filter((userCard) => this.hasDefenderEffect(userCard));
    return this.simulateTeam(param, second, simulator.teamNum, spVoltage, top2, defenders, options.reductions);
  }

  private getSpVoltage(spCards: UserCard[]) {
    const spLimit = simulator.sp.voltage.limit[this.options.difficulty];
    const spVoltage = this.getSupportCards([], spCards, false, []).reduce((sum, card) => sum + card.spVoltage, 0);
    return Math.min(this.options.spWeight * spVoltage, spLimit);
  }

  private getParameter(options: DeckSimulator.MainTeamOptions): [Parameter, Parameter] {
    switch (options.type) {
      case TeamType.Voltage: {
        return [Parameter.VoltageWithCritical, Parameter.Stamina];
      }
      case TeamType.Appeal: {
        return [Parameter.Appeal, Parameter.VoltageWithCritical];
      }
      case TeamType.Technique: {
        return [Parameter.Technique, Parameter.VoltageWithCritical];
      }
      case TeamType.Stamina: {
        return [Parameter.Stamina, Parameter.VoltageWithCritical];
      }
      case TeamType.SkillInvocation: {
        return [Parameter.SkillInvocation, Parameter.VoltageWithCritical];
      }
    }
  }

  private hasDefender(userCards: UserCard[]) {
    return userCards.some((userCard) => this.hasDefenderEffect(userCard));
  }

  private hasDefenderEffect({ id }: UserCard) {
    const effect = this.skillMap.get(this.cardMap.get(id)?.skill.skillId ?? '')?.effect;
    return effect && DeckSimulator.defenderEffectSet.has(effect);
  }

  private simulateTeam(
    param: Parameter,
    secondParam: Parameter,
    teamNum: number,
    spVoltage: Value,
    reservedCards: UserCard[],
    userCards: UserCard[],
    reductions: BaseSimulator.Reduction[],
  ) {
    const reservedSet = new Set(reservedCards);
    userCards = userCards
      .filter((userCard) => !reservedSet.has(userCard))
      .map(
        (card) =>
          [
            card,
            sum(
              this.getMainTeamScore(param, secondParam, spVoltage, this.getSupportCards([card], [], false, reductions)),
            ),
          ] as const,
      )
      .sort(([, s1], [, s2]) => s2 - s1)
      .map(([card]) => card);
    const skipNum = teamNum - reservedCards.length;
    const selectedCards = [...reservedCards, ...userCards.slice(0, skipNum)];
    let currentScores = this.getMainTeamScore(
      param,
      secondParam,
      spVoltage,
      this.getSupportCards(selectedCards, [], false, reductions),
    );
    let maxScore = sum(currentScores);
    for (const userCard of userCards.slice(skipNum)) {
      let target = -1;
      for (let i = reservedCards.length; i < teamNum; i++) {
        const prev = selectedCards[i];
        selectedCards[i] = userCard;
        const nextScores = this.getMainTeamScore(
          param,
          secondParam,
          spVoltage,
          this.getSupportCards(selectedCards, [], false, reductions),
        );
        const score = sum(nextScores);
        if (score > maxScore) {
          maxScore = score;
          target = i;
          currentScores = nextScores;
        }
        selectedCards[i] = prev;
      }
      if (target !== -1) {
        selectedCards[target] = userCard;
      }
    }
    return sortBy(selectedCards, (deck, index) => -currentScores[index]);
  }

  /**
   *
   * reqNotes = gauge / gain
   * counts = notes / reqNotes
   * volPerNote = spVol * counts / notes
   *            = spVol * (notes / reqNotes) / notes
   *            = spVol / reqNotes
   *            = spVol / reqNotes
   *            = spVol / (gauge / gain)
   *            = spVol * gain / gauge
   */
  private getMainTeamScore(param: Parameter, secondParam: Parameter, spVoltage: Value, supportCards: SupportCard[]) {
    return supportCards.map((card) => {
      const spVol = (spVoltage * card.spGaugeGain) / this.options.spGauge;
      const value = card[param];
      const total = value + spVol;
      return total * voltageWeight + card[secondParam];
    });
  }

  private getTeamScores(param: Parameter, secondParam: Parameter, supportCards: SupportCard[], limit = 0) {
    if (!limit) {
      return supportCards.map((card) => card[param] * voltageWeight + card[secondParam]);
    }
    const total = sum(supportCards.map((card) => card[param]));
    const reduction = Math.max((total - limit) / 3, 0);
    return supportCards.map((card) => (card[param] - reduction) * voltageWeight + card[secondParam]);
  }

  private getSupportCards(
    sameTeamCards: UserCard[],
    otherTeamCards: UserCard[],
    filterOtherTeam: boolean,
    reductions: BaseSimulator.Reduction[],
  ) {
    const otherCardSet = new Set(otherTeamCards);
    const userCards = [...sameTeamCards, ...otherTeamCards];
    const helpers = userCards.map((userCard) => this.effectSimulator.getHelper(userCard));
    const supportCards: SupportCard[] = userCards.map((userCard) => {
      const card = this.cardMap.get(userCard.id);
      assert(card, 'Card should exist');
      const idol = this.idolMap.get(card.idolId);
      assert(idol, 'Idol should exist');
      return new SupportCard(userCard, card, idol, !otherCardSet.has(userCard), this.options);
    });
    for (const supportCard of supportCards) {
      this.applyAttributeBonusAndReduction(supportCard);
      this.applyIdolBonus(supportCard);
      this.applyVoltageLimit(supportCard);
      for (const reduction of reductions) {
        this.applyReduction(supportCard, reduction);
      }
    }
    this.applyEffects(supportCards, helpers);
    return filterOtherTeam ? supportCards.filter((card) => card.sameTeam) : supportCards;
  }

  private simulateSupportTeam(
    options: DeckSimulator.SupportTeamOptions,
    mainOptions: DeckSimulator.MainTeamOptions,
    mainCards: UserCard[],
    spCards: UserCard[],
    skipCards: UserCard[],
  ): UserCard[] {
    const deckCards = compact(this.options.deckCards);
    const skipCardSet = new Set([
      ...mainCards,
      ...skipCards,
      ...deckCards.filter((card) => card.team !== options.team).map(({ cardId }) => this.userCardMap.get(cardId)!),
    ]);
    const reservedCards = uniq([
      ...deckCards.filter((card) => card.team === options.team).map(({ cardId }) => this.userCardMap.get(cardId)!),
      ...spCards,
    ]).filter((card) => !skipCardSet.has(card));
    if (reservedCards.length >= simulator.teamNum) {
      return reservedCards.slice(0, simulator.teamNum);
    }
    const computationNum = simulator.teamNum - reservedCards.length;
    for (const reserved of reservedCards) {
      skipCardSet.add(reserved);
    }
    const queue = new PriorityQueue<SupportScore>((d1, d2) => d1.score < d2.score);
    const [param] = this.getParameter(mainOptions);
    const second = Parameter.Stamina;
    const mainScore = sum(
      this.getTeamScores(param, second, this.getSupportCards(mainCards, [], false, options.reductions)),
    );
    for (const card of this.userCards) {
      if (skipCardSet.has(card)) {
        continue;
      }
      const score =
        sum(this.getTeamScores(param, second, this.getSupportCards(mainCards, [card], true, options.reductions))) -
        mainScore;
      queue.push({ card, score });
      if (queue.size() > computationNum) {
        queue.pop();
      }
    }
    const supports: UserCard[] = [...reservedCards];
    while (queue.size()) {
      supports.unshift(queue.pop().card);
    }
    return supports;
  }

  private simulateSpTeam(userCards: UserCard[]) {
    const reservedCards = compact(
      this.options.deckCards?.filter((_, index) => index >= simulator.teamNum && index < simulator.teamNum * 2),
    ).map(({ cardId }) => this.userCardMap.get(cardId)!);
    if (reservedCards.length === simulator.teamNum) {
      return reservedCards;
    }
    const deckCardSet = new Set(compact(this.options.deckCards).map(({ cardId }) => this.userCardMap.get(cardId)!));
    userCards = userCards.filter((userCard) => !deckCardSet.has(userCard));
    const skipNum = simulator.teamNum - reservedCards.length;
    const selectedCards = [...reservedCards, ...userCards.slice(0, skipNum)];
    const param = Parameter.SpVoltage;
    const second = Parameter.VoltageWithCritical;
    const spLimit = simulator.sp.voltage.limit[this.options.difficulty];
    let currentScores = this.getTeamScores(param, second, this.getSupportCards([], selectedCards, false, []), spLimit);
    let maxScore = sum(currentScores);
    for (const userCard of userCards.slice(skipNum)) {
      let target = -1;
      for (let i = reservedCards.length; i < simulator.teamNum; i++) {
        const prev = selectedCards[i];
        selectedCards[i] = userCard;
        const nextScores = this.getTeamScores(
          param,
          second,
          this.getSupportCards([], selectedCards, false, []),
          spLimit,
        );
        const score = sum(nextScores);
        if (score > maxScore) {
          maxScore = score;
          target = i;
          currentScores = nextScores;
        }
        selectedCards[i] = prev;
      }
      if (target !== -1) {
        selectedCards[target] = userCard;
      }
    }
    return sortBy(selectedCards, (deck, index) => -currentScores[index]);
  }
}

interface SupportScore {
  card: UserCard;
  score: number;
}

export namespace DeckSimulator {
  export type DeckCard = Deck.Card | null;
  export type Reduction = BaseSimulator.Reduction;

  export interface MainTeamOptions {
    team: Deck.Team;
    type: TeamType.Voltage | TeamType.Appeal | TeamType.Technique | TeamType.Stamina | TeamType.SkillInvocation;
    defender: boolean;
    reductions: BaseSimulator.Reduction[];
  }

  export interface SupportTeamOptions {
    team: Deck.Team;
    type: TeamType.Support;
    target: Deck.Team;
    reductions: BaseSimulator.Reduction[];
  }

  export type TeamOptions = MainTeamOptions | SupportTeamOptions;

  export interface Options {
    teams?: TeamOptions[];
    spTeam?: boolean;
    deckCards?: DeckCard[];
    notes?: Value;
    acCount?: Value;
    attribute?: Card.Attribute;
    reduction?: BaseSimulator.Reduction;
    school?: School;
    schoolBonus?: Value;
    grade?: Grade;
    gradeBonus?: Value;
    voltageLimit?: Rate;
    damage?: Value;
    wonderful?: Rate;
    difficulty?: Music.Difficulty;
    spWeight?: Value;
    spGauge?: Value;
    spGaugeGain?: Record<Card.Rarity, Value>;
    changeTeam?: Value;
    friend?: UserFriend | null;
  }
  export type DefaultOption =
    | 'teams'
    | 'spTeam'
    | 'notes'
    | 'acCount'
    | 'reduction'
    | 'schoolBonus'
    | 'gradeBonus'
    | 'voltageLimit'
    | 'damage'
    | 'wonderful'
    | 'difficulty'
    | 'spWeight'
    | 'spGauge'
    | 'spGaugeGain'
    | 'changeTeam';

  export interface ScoreDetail {
    main: MainScore;
    sp: MainScore;
  }

  export interface MainScore {
    score: number;
    total: number;
    scores: number[];
    supports: SupportScore[];
  }

  export interface SupportScore {
    total: number;
    scores: number[];
    rates: number[];
  }
}
