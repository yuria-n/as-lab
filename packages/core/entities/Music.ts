import { AcCondition } from './AcCondition';
import { Card } from './Card';
import { CardSkill } from './BaseSkill';

export namespace Music {
  export enum Difficulty {
    Easy = 'easy',
    Medium = 'medium',
    Hard = 'hard',
    Expert = 'expert',
  }

  export enum NoteGimmickType {
    None,
  }

  export enum NoteAction {
    Tap = 1,
    Up = 4,
    Down = 5,
    Left = 6,
    Right = 7,
  }

  export enum NotePosition {
    Left = 1,
    Right,
  }

  export enum NoteType {
    Tap = 1,
    LongTapStart,
    LongTapEnd,
    AcStart,
    AcEnd,
  }

  export interface BaseNoteGimmick extends CardSkill {
    id: number;
    effect_m_id: number;
  }

  export interface BaseStageGimmick extends CardSkill {
    description: string;
    gimmick_master_id: number;
    skill_master_id: number;
  }

  export interface Note {
    id: number;
    count: number;
    time: Timestamp;
    action: NoteAction;
    position: NotePosition;
    type: NoteType;
    gimmickIndex: Index;
  }

  export interface AppealChance {
    skill: CardSkill | null;
    condition: AcCondition.Type;
    conditionFields: Value[];
    bonusVoltage: Value;
    damage: Value;
  }

  export interface StageGimmick extends CardSkill {
    description?: string;
  }

  export type NoteGimmick = CardSkill;

  export interface Info {
    id: Id;
    title: Title;
    attribute: Card.Attribute;
    difficulty: Difficulty;
  }

  export interface LiveStage extends Info {
    spGauge: Value;
    damage: Value;
    stamina: Value;
    targetVoltage: Value;
    notes: Music.Note[];
    appealChances: Music.AppealChance[];
    noteGimmicks: Music.NoteGimmick[];
    stageGimmicks: Music.StageGimmick[];
  }

  export interface List {
    musics: Info[];
  }

  export enum TapEvent {
    Miss = 'miss',
    Bad = 'bad',
    Good = 'good',
    Great = 'great',
    Wonderful = 'wonderful',
    Critical = 'critical',
  }

  export enum Event {
    Passive = 1 << 12,
    Music,
    MusicStart,
    MusicFailed,
    TapFailed,
    TapSucceeded,
    Damage,
    VoltageGain,
    AcStart,
    AcSuccess,
    AcEnd,
    AcFailed,
    SpSkill,
    Critical,
    ChangeTeam,
    TeamEffect,
  }

  export enum AcStatus {
    None,
    Ongoing,
    Success,
  }
}
