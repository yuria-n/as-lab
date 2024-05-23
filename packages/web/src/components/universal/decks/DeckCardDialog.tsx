import React, { memo, useCallback, useEffect, useState } from 'react';
import { DropdownItemProps } from 'semantic-ui-react';
import { entities, libs, utils } from '@as-lab/core';

import {
  DeleteButton,
  Flex,
  Grid,
  ImageDropdown,
  InputLabel,
  Modal,
  ModalActions,
  ModalContent,
  RegisterButton,
  TeamColorDropdown,
} from '../';
import { HandleType, getCardImageUrl, handleChange } from '../../../utils';
import { teamNum } from '../../../constants';
import { useCard, useIdol, useUserCard, useUserHistory } from '../../../hooks';

type DeckCard = entities.Deck.Card | null;

interface Props {
  open: boolean;
  cardId?: string;
  team?: entities.Deck.Team | '';
  deckCards: DeckCard[];
  onChange: (deckCard: DeckCard) => void;
  onClose: () => void;
}

export const DeckCardDialog = memo(Component, utils.makeEqual(['onChange', 'onClose']));

function Component({ open, cardId: prevCardId, team: prevTeam, deckCards: presetCards, onChange, onClose }: Props) {
  const [cardOptions, setCardOptions] = useState<DropdownItemProps[]>([]);
  const [cardId, setCardId] = useState<entities.Card['id']>('');
  const [team, setTeam] = useState<entities.Deck.Team | ''>('');
  const [availableTeamSet, setAvailableTeamSet] = useState(new Set<entities.Deck.Team>());
  const [deckCards, setDeckCards] = useState<libs.DeckSimulator.DeckCard[]>([]);

  const { cardMap, getCards } = useCard();
  const { idolMap, getIdols } = useIdol();
  const { userCards } = useUserCard();
  const { userHistory, setSelectedCardId } = useUserHistory();

  const selectCardId = useCallback(
    (id: entities.Card['id']) => {
      setCardId(id);
      setSelectedCardId(id);
    },
    [setCardId, setSelectedCardId],
  );

  useEffect(() => {
    getIdols();
    getCards();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setDeckCards(presetCards.filter((deckCard) => deckCard?.cardId !== prevCardId));
    setCardId(prevCardId ?? '');
  }, [prevCardId, presetCards]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setTeam(prevTeam ?? '');
  }, [prevTeam]);

  useEffect(() => {
    const deckCardSet = new Set(deckCards.map((deckCard) => deckCard?.cardId));
    const selectedCardPriorityMap = new Map(userHistory.selectedCards.map((card, index) => [card.id, index]));
    const getPriority = (id: entities.Card['id']) => selectedCardPriorityMap.get(id) ?? Infinity;
    const options = userCards
      .filter((userCard) => !deckCardSet.has(userCard.id))
      .filter((userCard) => cardMap.has(userCard.id))
      .map((userCard) => cardMap.get(userCard.id)!)
      .filter((card) => idolMap.has(card.idolId))
      .map((card) => ({
        key: card.id,
        value: card.id,
        text: `[${card.evolutionName}] ${idolMap.get(card.idolId)!.name}`,
        image: { src: getCardImageUrl(card.id) },
      }))
      .sort((c1, c2) => getPriority(c1.key) - getPriority(c2.key));
    setCardOptions(options);
  }, [userCards, deckCards, cardMap, idolMap, userHistory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const deckCardMap = utils.groupBy(deckCards, (deckCard) => deckCard?.team);
    const availableTeams = Object.values(entities.Deck.Team).filter(
      (team) => (deckCardMap.get(team)?.length ?? 0) < teamNum,
    );
    setAvailableTeamSet(new Set(availableTeams));
  }, [deckCards]);

  const handleRegister = () => {
    if (!cardId) {
      return;
    }
    if (!team) {
      return;
    }
    onChange({ team, cardId });
  };
  const handleDelete = () => onChange(null);

  return (
    <Modal open={open} onClose={onClose} header="指定するカードを選択">
      <ModalContent>
        <Flex padding="0 0 2rem 0" direction="column" align="flex-start">
          <InputLabel>カード名</InputLabel>
          <ImageDropdown
            name="title"
            placeholder="カード名 (例: [はいからロマンス] 高坂 穂乃果)"
            openOnFocus
            autoFocus
            fluid
            search
            value={cardId}
            options={cardOptions}
            onChange={(_, data) => handleChange(HandleType.String, selectCardId)(data.value)}
          />
        </Flex>
        <Flex padding="0 0 2rem 0" direction="column" align="flex-start">
          <InputLabel>作戦カラー</InputLabel>
          <TeamColorDropdown team={team} availableTeamSet={availableTeamSet} onChange={setTeam} />
        </Flex>
      </ModalContent>

      <ModalActions>
        <Grid columns="repeat(3, auto)" gap="0.5rem" justifyContent="start">
          <RegisterButton disabled={!cardId || !team} onClick={handleRegister}>
            選択
          </RegisterButton>
          <DeleteButton onClick={handleDelete} />
        </Grid>
      </ModalActions>
    </Modal>
  );
}
