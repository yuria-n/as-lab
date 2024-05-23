import React, { memo, useEffect, useState } from 'react';
import { Table } from 'semantic-ui-react';

import { entities, utils } from '@as-lab/core';

import { useAcCondition, useCondition, useSkill } from '../../../hooks';
import { TemplateInput } from '../../universal/skills/TemplateInput';
import { Grid, GridItem } from '../../universal';

export const MusicInfo = memo(Component);

interface Props {
  liveStage: entities.Music.LiveStage | null;
}

interface AcInfo {
  info: entities.Music.AppealChance;
  notes: {
    start: entities.Music.Note['count'];
    end: entities.Music.Note['count'];
  };
}

type NoteGimmickNotesMap = Map<Index, Value[]>;

function Component({ liveStage }: Props) {
  const [acList, setAcList] = useState<AcInfo[]>([]);
  const [gimmickNotesMap, setGimmickNotesMap] = useState<NoteGimmickNotesMap>(new Map());

  const { acConditions, getAcConditions } = useAcCondition();
  const { conditions, getConditions } = useCondition();
  const { skillMap, skillTargetTitleMap, getSkillMap, getSkillTargetTitleMap } = useSkill();

  useEffect(() => {
    getAcConditions();
    getConditions();
    getSkillMap();
    getSkillTargetTitleMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!liveStage) {
      return;
    }
    const acNotes = liveStage.notes.filter(
      (note) => note.type === entities.Music.NoteType.AcStart || note.type === entities.Music.NoteType.AcEnd,
    );
    const acList: AcInfo[] = liveStage.appealChances.map((ac, index) => {
      return {
        info: ac,
        notes: {
          start: acNotes[index * 2].count,
          end: acNotes[index * 2 + 1].count,
        },
      };
    });
    setAcList(acList);

    const notesMap: NoteGimmickNotesMap = new Map(liveStage.noteGimmicks.map((_, index) => [index, []]));
    for (const note of liveStage.notes) {
      if (note.gimmickIndex === -1) {
        continue;
      }
      notesMap.get(note.gimmickIndex)!.push(note.count);
    }
    setGimmickNotesMap(notesMap);
  }, [liveStage]);
  if (
    !liveStage ||
    acConditions.length === 0 ||
    conditions.length === 0 ||
    skillMap.size === 0 ||
    utils.isEmpty(skillTargetTitleMap)
  ) {
    return null;
  }
  const acConditionMap = utils.toMap(acConditions, 'type');
  const conditionMap = utils.toMap(conditions, 'type');
  return (
    <Grid gap="1.5rem">
      <GridItem>
        <h3>楽曲情報</h3>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>効果</Table.HeaderCell>
              <Table.HeaderCell>対象</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {liveStage.stageGimmicks.map((gimmick, index) => {
              const stageSkill = skillMap.get(gimmick.skillId);
              return (
                <Table.Row key={index}>
                  <Table.Cell>
                    <TemplateInput
                      template={gimmick.description ?? stageSkill?.description ?? ''}
                      fields={stageSkill?.fields}
                      values={gimmick.skillFields}
                    />
                  </Table.Cell>
                  <Table.Cell>{stageSkill && skillTargetTitleMap[stageSkill.target]}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </GridItem>
      <GridItem>
        <h3>ノーツギミック情報</h3>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>効果</Table.HeaderCell>
              <Table.HeaderCell>条件</Table.HeaderCell>
              <Table.HeaderCell>対象</Table.HeaderCell>
              <Table.HeaderCell>出現ノーツ</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {liveStage.noteGimmicks.map((gimmick, index) => {
              const skill = skillMap.get(gimmick.skillId);
              const condition = skill ? conditionMap.get(skill.condition) : null;
              const notes = gimmickNotesMap.get(index);
              return (
                <Table.Row key={index}>
                  <Table.Cell>
                    <TemplateInput
                      template={skill?.description ?? ''}
                      fields={skill?.fields}
                      values={gimmick.skillFields}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TemplateInput
                      template={condition?.description ?? ''}
                      fields={condition?.fields}
                      values={gimmick.conditionFields}
                    />
                  </Table.Cell>
                  <Table.Cell>{skill && skillTargetTitleMap[skill.target]}</Table.Cell>
                  <Table.Cell>{notes ? notes.join(', ') : ''}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </GridItem>
      <GridItem>
        <h3>アピールチャンス情報</h3>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>成功条件</Table.HeaderCell>
              <Table.HeaderCell>特殊効果</Table.HeaderCell>
              <Table.HeaderCell>対象</Table.HeaderCell>
              <Table.HeaderCell>開始ノーツ</Table.HeaderCell>
              <Table.HeaderCell>終了ノーツ</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {acList.map((ac, index) => {
              const condition = acConditionMap.get(ac.info.condition);
              const skill = ac.info.skill ? skillMap.get(ac.info.skill.skillId) : null;
              return (
                <Table.Row key={index}>
                  <Table.Cell>
                    <TemplateInput
                      template={condition?.description ?? ''}
                      fields={condition?.fields}
                      values={ac.info.conditionFields}
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <TemplateInput
                      template={skill?.description.replace(/ゲーム終了時まで/, '') ?? ''}
                      fields={skill?.fields}
                      values={ac.info.skill?.skillFields}
                    />
                  </Table.Cell>
                  <Table.Cell>{skill && skillTargetTitleMap[skill.target]}</Table.Cell>
                  <Table.Cell>{ac.notes.start}</Table.Cell>
                  <Table.Cell>{ac.notes.end}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      </GridItem>
    </Grid>
  );
}
