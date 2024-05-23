import React, { memo, useEffect, useState } from 'react';
import { Input } from 'semantic-ui-react';

import { entities, utils } from '@as-lab/core';

import { inspirationSkillLabels, personalSkillLabels, personalSkillNum } from '../../../../constants';
import { Flex, RegisterButton, InputLabel, DeleteButton, Grid, ModalContent, ModalActions } from '../../../universal';
import { useCard, useUserFriend } from '../../../../hooks';
import { handleChange, HandleType } from '../../../../utils';
import { CardNameInput } from '../../cards/CardInputDialog/CardNameInput';
import { InspirationSkillInput } from '../../cards/InspirationSkillInput';
import { PersonalSkillInput } from './PersonalSkillInput';

interface Props {
  id?: entities.UserFriend['id'];
  onUpdate: () => void;
}

export const Form = memo(Component, utils.makeEqual(['onUpdate']));

export function Component({ id, onUpdate }: Props) {
  const [userFriend, setUserFriend] = useState<entities.UserFriend | null>(null);
  const [name, setName] = useState('');
  const [cardId, setCardId] = useState<entities.UserFriend['card']['id']>('');
  const [card, setCard] = useState<entities.Card | null>(null);
  const [personalSkills, setPersonalSkills] = useState<entities.FriendCard['personalSkills'] | null>(null);
  const [inspirationSkillIds, setInspirationSkillIds] = useState<entities.FriendCard['inspirationSkillIds']>(
    new Array(personalSkillNum).fill(''),
  );

  const { userFriends, createUserFriend, updateUserFriend, deleteUserFriend } = useUserFriend();

  const { cards, getCards } = useCard();

  const edit = !!id;
  const disabled = !cardId || !personalSkills;

  useEffect(() => {
    getCards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!id) {
      return;
    }
    const userFriend = userFriends.find((friend) => friend.id === id);
    if (!userFriend) {
      return;
    }
    setUserFriend(userFriend);
    setName(userFriend.name);
    setCardId(userFriend.card.id);
    setInspirationSkillIds(userFriend.card.inspirationSkillIds);
  }, [id, userFriends]);

  useEffect(() => {
    if (!cards) {
      return;
    }
    const card = cards.find((c) => c.id === cardId);
    setCard(card ?? null);
    if (card) {
      setPersonalSkills(userFriend?.card.id === cardId ? userFriend.card.personalSkills : card.personalSkills);
    }
  }, [cardId, cards, userFriend]);

  const onClick = () => {
    if (!cardId || !personalSkills) {
      return;
    }
    const userFriend = {
      name,
      card: {
        id: cardId,
        personalSkills,
        inspirationSkillIds,
      },
    };
    edit ? updateUserFriend({ id: id!, ...userFriend }) : createUserFriend(userFriend);
    onUpdate();
  };
  const onDelete = () => {
    if (!id) {
      return;
    }
    deleteUserFriend(id);
    onUpdate();
  };

  return (
    <>
      <ModalContent>
        <Flex padding="0 0 1rem 0" direction="column" align="stretch">
          <InputLabel>フレンド名</InputLabel>
          <Input
            fluid
            placeholder="フレンド名"
            value={name}
            onChange={handleChange(HandleType.String, setName, { trim: false })}
          />
        </Flex>

        <Flex padding="0 0 1rem 0" direction="column" align="stretch">
          <CardNameInput cardId={cardId} setter={setCardId} />
        </Flex>

        <Flex padding="0 0 1rem 0" direction="column" align="stretch">
          <InputLabel>個性</InputLabel>
          {personalSkillLabels.map((label, index) => {
            if (!card || !personalSkills) {
              return null;
            }
            const skill = personalSkills[index];
            if (!skill) {
              return null;
            }
            return (
              <PersonalSkillInput
                key={label}
                label={label}
                skillId={card.personalSkills[index].skillId}
                skillFields={skill.skillFields}
                conditionFields={skill.conditionFields}
                onChange={handleChange<entities.UserSkill>(HandleType.Generic, (value) =>
                  setPersonalSkills((skills) => {
                    if (!skills) {
                      throw new Error('personalSkills does not exist');
                    }
                    skills = [...skills];
                    skills[index] = value;
                    return skills;
                  }),
                )}
              />
            );
          })}
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
        <Grid columns="repeat(2, auto)" gap="0.5rem" justifyContent="start">
          <RegisterButton disabled={disabled} onClick={onClick}>
            {edit ? '更新' : '登録'}
          </RegisterButton>
          {edit && <DeleteButton onClick={onDelete} />}
        </Grid>
      </ModalActions>
    </>
  );
}
