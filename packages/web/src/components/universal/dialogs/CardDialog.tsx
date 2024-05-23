import styled from 'styled-components';
import React, { memo, useEffect } from 'react';
import { entities } from '@as-lab/core';

import { AbilityInput, CardImg, Flex, InputLabel } from '..';
import { Display, getCardTitle } from '../../../utils';
import { Modal, ModalContent } from '../Modal';
import { SkillSlag, TemplateInput } from '../skills';
import { rankMap } from '../../../constants';
import { useCondition, useIdol, useInspirationSkill, useSkill } from '../../../hooks';

const emptyConditionSet = new Set([entities.Condition.Type.Passive, entities.Condition.Type.Probability]);

interface Props {
  open: boolean;
  card: entities.Card | null;
  userCard?: entities.UserCard | null;
  onClose: () => void;
}

export const CardDialog = memo(Component);

function Component({ open, card, userCard, onClose }: Props) {
  const { skillMap, getSkillMap, skillTargetTitleMap, getSkillTargetTitleMap } = useSkill();
  const { conditionMap, getConditions } = useCondition();
  const { idolMap, getIdols } = useIdol();
  const { inspirationSkills, getInspirationSkills } = useInspirationSkill();

  useEffect(() => {
    getSkillMap();
    getSkillTargetTitleMap();
    getConditions();
    getIdols();
    getInspirationSkills();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!card || !idolMap || !skillMap || !conditionMap) {
    return null;
  }
  const skill = skillMap.get(card.skill.skillId);
  if (!skill) {
    return null;
  }
  const condition = conditionMap.get(skill.condition);
  if (!condition) {
    return null;
  }
  const idol = idolMap.get(card.idolId);
  if (!idol) {
    return null;
  }
  const iSkillIds = userCard?.inspirationSkillIds.filter((skillId) => skillId);
  return (
    <Modal open={open} onClose={onClose} header="カード詳細">
      <ModalContent>
        <CardImg id={card.id} />
        <Title>{getCardTitle(card, idol, Display.Both)}</Title>
        <Flex padding="0.5rem 0 1rem 0" justify="flex-start">
          <AbilityInput name="appeal" label="アピール" value={userCard?.appeal ?? card.appeal} disabled />
          <AbilityInput name="stamina" label="スタミナ" value={userCard?.stamina ?? card.stamina} disabled />
          <AbilityInput name="technique" label="テクニック" value={userCard?.technique ?? card.technique} disabled />
        </Flex>
        <Flex padding="1rem 0" direction="column" align="flex-start">
          <InputLabel>特技</InputLabel>
          <Title>{card.skill.title}</Title>
          <SkillSlag skill={skill} conditionMap={conditionMap} skillTargetTitleMap={skillTargetTitleMap} />
          <TemplateInput
            template={skill.description}
            fields={skill.fields}
            values={userCard?.skill.skillFields ?? card.skill.skillFields}
          />
          <TemplateInput
            template={condition.description}
            fields={condition.fields}
            values={userCard?.skill.conditionFields ?? card.skill.conditionFields}
          />
        </Flex>
        {card.personalSkills.map((personalSkill, index) => {
          const skill = skillMap.get(personalSkill.skillId);
          if (!skill) {
            return null;
          }
          const condition = conditionMap.get(skill.condition);
          if (!condition) {
            return null;
          }
          const skillValues = userCard?.personalSkills[index] ?? personalSkill;
          return (
            <Flex key={index} padding="1rem 0" direction="column" align="flex-start">
              <InputLabel>個性{index + 1}</InputLabel>
              <SkillSlag skill={skill} conditionMap={conditionMap} skillTargetTitleMap={skillTargetTitleMap} />
              <TemplateInput template={skill.description} fields={skill.fields} values={skillValues.skillFields} />
              <TemplateInput
                template={condition.description}
                fields={condition.fields}
                values={skillValues.conditionFields}
              />
            </Flex>
          );
        })}
        {!!iSkillIds?.length && (
          <Flex padding="1rem 0" direction="column" align="flex-start">
            <InputLabel>ひらめきスキル</InputLabel>
            {iSkillIds.map((skillId, index) => {
              const iSkill = inspirationSkills.find(({ id }) => id === skillId);
              const skill = skillMap.get(iSkill!.skillId);
              const condition = emptyConditionSet.has(skill!.condition)
                ? ''
                : conditionMap.get(skill!.condition)?.title;
              const target = skill!.target === entities.SkillTarget.None ? '' : skillTargetTitleMap[skill!.target];
              return (
                <p key={index}>
                  {`${skill!.slug}[${rankMap[iSkill!.rank]}]${
                    condition ? `:${condition}${target && `/${target}`}` : `${target && `:${target}`}`
                  }
                    `}
                </p>
              );
            })}
          </Flex>
        )}
      </ModalContent>
    </Modal>
  );
}

const Title = styled.h4`
  margin: 0 0 1rem;
`;
