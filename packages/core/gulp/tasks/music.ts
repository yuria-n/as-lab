import * as fs from 'fs';
import * as path from 'path';

import * as gulp from 'gulp';
import * as minimist from 'minimist';
import { Music } from '../../entities';

import NoteAction = Music.NoteAction;
import NotePosition = Music.NotePosition;
import NoteType = Music.NoteType;

const args = minimist(process.argv);

import { sortBy, toMap } from '../../utils';
import { getSkillMap } from '../../lib';
import { masters } from '../../data';
import { validateSkill } from './tsv/common';
import { acConditions } from '../../data/masters/musics';
import { Card } from '../../entities/Card';

const musicDirPath = path.resolve(__dirname, '../../data/json/musics');
const rawDirPath = path.resolve(__dirname, '../data/musics');
const distDirPath = path.resolve(musicDirPath, 'stages');

const musicListPath = path.resolve(musicDirPath, 'list.json');

const skillMap = getSkillMap();
const conditionMap = toMap(masters.conditions, 'type');

/**
 *  gulp music:parse --target noExitOrion:hard
 */
gulp.task('music:parse', async () => {
  const target = args.t ?? args.target;
  if (!target) {
    throw new Error('Target is required');
  }
  const targetDir = path.resolve(rawDirPath, target);
  const file: RawData = await import(path.join(targetDir, 'live.json'));
  const data: { info: MusicInfo } = await import(path.join(targetDir, 'info.ts'));
  const [, , , { live }] = file;
  const { gimmickMap, ...info } = data.info;

  const noteGimmickMap = toMap(
    gimmickMap.notes.map((gimmick, index) => ({ ...gimmick, index })),
    'id',
  );
  const noteGimmickIndexMap = new Map<number, Index>();
  const noteGimmicks: Music.NoteGimmick[] = sortBy(live.live_stage.note_gimmicks, (data) => {
    const gimmick = noteGimmickMap.get(data.id);
    if (!gimmick) {
      console.error(data);
      throw new Error('Gimmick not found');
    }
    return gimmick.index;
  }).map((data, index) => {
    const gimmick = noteGimmickMap.get(data.id)!;
    if (gimmick.effect_m_id !== data.effect_m_id) {
      console.error(data);
      throw new Error('Effect Id not matched');
    }
    noteGimmickIndexMap.set(data.id, index);
    const skill: Music.NoteGimmick = {
      skillId: gimmick.skillId,
      skillFields: [...gimmick.skillFields],
      conditionFields: gimmick.conditionFields,
    };
    const arg1 = data.arg_1;
    const arg2 = data.arg_2;
    if (arg1) {
      skill.skillFields[0] = arg1;
    }
    if (arg2) {
      skill.skillFields[1] = arg2;
    }
    validateSkill(skillMap, conditionMap, skill);
    return skill;
  });

  let noteCount = 0;
  const notes: Music.Note[] = live.live_stage.live_notes.map((data) => {
    const gimmickId = data.gimmick_id;
    if (gimmickId !== 0 && !noteGimmickIndexMap.has(gimmickId)) {
      console.error(data);
      throw new Error('Gimmick not found');
    }
    if (!Music.NoteAction[data.note_action]) {
      console.error(data);
      throw new Error('Note action not found');
    }
    if (!Music.NotePosition[data.note_position]) {
      console.error(data);
      throw new Error('Note position not found');
    }
    if (!Music.NoteType[data.note_type]) {
      console.error(data);
      throw new Error('Note type not found');
    }
    const type = data.note_type;
    const common = {
      id: data.id,
      type,
      time: data.call_time,
      action: data.note_action,
      position: data.note_position,
      gimmickIndex: gimmickId === 0 ? -1 : noteGimmickIndexMap.get(gimmickId)!,
    };
    switch (type) {
      case Music.NoteType.Tap:
      case Music.NoteType.LongTapStart:
      case Music.NoteType.LongTapEnd: {
        return {
          ...common,
          count: ++noteCount,
        };
      }
      case Music.NoteType.AcStart: {
        return {
          ...common,
          count: noteCount + 1,
        };
      }
      case Music.NoteType.AcEnd: {
        return {
          ...common,
          count: noteCount,
        };
      }
      default: {
        console.error(data);
        throw new Error('Unknown note type');
      }
    }
  });
  const stageGimmickMap = toMap(gimmickMap.stages, 'gimmick_master_id');
  for (const data of live.live_stage.stage_gimmick_dict[1]) {
    const gimmick = stageGimmickMap.get(data.gimmick_master_id);
    if (!gimmick) {
      console.error(data);
      throw new Error('Gimmick not found');
    }
    if (gimmick.skill_master_id !== data.skill_master_id) {
      console.error(data);
      throw new Error('Skill master ID not matched');
    }
  }

  const acConditionMap = toMap(acConditions, 'id');
  const appealChances: Music.AppealChance[] = live.live_stage.live_wave_settings.map((data, index) => {
    const missionType = data.mission_type.toString();
    const acCondition = acConditionMap.get(missionType);
    if (!acCondition) {
      console.error(data);
      throw new Error('Ac condition not found');
    }
    const gimmick = gimmickMap.appealChances[index];
    if (!gimmick) {
      console.error(data);
      throw new Error('Gimmick not found');
    }
    const appealChance: Music.AppealChance = {
      skill: gimmick.skill,
      condition: acCondition.type,
      conditionFields: [],
      bonusVoltage: data.reward_voltage,
      damage: data.wave_damage,
    };
    if (appealChance.skill) {
      validateSkill(skillMap, conditionMap, appealChance.skill);
    }
    if (data.arg_1) {
      appealChance.conditionFields.push(data.arg_1);
    }
    if (data.arg_2) {
      appealChance.conditionFields.push(data.arg_2);
    }
    return appealChance;
  });
  const id = [...info.title.replace(/!/g, '').split(' '), info.attribute, info.difficulty]
    .filter((str) => str.trim().length !== 0)
    .map((str) => str.toLowerCase())
    .join('_');
  const musicInfo: Music.Info = {
    id,
    title: info.title,
    attribute: info.attribute,
    difficulty: info.difficulty,
  };
  const liveStage: Music.LiveStage = {
    ...info,
    id,
    notes,
    appealChances,
    noteGimmicks,
    stageGimmicks: gimmickMap.stages,
  };
  fs.writeFileSync(path.join(distDirPath, `${id}.json`), JSON.stringify(liveStage, null, 2));

  const musicList: Music.List = await import(musicListPath);
  const index = musicList.musics.findIndex((info) => info.id === id);
  if (index !== -1) {
    musicList.musics.splice(index, 1);
  }
  musicList.musics.push(musicInfo);
  musicList.musics = sortBy(musicList.musics, (info) => info.id);
  fs.writeFileSync(musicListPath, JSON.stringify(musicList, null, 2));
});

