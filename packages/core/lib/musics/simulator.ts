import './skill';

import {
  AcCondition,
  AccessoryMap,
  Card,
  Condition,
  Deck,
  Idol,
  InspirationSkill,
  KizunaSkill,
  Music,
  Skill,
  SkillEffect,
  SkillMap,
  UserAccessory,
  UserCard,
  UserDeck,
  UserFriend,
  UserIdol,
} from '../../entities';
import { EffectSimulator } from '../decks';
import { PlayerStatusInterface } from './status';
import { SkillHandler } from './skill';
import { simulator } from '../../constants';
import { toMap } from '../../utils';

export class MusicSimulator {
  static readonly defaultOptions: Required<Pick<MusicSimulator.Options, MusicSimulator.DefaultOption>> = {
    logLevel: SkillHandler.LogLevel.None,
    friend: null,
    changeTeams: [
      {
        notes: 0,
        team: Deck.Team.Red,
      },
    ],
    tapRateMap: {
      [Music.TapEvent.Miss]: 0,
      [Music.TapEvent.Bad]: 0,
      [Music.TapEvent.Good]: 0,
      [Music.TapEvent.Great]: 0,
      [Music.TapEvent.Wonderful]: 1,
    },
  };
  private currentNotesIndex: Value = 0;
  private currentNotes: Value = 0;
  private changeTeamIndex: Value = 0;
  private spStart: Second = -Infinity;
  private spSkillIndex: Value = 0;
  private ac: Music.AcStatus = Music.AcStatus.None;
  private acIndex: Value = -1;
  private acValue: Value = 0;
  private acIdolSet = new Set<Card['id']>();
  private histories: MusicSimulator.History[] = [];
  private readonly skillHandler: SkillHandler;
  private readonly settings: Required<MusicSimulator.Options>;
  private readonly acConditionMap: Map<AcCondition['type'], AcCondition>;
  constructor(
    private readonly idols: Idol[],
    private readonly cards: Card[],
    private readonly skillMap: SkillMap<Skill>,
    private readonly conditions: Condition[],
    private readonly inspirationSkills: InspirationSkill[],
    private readonly kizunaSkills: KizunaSkill[],
    private readonly accessoryMap: AccessoryMap,
    private readonly liveStage: Music.LiveStage,
    acConditions: AcCondition[],
    private readonly userDeck: UserDeck,
    private readonly userIdols: UserIdol[],
    private readonly userCards: UserCard[],
    private readonly userAccessories: UserAccessory[],
    private readonly options: MusicSimulator.Options,
  ) {
    this.settings = {
      ...MusicSimulator.defaultOptions,
      ...options,
    };
    this.acConditionMap = toMap(acConditions, 'type');
    this.skillHandler = new SkillHandler(
      this.idols,
      this.cards,
      this.skillMap,
      this.conditions,
      this.inspirationSkills,
      this.kizunaSkills,
      this.accessoryMap,
      this.liveStage,
      this.userDeck,
      this.userIdols,
      this.userCards,
      this.userAccessories,
      this.settings.friend,
      this.settings.tapRateMap,
      this.settings.logLevel,
    );
  }

  simulate() {
    this.init().start();
    while (this.next()) {} // eslint-disable-line no-empty
    return this.histories;
  }

  init() {
    this.histories = [];
    this.skillHandler.init();
    return this.collectEvents();
  }

  start() {
    this.skillHandler.invoke(Music.Event.MusicStart);
    return this.collectEvents();
  }

  next() {
    if (!this.skillHandler.alive()) {
      return false;
    }
    if (this.liveStage.notes.length === this.currentNotesIndex) {
      const lastNotes = this.liveStage.notes[this.currentNotesIndex - 1];
      this.changeTeam().invokeSpSkill(lastNotes).collectEvents();
      return false;
    }
    const note = this.liveStage.notes[this.currentNotesIndex++];
    this.handlePreAc(note).changeTeam().invokeSpSkill(note).play(note).handlePostAc(note).collectEvents();
    return true;
  }

  getPlayerStatus() {
    return this.skillHandler.playerStatus;
  }

  getSchoolIdols() {
    return this.skillHandler.getSchoolIdols();
  }

  getHistories() {
    return this.histories;
  }

  private changeTeam() {
    if (this.settings.changeTeams.length === this.changeTeamIndex) {
      return this;
    }
    const changeTeam = this.settings.changeTeams[this.changeTeamIndex];
    if (changeTeam.notes > this.currentNotes) {
      return this;
    }
    if (this.getPlayerStatus().changeTeamNotes > 0) {
      return this;
    }
    this.changeTeamIndex++;
    this.skillHandler.changeTeam(changeTeam.team);
    return this;
  }

  private isSp(notes: Music.Note) {
    return notes.time - this.spStart <= simulator.sp.bonusTime;
  }

