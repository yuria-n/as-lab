import styled from 'styled-components';
import React, { memo, useEffect, useState } from 'react';
import { Input } from 'semantic-ui-react';
import { Link, useNavigation } from 'react-navi';
import { entities, utils } from '@as-lab/core';

import { DeckAccessories } from './DeckAccessories';
import { DeckAccessoryDialog } from './DeckAccessoryDialog';
import { DeckCardDialog, DeckCards, DeleteButton, Flex, Grid, RegisterButton, ResponsiveAd } from '../../../universal';
import { HandleType, getColor, handleChange } from '../../../../utils';
import { Path, teamNum, uiColorMap } from '../../../../constants';
import { cardNum } from '../../../../constants';
import { config } from '../../../../config';
import { useUserCard, useUserDeck } from '../../../../hooks';

enum DialogType {
  Card = 'card',
  Accessory = 'accessory',
  None = '',
}

const deckPath = `${Path.Mypage}${Path.Deck}`;

export const DeckDetail = memo(Component);

interface Props {
  id?: string;
}

type DeckCard = entities.Deck.Card | null;
type DeckAccessory = entities.Deck.Accessory | null;

function Component({ id }: Props) {
  const [deckCards, setDeckCards] = useState<DeckCard[]>(new Array(teamNum * 3).fill(null));
  const [deckAccessories, setDeckAccessories] = useState<DeckAccessory[]>(new Array(teamNum * 3).fill(null));
  const [dialogType, setDialogType] = useState(DialogType.None);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [title, setTitle] = useState('');

  const selectedCard = deckCards[selectedIndex];
  const selectedAccessory = deckAccessories[selectedIndex];
  const disabled = !deckCards.every((deckCard) => !!deckCard);

  const { navigate } = useNavigation();
  const { userCards } = useUserCard();
  const { userDecks, createUserDeck, updateUserDeck, deleteUserDeck } = useUserDeck();

  useEffect(() => {
    if (!id || userDecks.length === 0) {
      return;
    }
    const userDeck = userDecks.find((userDeck) => userDeck.id === id);
    if (!userDeck) {
      return;
    }
    setDeckCards(userDeck.cards);
    setDeckAccessories(userDeck.accessories);
    setTitle(userDeck.title.length > 0 ? userDeck.title : userDeck.id);
  }, [id, userDecks]);

  const openCardDialog = (index: number) => {
    setDialogType(DialogType.Card);
    setSelectedIndex(index);
  };
  const handleDeckCardChange = (deckCard: DeckCard) => {
    setDialogType(DialogType.None);
    setDeckCards((cards) => [...cards.slice(0, selectedIndex), deckCard, ...cards.slice(selectedIndex + 1)]);
  };
  const openAccessoryDialog = (index: number) => {
    setDialogType(DialogType.Accessory);
    setSelectedIndex(index);
  };
  const handleDeckAccessoryChange = (deckAccessory: DeckAccessory) => {
    setDialogType(DialogType.None);
    setDeckAccessories((accessories) =>
      Array.from({ length: cardNum }, (_, index) =>
        index === selectedIndex ? deckAccessory : accessories[index] ?? null,
      ),
    );
  };
  const handleDeckAccessoryDelete = () => {
    setDialogType(DialogType.None);
    setDeckAccessories((accessories) => accessories.filter((prev, index) => (index === selectedIndex ? null : prev)));
  };
  const handleSave = () => {
    if (disabled) {
      return;
    }
    const params = {
      title,
      cards: utils.compact(deckCards),
      accessories: utils.compact(deckAccessories),
      updatedAt: Date.now(),
    };
    id ? updateUserDeck({ id, ...params }) : createUserDeck({ userDeck: params });
  };
  const handleDelete = () => {
    if (!id) {
      return;
    }
    deleteUserDeck(id);
    navigate(deckPath);
  };

  return (
    <>
      <Flex padding="1rem 0" justify="space-between" align="center">
        <StyledHeader>
          <Link className="parent" href={deckPath}>
            ライブ編成一覧
          </Link>
          <span className="arrow">&gt;</span>
          <span className="current">{id ? '編集' : '作成'}</span>
        </StyledHeader>
        <Grid columns="repeat(2, auto)" gap="0.5rem">
          <RegisterButton disabled={disabled} onClick={handleSave}>
            {id ? '更新' : '作成'}
          </RegisterButton>
          {id && <DeleteButton onClick={handleDelete} />}
        </Grid>
      </Flex>

      <h3>編成名</h3>
      {config.feature && <p>{id}</p>}
      <Input
        fluid
        placeholder="編成名"
        value={title}
        onChange={handleChange(HandleType.String, setTitle, { trim: false })}
      />

      <h3>カード</h3>
      <Flex padding="1rem 0" align="stretch">
        <DeckCards userCards={userCards} deckCards={deckCards} onClick={openCardDialog} />
        <DeckCardDialog
          cardId={selectedCard?.cardId ?? ''}
          team={selectedCard?.team ?? ''}
          open={dialogType === DialogType.Card}
          deckCards={deckCards}
          onChange={handleDeckCardChange}
          onClose={() => setDialogType(DialogType.None)}
        />
      </Flex>

      <h3>アクセサリー</h3>
      <DeckAccessories accessories={deckAccessories} onClick={openAccessoryDialog} />
      <DeckAccessoryDialog
        selectedAccessory={selectedAccessory}
        open={dialogType === DialogType.Accessory}
        deckAccessories={deckAccessories}
        onChange={handleDeckAccessoryChange}
        onDelete={handleDeckAccessoryDelete}
        onClose={() => setDialogType(DialogType.None)}
      />

      <ResponsiveAd className="mypage-deck-detail-bottom" slot="6330668154" />
    </>
  );
}

const StyledHeader = styled.h2`
  color: ${getColor(uiColorMap.black, 300)};
  font-weight: normal;
  transition: 0.3s;

  & > .parent {
    color: ${getColor(uiColorMap.black, 300)};
    &:hover {
      color: ${getColor(uiColorMap.magenta)};
    }
  }

  & > .arrow {
    padding: 0 0.5rem;
    color: ${getColor(uiColorMap.black, 100, 0.3)};
  }

  & > .current {
    color: ${getColor(uiColorMap.black)};
    font-weight: bold;
  }
`;