export interface MusicInfo {
  title: Title;
  attribute: Card.Attribute;
  difficulty: Music.Difficulty;
  spGauge: Value;
  stamina: Value; // recommended stamina
  damage: Value;
  targetVoltage: Value;
  gimmickMap: {
    notes: Music.BaseNoteGimmick[];
    stages: Music.BaseStageGimmick[];
    appealChances: Pick<Music.AppealChance, 'skill'>[];
  };
}
type RawData = [number, string, number, { live: Live; user_model_diff: unknown }, string];

interface Live {
  cell_id: null; // ?
  deck_id: number; // 1~20?
  is_partner_friend: boolean;
  live_id: number; // unique id?
  live_partner_card: any; // not important for parser
  live_stage: LiveStage;
  live_type: number; // ?
  tower_live: null; // ?
}

interface LiveStage {
  live_difficulty_id: number; // ?
  live_notes: LiveNote[];
  live_wave_settings: LiveWave[];
  note_gimmicks: NoteGimmick[];
  stage_gimmick_dict: [number, StageGimmick[]]; // ??
}

enum AutoJudgeType {
  Great = 20, // maybe
}

interface LiveNote {
  auto_judge_type: AutoJudgeType;
  call_time: number; // ms
  gimmick_id: number; // 50000023, 50000093
  id: number; // note id start from 1
  note_action: NoteAction;
  note_position: NotePosition;
  note_random_drop_color: number; // ??
  note_type: NoteType;
  wave_id: number;
}

interface LiveWave {
  arg_1: number;
  arg_2: number;
  id: number; // from 1
  mission_type: number; // refer to ac condition id
  reward_voltage: number;
  wave_damage: number;
}

interface NoteGimmick {
  arg_1: number;
  arg_2: number;
  effect_m_id: number; // 50012101
  icon_type: number; // 2?
  id: number; // 50000003
  note_gimmick_type: number; // 1?
  unique_id: number; // 2001
}

interface StageGimmick {
  condition_master_id_1: number; // 1
  condition_master_id_2: number; // 2
  gimmick_master_id: number;
  skill_master_id: number;
  uniq_id: number;
}