  private invokeSpSkill(note: Music.Note) {
    if (!this.skillHandler.alive()) {
      return this;
    }
    if (!this.skillHandler.playerStatus.isSpSkillAvailable()) {
      return this;
    }
    if (this.settings.spSkillInvocationNotes.length === this.spSkillIndex) {
      this.skillHandler.invokeSpSkill(this.ac);
      return this;
    }
    const spSkillNotes = this.settings.spSkillInvocationNotes[this.spSkillIndex];
    if (spSkillNotes > this.currentNotes) {
      return this;
    }
    this.spSkillIndex++;
    this.skillHandler.invokeSpSkill(this.ac);
    this.spStart = note.time;
    return this;
  }

  private play(note: Music.Note) {
    const sp = this.isSp(note);
    return this.playNotes(note, sp);
  }

  private playNotes(note: Music.Note, isSp: boolean) {
    if (note.type === Music.NoteType.AcStart || note.type === Music.NoteType.AcEnd) {
      return this;
    }
    if (!this.skillHandler.alive()) {
      return this;
    }
    const noteGimmick = this.liveStage.noteGimmicks[note.gimmickIndex];
    this.skillHandler.prepare(++this.currentNotes).play(this.ac, isSp, noteGimmick);
    return this;
  }

  private collectEvents() {
    if (this.options.logLevel === SkillHandler.LogLevel.None) {
      return this;
    }
    const events = [...this.skillHandler.getEvents()];
    this.histories.push({ events, status: this.skillHandler.playerStatus.toObject() });
    this.skillHandler.clearEvents();
    return this;
  }

  private handlePreAc(note: Music.Note) {
    if (note.type !== Music.NoteType.AcStart) {
      return this;
    }
    if (this.ac) {
      throw new Error('AC already started');
    }
    const ac = this.liveStage.appealChances[++this.acIndex];
    if (!ac) {
      throw new Error('AC not found');
    }
    const acEndIndex = this.liveStage.notes.findIndex(
      (target) => target.id > note.id && target.type === Music.NoteType.AcEnd,
    );
    if (acEndIndex === -1) {
      throw new Error('Ac end not found');
    }
    const prevEndNote = this.liveStage.notes[acEndIndex - 1];
    if (!prevEndNote?.count) {
      throw new Error('prev end note not found');
    }
    this.ac = Music.AcStatus.Ongoing;
    this.acValue = 0;
    this.acIdolSet.clear();
    this.skillHandler.invokeAcSkill(ac.skill, prevEndNote.count).invoke(Music.Event.AcStart);
    return this;
  }

  private handlePostAc(note: Music.Note) {
    if (this.ac === Music.AcStatus.None) {
      return this;
    }
    const ac = this.liveStage.appealChances[this.acIndex];
    const events = this.skillHandler.getEvents();
    const condition = this.acConditionMap.get(ac.condition);
    if (!condition) {
      throw new Error('AC condition not found');
    }
    const target = EffectSimulator.getField(condition.fields, 'value', ac.conditionFields, 0);
    let acSuccess = false;
    switch (condition.type) {
      case AcCondition.Type.Idol: {
        for (const event of events) {
          if (event.payload?.effect?.type !== SkillEffect.VoltageGain || !event.cardId) {
            continue;
          }
          this.acIdolSet.add(event.cardId);
        }
        acSuccess = this.acIdolSet.size >= target;
        break;
      }
      case AcCondition.Type.Voltage: {
        const voltage = events
          .filter((event) => event.payload?.effect?.type === SkillEffect.VoltageGain)
          .reduce((sum, event) => sum + event.payload.effect.value, 0);
        this.acValue += voltage;
        acSuccess = this.acValue >= target;
        break;
      }
      case AcCondition.Type.Sp: {
        const voltage = events
          .filter((event) => event.event === Music.Event.SpSkill)
          .reduce((sum, event) => sum + event.payload.effect.value, 0);
        this.acValue += voltage;
        acSuccess = this.acValue >= target;
        break;
      }
    }
    if (this.ac === Music.AcStatus.Ongoing && acSuccess) {
      this.ac = Music.AcStatus.Success;
      this.skillHandler.invoke(Music.Event.AcSuccess);
    }
    if (note.type !== Music.NoteType.AcEnd) {
      return this;
    }
    this.skillHandler.invoke(Music.Event.AcEnd);
    if (this.ac === Music.AcStatus.Success) {
      this.skillHandler.applyAcBonusVoltage(ac.bonusVoltage);
    } else {
      this.skillHandler.applyAcFailedDamage(this.liveStage.damage * simulator.rate.acFailed);
    }
    this.ac = Music.AcStatus.None;
    return this;
  }
}

export namespace MusicSimulator {
  export interface History {
    events: SkillHandler.Event<any>[];
    status: PlayerStatusInterface;
  }

  export type DefaultOption = 'logLevel' | 'friend' | 'changeTeams' | 'tapRateMap';
  export interface ChangeTeam {
    notes: Value;
    team: Deck.Team;
  }
  export interface Options {
    logLevel?: SkillHandler.LogLevel;
    friend?: UserFriend | null;
    changeTeams?: ChangeTeam[];
    spSkillInvocationNotes: Value[];
    tapRateMap?: SkillHandler.TapRateMap;
  }
}
