import styled from 'styled-components';
import React, { memo, useCallback, useEffect, useState } from 'react';
import { Label } from 'semantic-ui-react';
import { entities, utils } from '@as-lab/core';

import { AbilityInput } from '../../../universal/cards';
import { CardNameInput } from './CardNameInput';
import { Flex, InputLabel, Loader, ModalActions, ModalContent, RegisterButton } from '../../../universal';
import { HandleType, getColor, handleChange } from '../../../../utils';
import { InspirationSkillInput } from '../InspirationSkillInput';
import { SkillSlag, TemplateInput } from '../../../universal/skills';
import { inspirationSkillLabels, personalSkillNum, uiColorMap } from '../../../../constants';
import { useCard, useCondition, useInspirationSkill, useSkill, useUserCard } from '../../../../hooks';

type ConditionFields = entities.UserSkill['conditionFields'];

interface Props {
  updateCardId: string;
  onClick: () => void;
}

export const Form = memo(Component);

export function Component({ updateCardId, onClick: onButtonClick }: Props) {
  const [cardId, setCardId] = useState(updateCardId);
  const [appeal, setAppeal] = useState(0);
  const [stamina, setStamina] = useState(0);
  const [technique, setTechnique] = useState(0);
  const [skillFields, setSkillFields] = useState<any[]>([]);
  const [conditionFields, setConditionFields] = useState<ConditionFields>([]);
  const [personalSkillFields1, setPersonalSkillFields1] = useState<any[]>([]);
  const [personalConditionFields1, setPersonalConditionFields1] = useState<ConditionFields>([]);
  const [personalSkillFields2, setPersonalSkillFields2] = useState<any[]>([]);
  const [personalConditionFields2, setPersonalConditionFields2] = useState<ConditionFields>([]);
  const [inspirationSkillIds, setInspirationSkillIds] = useState<entities.Skill['id'][]>(
    new Array(personalSkillNum).fill(''),
  );

  const { userCards, createUserCard, updateUserCard } = useUserCard();
  const { cards, getCards } = useCard();
  const { skillMap, skillTargetTitleMap, getSkillMap, getSkillTargetTitleMap } = useSkill();
  const { conditionMap, getConditions } = useCondition();
  const { inspirationSkills: masterInspirationSkills, getInspirationSkills } = useInspirationSkill();

  const edit = !!updateCardId;

  useEffect(() => {
    getCards();
    getSkillMap();
    getConditions();
    getSkillTargetTitleMap();
    getInspirationSkills();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setCardId(updateCardId);
  }, [updateCardId]);

  useEffect(() => {
    const nextCard = edit ? userCards.find(({ id }) => id === cardId) : cards.find(({ id }) => id === cardId);
    if (!nextCard) {
      return;
    }
    setAppeal(nextCard.appeal);
    setStamina(nextCard.stamina);
    setTechnique(nextCard.technique);
    setSkillFields([...nextCard.skill.skillFields]);
    setConditionFields([...nextCard.skill.conditionFields]);
    const [personalSkill1, personalSkill2] = nextCard.personalSkills;
    setPersonalSkillFields1([...personalSkill1.skillFields]);
    setPersonalConditionFields1([...personalSkill1.conditionFields]);
    setPersonalSkillFields2([...personalSkill2.skillFields]);
    setPersonalConditionFields2([...personalSkill2.conditionFields]);
    if (!('inspirationSkillIds' in nextCard)) {
      return;
    }
    setInspirationSkillIds(nextCard.inspirationSkillIds);
  }, [cardId]); // eslint-disable-line react-hooks/exhaustive-deps

  const onRegisterButtonClick = useCallback(() => {
    const params: entities.UserCard = {
      id: cardId,
      appeal,
      stamina,
      technique,
      skill: {
        skillFields,
        conditionFields,
      },
      personalSkills: [
        {
          skillFields: personalSkillFields1,
          conditionFields: personalConditionFields1,
        },
        {
          skillFields: personalSkillFields2,
          conditionFields: personalConditionFields2,
        },
      ],
      inspirationSkillIds,
      updatedAt: Date.now(),
    };
    if (edit) {
      updateUserCard(params);
    } else {
      createUserCard(params);
    }
    onButtonClick();
  }, [
    cardId,
    appeal,
    stamina,
    technique,
    skillFields,
    conditionFields,
    personalSkillFields1,
    personalConditionFields1,
    personalSkillFields2,
    personalConditionFields2,
    inspirationSkillIds,
    edit,
    updateUserCard,
    createUserCard,
    onButtonClick,
  ]);

  if (
    !cards ||
    !skillMap ||
    utils.isEmpty(skillTargetTitleMap) ||
    conditionMap.size === 0 ||
    masterInspirationSkills.length === 0
  ) {
    return <Loader />;
  }

  const cardMap = new Map(cards.map((c) => [c.id, c]));
  const card = cardMap.get(cardId);

  const skill = card ? skillMap.get(card.skill.skillId) : null;
  const condition = skill ? conditionMap.get(skill.condition) : null;

  const pSkills = card?.personalSkills.map((skill) => skillMap.get(skill.skillId)) ?? [];
  const [pSkill1, pSkill2] = pSkills;
  const [pSkillCondition1, pSkillCondition2] = pSkills.map((pSkill) =>
    pSkill ? conditionMap.get(pSkill.condition) : null,
  );

  return (
    <>
      <ModalContent>
        <Flex padding="1rem 0" direction="column" align="flex-start">
          <CardNameInput filter edit={edit} cardId={cardId} setter={setCardId} />
        </Flex>

        <Flex padding="0.5rem 0 1rem 0" justify="flex-start">
          <AbilityInput name="appeal" label="アピール" value={appeal} disabled={!cardId} setter={setAppeal} tip />
          <AbilityInput name="stamina" label="スタミナ" value={stamina} disabled={!cardId} setter={setStamina} tip />
          <AbilityInput
            name="technique"
            label="テクニック"
            value={technique}
            disabled={!cardId}
            setter={setTechnique}
            tip
          />
        </Flex>

        <Flex padding="1rem 0" direction="column" align="flex-start">
          <InputLabel>特技</InputLabel>
          {skill && (
            <>
              <Title>{card?.skill.title}</Title>
              <SkillSlag skill={skill} conditionMap={conditionMap} skillTargetTitleMap={skillTargetTitleMap} />
              <TemplateInput
                template={skill.description}
                fields={skill.fields}
                values={skillFields}
                onChange={(index, value) =>
                  setSkillFields((fields) => {
                    fields = [...fields];
                    fields[index] = value;
                    return fields;
                  })
                }
              />
              <Flex padding="1rem 0" justify="flex-start">
                <TemplateInput
                  template={condition?.description ?? ''}
                  fields={condition?.fields}
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
            </>
          )}
        </Flex>

        <Flex padding="1rem 0" direction="column" align="flex-start">
          <InputLabel>個性</InputLabel>
          {pSkill1 && (
            <StyledFrame>
              <Flex padding="0 0 1rem" justify="flex-start">
                <Label>個性１</Label>
              </Flex>
              <SkillSlag skill={pSkill1} conditionMap={conditionMap} skillTargetTitleMap={skillTargetTitleMap} />
              <TemplateInput
                template={pSkill1.description ?? ''}
                fields={pSkill1.fields ?? []}
                values={personalSkillFields1}
                onChange={(index, value) =>
                  setPersonalSkillFields1((fields) => {
                    fields = [...fields];
                    fields[index] = value;
                    return fields;
                  })
                }
              />
              {pSkillCondition1 && (
                <Flex padding="1rem 0" justify="flex-start">
                  <TemplateInput
                    template={pSkillCondition1.description ?? ''}
                    fields={pSkillCondition1.fields ?? []}
                    values={personalConditionFields1}
                    onChange={(index, value) =>
                      setPersonalConditionFields1((fields) => {
                        fields = [...fields];
                        fields[index] = value;
                        return fields;
                      })
                    }
                  />
                </Flex>
              )}
            </StyledFrame>
          )}

          {pSkill2 && (
            <StyledFrame>
              <Flex padding="0 0 1rem" justify="flex-start">
                <Label>個性２</Label>
              </Flex>
              <SkillSlag skill={pSkill2} conditionMap={conditionMap} skillTargetTitleMap={skillTargetTitleMap} />
              <TemplateInput
                template={pSkill2.description ?? ''}
                fields={pSkill2.fields ?? []}
                values={personalSkillFields2}
                onChange={(index, value) =>
                  setPersonalSkillFields2((fields) => {
                    fields = [...fields];
                    fields[index] = value;
                    return fields;
                  })
                }
              />
              {pSkillCondition2 && (
                <Flex padding="1rem 0" justify="flex-start">
                  <TemplateInput
                    template={pSkillCondition2.description ?? ''}
                    fields={pSkillCondition2.fields ?? []}
                    values={personalConditionFields2}
                    onChange={(index, value) =>
                      setPersonalConditionFields2((fields) => {
                        fields = [...fields];
                        fields[index] = value;
                        return fields;
                      })
                    }
                  />
                </Flex>
              )}
            </StyledFrame>
          )}
        </Flex>

        <Flex padding="1rem 0 0" direction="column" align="stretch">
          <InputLabel>ひらめきスキル</InputLabel>
          {inspirationSkillLabels.map((label, index) => (
            <InspirationSkillInput
              key={`${cardId}-${label}`}
              label={label}
              inspirationSkillId={inspirationSkillIds[index]}
              onChange={handleChange<entities.Skill['id']>(HandleType.Generic, (value) =>
                setInspirationSkillIds((skills) => {
                  skills = [...skills];
                  skills[index] = value;
                  return skills;
                }),
              )}
            />
          ))}
        </Flex>
      </ModalContent>

      <ModalActions>
        <RegisterButton onClick={onRegisterButtonClick}>{edit ? '更新' : '登録'}</RegisterButton>
      </ModalActions>
    </>
  );
}

const Title = styled.h4`
  margin: 0 0 1rem;
`;

const StyledFrame = styled.div`
  width: 100%;
  margin: 0 0 1rem;
  padding: 1rem;
  border: 1px solid ${getColor(uiColorMap.black, 700, 0.3)};
  border-radius: 4px;
`;
