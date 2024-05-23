import React, { memo, useEffect, useState } from 'react';
import { Label } from 'semantic-ui-react';
import styled from 'styled-components';
import { entities } from '@as-lab/core';

import { uiColorMap } from '../../../../constants';
import { getColor } from '../../../../utils';
import { useCondition, useSkill } from '../../../../hooks';
import { Flex } from '../../../universal';
import { TemplateInput } from '../../../universal/skills';

interface Props extends entities.UserSkill {
  label: string;
  skillId: entities.Skill['id'];
  onChange: (userSkill: entities.UserSkill) => void;
}

export const PersonalSkillInput = memo(Component);

function Component({
  label,
  skillId,
  skillFields: prevSkillFields,
  conditionFields: prevConditionFields,
  onChange,
}: Props) {
  const [skill, setSkill] = useState<entities.Skill | null>(null);
  const [skillFields, setSkillFields] = useState<any[]>(prevSkillFields);
  const [conditionFields, setConditionFields] = useState<entities.UserSkill['conditionFields']>(prevConditionFields);

  const { skillMap, skillTargetTitleMap, getSkillMap, getSkillTargetTitleMap } = useSkill();
  const { conditions, getConditions } = useCondition();

  useEffect(() => {
    getSkillMap();
    getConditions();
    getSkillTargetTitleMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!skillId) {
      return;
    }
    const skill = skillMap.get(skillId);
    if (!skill) {
      return;
    }
    setSkill(skill);
    setSkillFields(prevSkillFields);
    setConditionFields(prevConditionFields);
  }, [skillId, skillMap, prevSkillFields, prevConditionFields]);

  useEffect(() => {
    if (!skillFields || !conditionFields) {
      return;
    }
    onChange({ skillFields, conditionFields });
  }, [skillFields, conditionFields]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!skill) {
    return <div />;
  }

  const target = skill ? skillTargetTitleMap[skill.target] : 'なし';
  const condition = skill ? conditions.find(({ type }) => type === skill.condition) : null;
  const conditionTitle = condition?.title ?? '';

  return (
    <StyledFrame>
      <Flex padding="0 0 1rem" justify="flex-start">
        <Label>{label}</Label>
        <SlugText>
          {`${skill.slug}${
            /(パッシブ|発動確率)/.test(conditionTitle)
              ? `${target === 'なし' ? '' : ` : ${target}`}`
              : ` / ${conditionTitle}${target === 'なし' ? '' : ` : ${target}`}`
          }`}
        </SlugText>
      </Flex>

      <TemplateInput
        template={skill.description ?? ''}
        fields={skill.fields ?? []}
        values={skillFields}
        onChange={(index, value) =>
          setSkillFields((fields) => {
            fields = [...fields];
            fields[index] = value;
            return fields;
          })
        }
      />

      {condition && (
        <Flex padding="1rem 0" justify="flex-start">
          <TemplateInput
            template={condition.description ?? ''}
            fields={condition.fields ?? []}
            values={conditionFields}
            onChange={(index, value) =>
              setConditionFields((fields) => {
                fields = [...fields];
                fields[index] = value;
                return fields;
              })
            }
          />
        </Flex>
      )}
    </StyledFrame>
  );
}

const StyledFrame = styled.div`
  width: 100%;
  margin: 0 0 1rem;
  padding: 1rem;
  border: 1px solid ${getColor(uiColorMap.black, 700, 0.3)};
  border-radius: 4px;
`;

const SlugText = styled.p`
  margin: 0 auto 0 0.5rem;
  font-weight: bold;
`;
