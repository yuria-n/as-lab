import React, { useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Dropdown, Input, Label } from 'semantic-ui-react';
import styled from 'styled-components';

import { utils, entities } from '@as-lab/core';

import { handleChange, HandleType } from '../../../utils';
import { rankMap } from '../../../constants';
import { useSkill, useCondition, useInspirationSkill } from '../../../hooks';

type SkillId = entities.InspirationSkill['id'];

enum DropdownType {
  Effect,
  Rank,
  Condition,
  Target,
}

function getUniqueValue<T>([skill, ...rest]: T[], key: keyof T): any {
  return skill && rest.length === 0 ? skill[key] : '';
}

interface Props {
  label: string;
  inspirationSkillId?: SkillId;
  onChange: (id: SkillId) => void;
}

export function InspirationSkillInput({ label, inspirationSkillId, onChange }: Props) {
  const [effect, setEffect] = useState<entities.SkillEffect | ''>('');
  const [rank, setRank] = useState<entities.InspirationSkill.Rank | ''>('');
  const [condition, setCondition] = useState<entities.Condition.Type | ''>('');
  const [target, setTarget] = useState<entities.SkillTarget | ''>('');

  const { skillMap, getSkillMap, skillTargetTitleMap, getSkillTargetTitleMap } = useSkill();
  const { conditions, getConditions } = useCondition();
  const { inspirationSkills, getInspirationSkills } = useInspirationSkill();

  const skills = inspirationSkills
    .filter(({ skillId }) => skillMap.has(skillId))
    .map(({ skillId, rank }) => ({
      ...skillMap.get(skillId)!,
      id: skillId,
      rank,
    }));

  const filteredByEffect = skills.filter((skill) => skill.effect === effect);
  const filteredByRank = filteredByEffect.filter((skill) => skill.rank === rank);
  const filteredByCondition = filteredByRank.filter((skill) => skill.condition === condition);

  const uniqueEffects = utils.uniqBy(skills, (skill) => skill.effect);
  const uniqueRanks = utils.uniqBy(filteredByEffect, (skill) => skill.rank);
  const uniqueConditions = utils.uniqBy(filteredByRank, (skill) => skill.condition);
  const uniqueTargets = utils.uniqBy(filteredByCondition, (skill) => skill.target);

  useEffect(() => {
    getSkillMap();
    getConditions();
    getSkillTargetTitleMap();
    getInspirationSkills();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!inspirationSkillId) {
      return;
    }
    const iSkill = inspirationSkills.find(({ id }) => id === inspirationSkillId);
    if (!iSkill) {
      return;
    }
    const skill = skillMap.get(iSkill.skillId);
    if (!skill) {
      return;
    }
    setEffect(skill.effect);
    setRank(iSkill.rank);
    setCondition(skill.condition);
    setTarget(skill.target);
  }, [inspirationSkillId, inspirationSkills, skillMap]);

  useEffect(() => {
    if (rank) {
      return;
    }
    setRank(getUniqueValue(uniqueRanks, 'rank'));
  }, [effect]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (condition) {
      return;
    }
    setCondition(getUniqueValue(uniqueConditions, 'condition'));
  }, [rank]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (target) {
      return;
    }
    setTarget(getUniqueValue(uniqueTargets, 'target'));
  }, [condition]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (inspirationSkills.length === 0 || uniqueTargets.length === 0) {
      return;
    }
    const id = uniqueTargets.find((skill) => skill.target === target)?.id;
    onChange(inspirationSkills.find((skill) => skill.skillId === id && skill.rank === rank)?.id ?? '');
  }, [target, inspirationSkills]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDropdownChange = function <T>(type: DropdownType, setter: Dispatch<SetStateAction<T>>, value: T) {
    handleChange(HandleType.Generic, setter)(value);
    if (type <= DropdownType.Effect) {
      setRank('');
    }
    if (type <= DropdownType.Rank) {
      setCondition('');
    }
    if (type <= DropdownType.Condition) {
      setTarget('');
    }
  };

  const commonProps = { fluid: true, search: true, selection: true };

  return (
    <StyledInput labelPosition="left" type="text" fluid>
      <Label>{label}</Label>
      <Dropdown
        {...commonProps}
        name="inspiration-skill-effect"
        placeholder="効果"
        value={effect}
        options={uniqueEffects.map(({ effect = '', slug = '' }) => ({
          key: effect,
          value: effect,
          text: slug,
        }))}
        onChange={(_, data) =>
          handleDropdownChange(DropdownType.Effect, setEffect, data.value as entities.SkillEffect | '')
        }
      />
      <Dropdown
        {...commonProps}
        name="inspiration-skill-rank"
        placeholder="ランク"
        value={rank}
        disabled={!effect}
        options={uniqueRanks.map(({ rank }) => ({
          key: rank,
          value: rank,
          text: rankMap[rank],
        }))}
        onChange={(_, data) =>
          handleDropdownChange(DropdownType.Rank, setRank, data.value as entities.InspirationSkill.Rank | '')
        }
      />
      <Dropdown
        {...commonProps}
        name="inspiration-skill-condition"
        placeholder="種別/条件"
        value={condition}
        disabled={!rank}
        options={uniqueConditions.map(({ condition }) => ({
          key: condition,
          value: condition,
          text: conditions.find(({ type }) => type === condition)?.title,
        }))}
        onChange={(_, data) =>
          handleDropdownChange(DropdownType.Condition, setCondition, data.value as entities.Condition.Type | '')
        }
      />
      <Dropdown
        {...commonProps}
        name="inspiration-skill-target"
        placeholder="対象"
        value={target}
        disabled={!condition}
        options={uniqueTargets.map(({ target }) => ({
          key: target,
          value: target,
          text: skillTargetTitleMap[target],
        }))}
        onChange={(_, data) =>
          handleDropdownChange(DropdownType.Target, setTarget, data.value as entities.SkillTarget | '')
        }
      />
    </StyledInput>
  );
}

const StyledInput = styled(Input)`
  margin: 0 0 1rem 0;
`;
