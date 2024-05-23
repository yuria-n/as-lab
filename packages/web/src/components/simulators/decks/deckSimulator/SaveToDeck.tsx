import styled from 'styled-components';
import React, { memo, useState } from 'react';
import { FaCopy } from 'react-icons/fa';
import { entities } from '@as-lab/core';

import { Button, Grid, Modal, ModalActions, ModalContent, NewCard } from '../../../universal';
import { DefaultDeckListCard } from '../../../universal/decks/DefaultDeckListCard';
import { getColor } from '../../../../utils';
import { uiColorMap } from '../../../../constants';
import { useSimulator, useUserDeck } from '../../../../hooks';

interface Props {
  title: entities.UserDeck['title'];
}

export const SaveToDeck = memo(Component);

function Component({ title: defaultTitle }: Props) {
  const [open, setOpen] = useState(false);
  const [deckId, setDeckId] = useState<entities.UserDeck['id'] | null>(null);

  const simulator = useSimulator();
  const { userDecks, createUserDeck, updateUserDeck } = useUserDeck();

  const disabled = simulator.deckCards.length === 0;

  const handleCopyDeck = () => {
    if (disabled) {
      return;
    }
    const userDeck = userDecks.find((deck) => deckId === deck.id);
    const params = {
      title: userDeck?.title ?? defaultTitle,
      cards: simulator.deckCards,
      accessories: userDeck?.accessories ?? [],
      updatedAt: Date.now(),
    };
    userDeck ? updateUserDeck({ ...params, id: userDeck.id }) : createUserDeck({ userDeck: params, copy: true });
    setDeckId(null);
    setOpen(false);
  };

  return (
    <>
      <Modal open={open} onClose={() => setOpen(false)} header="上書きする編成を選択">
        <ModalContent>
          <Grid columns="1fr" gap="1rem">
            <NewDeckListCard text="新しい編成を作成" onClick={() => setDeckId(null)} selected={deckId === null} />
            {userDecks.map((deck) => (
              <DeckListCardWrapper key={deck.id} onClick={() => setDeckId(deck.id)} selected={deckId === deck.id}>
                <DefaultDeckListCard brief userDeck={deck} />
              </DeckListCardWrapper>
            ))}
          </Grid>
        </ModalContent>

        <ModalActions>
          <Button onClick={handleCopyDeck} disabled={disabled}>
            保存
          </Button>
        </ModalActions>
      </Modal>

      <Button mode="secondary" onClick={() => setOpen(true)} disabled={disabled}>
        <FaCopy />
        この結果を編成に保存
      </Button>
    </>
  );
}
interface CardProps {
  selected: boolean;
}

const NewDeckListCard = styled(NewCard)<CardProps>`
  min-height: 100px;
  cursor: ${({ selected }) => (selected ? 'default' : 'pointer')};
  background: ${({ selected }) => (selected ? getColor(uiColorMap.magenta, 100, 0.1) : 'inherit')};
  border: 1px dashed ${({ selected }) => (selected ? getColor(uiColorMap.magenta, 100, 0.6) : 'inherit')};
  color: ${({ selected }) => (selected ? getColor(uiColorMap.magenta) : 'inherit')};

  &:hover {
    background: ${getColor(uiColorMap.magenta, 100, 0.1)};
  }
`;

const DeckListCardWrapper = styled.div<CardProps>`
  & > div {
    cursor: ${({ selected }) => (selected ? 'default' : 'pointer')};
    background: ${({ selected }) => getColor(selected ? uiColorMap.magenta : uiColorMap.white, 100, 0.1)};
    box-shadow: ${({ selected }) =>
      selected
        ? `0.25rem 0.5rem 2rem 0 ${getColor(uiColorMap.black, 700, 0.6)}`
        : `0 0.1rem 0.75rem 0 ${getColor(uiColorMap.black, 700, 0.4)}`};
  }
`;
