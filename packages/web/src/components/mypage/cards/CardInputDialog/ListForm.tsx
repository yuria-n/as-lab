import React, { memo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Checkbox, Table } from 'semantic-ui-react';

import { entities, utils } from '@as-lab/core';

import { CardSearchInput } from '../../../universal/cards/CardSearchInput';
import { Display, getCardTitle } from '../../../../utils';
import { ModalContent, ModalActions, CardImg, RegisterButton } from '../../../universal';
import { useCard, useUserCard, useIdol } from '../../../../hooks';

interface Props {
  onClick: () => void;
}

export const ListForm = memo(Component, utils.makeEqual(['onClick']));

export function Component({ onClick }: Props) {
  const [selectedCardSet, setSelectedCardSet] = useState<Set<entities.Card['id']>>(new Set());
  const [availableCards, setAvailableCards] = useState<entities.Card[]>([]);
  const [filteredCards, setFilteredCards] = useState<entities.Card[]>([]);

  const { cards: allCards, getCards } = useCard();
  const { idolMap, getIdols } = useIdol();
  const { userCards, createUserCards } = useUserCard();
  useEffect(() => {
    getCards();
    getIdols();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (allCards.length === 0) {
      return;
    }
    const cardIdSet = new Set(userCards.map((card) => card.id));
    const cards = allCards
      .filter((card) => card.rarity !== entities.Card.Rarity.R)
      .filter((card) => !cardIdSet.has(card.id));
    setAvailableCards(cards);
  }, [userCards, allCards]);

  const handleClickRow = (event: any) => {
    const cardId = event.currentTarget?.dataset?.id;
    if (!cardId) {
      return;
    }
    setSelectedCardSet((set) =>
      set.has(cardId) ? new Set(Array.from(set).filter((id) => id !== cardId)) : new Set([...set, cardId]),
    );
  };
  const disabled = selectedCardSet.size === 0;
  const handleRegisterClick = () => {
    if (disabled) {
      return;
    }
    const userCards = availableCards
      .filter((card) => selectedCardSet.has(card.id))
      .map((card) => ({
        id: card.id,
        appeal: card.appeal,
        technique: card.technique,
        stamina: card.stamina,
        skill: {
          skillFields: card.skill.skillFields,
          conditionFields: card.skill.conditionFields,
        },
        personalSkills: card.personalSkills.map((skill) => ({
          skillFields: skill.skillFields,
          conditionFields: skill.conditionFields,
        })),
        inspirationSkillIds: [],
        updatedAt: Date.now(),
      }));
    createUserCards(userCards);
    onClick();
  };

  return (
    <>
      <ModalContent>
        <CardSearchInput cards={availableCards} onChange={setFilteredCards} />
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell />
              <Table.HeaderCell />
              <Table.HeaderCell>名前</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredCards.map((card) => (
              <Table.Row data-id={card.id} key={card.id} onClick={handleClickRow}>
                <Table.Cell>
                  <Checkbox checked={selectedCardSet.has(card.id)} />
                </Table.Cell>
                <Table.Cell>
                  <StyledImg id={card.id} />
                </Table.Cell>
                <Table.Cell>{getCardTitle(card, idolMap.get(card.idolId)!, Display.Both)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </ModalContent>
      <ModalActions>
        <RegisterButton disabled={disabled} onClick={handleRegisterClick} />
      </ModalActions>
    </>
  );
}

const StyledImg = styled(CardImg)`
  width: 2.5rem;
  height: 2.5rem;
`;
