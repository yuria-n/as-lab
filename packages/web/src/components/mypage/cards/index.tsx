import styled from 'styled-components';
import React, { useCallback, useEffect, useState } from 'react';
import { Checkbox, Dropdown, Input, Label } from 'semantic-ui-react';
import { FaCopy, FaFileUpload } from 'react-icons/fa';
import { entities, utils } from '@as-lab/core';
import { mount, route } from 'navi';

import { Analytics, LogType } from '../../../clients';
import {
  Button,
  GooglePlayStoreBadge,
  Grid,
  GridItem,
  InfeedAd,
  ResponsiveAd,
  SearchInput,
  SearchInputItem,
} from '../../universal';
import { CardDeleteActions } from './CardDeleteActions';
import { CardInputDialog } from './CardInputDialog';
import { CardList } from './CardList';
import { HandleType, createSortIterator, handleChange } from '../../../utils';
import { MypageContainer } from '../MypageContainer';
import { Path, attributeTextMap, typeTextMap } from '../../../constants';
import { PresetDropdown } from './PresetDropdown';
import { SyncDialog } from './SyncDialog';
import { useAuth, useCard, useCondition, useIdol, useInspirationSkill, useSkill, useUserCard } from '../../../hooks';

export * from './PresetDropdown';

export default mount({
  '/': route({
    view: <Cards />,
  }),
});

type UserCard = entities.UserCard;

enum DialogType {
  CardInput,
  Sync,
}

function Cards() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(DialogType.CardInput);
  const [cardId, setCardId] = useState('');
  const [asc, setAsc] = useState(false);
  const [sortValue, setSortValue] = useState<keyof UserCard>('appeal');
  const [filteredUserCards, setFilteredUserCards] = useState<UserCard[]>([]);
  const [searchItems, setSearchItems] = useState<SearchInputItem<UserCard>[]>([]);
  const [presetName, setPresetName] = useState('');
  const [edit, setEdit] = useState(false);
  const [selectedUserCardIdSet, setSelectedUserCardIdSet] = useState<Set<UserCard['id']>>(new Set());

  const { loggedIn } = useAuth();
  const { cardMap, getCards } = useCard();
  const { idols, getIdols } = useIdol();
  const { conditions, getConditions } = useCondition();
  const { inspirationSkills, getInspirationSkills } = useInspirationSkill();
  const { skillMap, getSkillMap, skillTargetTitleMap, getSkillTargetTitleMap } = useSkill();
  const { userCards, userCardMap, presetUserCards, copyCards } = useUserCard();

  useEffect(() => {
    Analytics.logEvent(LogType.VisitCard);
    getCards();
    getIdols();
    getSkillMap();
    getConditions();
    getInspirationSkills();
    getSkillTargetTitleMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Filter to prevent crash while loading cards
  useEffect(() => {
    if (
      cardMap.size === 0 ||
      idols.length === 0 ||
      inspirationSkills.length === 0 ||
      presetUserCards.length === 0 ||
      conditions.length === 0
    ) {
      return;
    }
    const idolMap = utils.toMap(idols, 'id');
    const conditionMap = utils.toMap(conditions, 'type');
    const inspirationSkillMap = utils.toMap(inspirationSkills, 'id');
    const targetCards = presetName
      ? presetUserCards.find((preset) => preset.name === presetName)?.userCards ?? []
      : userCards;
    const items = targetCards.sort(createSortIterator(sortValue, asc)).map((userCard) => {
      const card = cardMap.get(userCard.id)!;
      const idol = idolMap.get(card.idolId)!;
      const skillIds = [
        card.skill.skillId,
        ...card.personalSkills.map((skill) => skill.skillId),
        ...userCard.inspirationSkillIds.map((id) => inspirationSkillMap.get(id)?.skillId),
      ];
      return {
        item: { ...card, ...userCard },
        searchTexts: [
          card.id,
          card.evolutionName,
          card.attribute,
          attributeTextMap[card.attribute],
          card.type,
          typeTextMap[card.type],
          card.rarity,
          idol.id,
          idol.name,
          idol.school,
          ...skillIds.flatMap((skillId) => {
            const skill = skillMap.get(skillId ?? '');
            if (!skillId || !skill) {
              return [];
            }
            const condition = conditionMap.get(skill.condition)!;
            return [
              skillId,
              skill.title,
              skill.slug,
              skill.description,
              skill.target,
              skillTargetTitleMap[skill.target] ?? '',
              condition.type,
              condition.title,
              condition.description,
            ];
          }),
        ],
      };
    });
    setSearchItems(items);
  }, [
    asc,
    sortValue,
    presetName,
    presetUserCards,
    userCards,
    cardMap,
    idols,
    conditions,
    skillMap,
    inspirationSkills,
    skillTargetTitleMap,
  ]);

  const onCopyClick = useCallback(() => {
    if (!presetName) {
      return;
    }
    copyCards(presetName);
  }, [copyCards, presetName]);

  const onClose = useCallback(() => {
    setCardId('');
    setOpen(false);
  }, [setCardId, setOpen]);

  const onSyncDialogOpen = useCallback(() => {
    setType(DialogType.Sync);
    setOpen(true);
  }, [setType, setOpen]);
  const onCardDialogOpen = useCallback(() => {
    setType(DialogType.CardInput);
    setOpen(true);
  }, [setType, setOpen]);
  const onCardListClick = useCallback(
    (value) => {
      if (presetName) {
        return;
      }
      if (!edit) {
        handleChange(HandleType.String, setCardId)(value);
        onCardDialogOpen();
        return;
      }

      setSelectedUserCardIdSet((idSet) => {
        const selectedUserCardIdSet = new Set(idSet);
        if (selectedUserCardIdSet.has(value)) {
          selectedUserCardIdSet.delete(value);
        } else {
          selectedUserCardIdSet.add(value);
        }
        return selectedUserCardIdSet;
      });
    },
    [presetName, setCardId, onCardDialogOpen, edit, setSelectedUserCardIdSet],
  );

  const description =
    'シミュレーター用のスクールアイドル情報の管理を行います。スクスタLabのモバイルアプリを使用すると、スクリーンショットから読み込むことができます。';

  return (
    <MypageContainer active={Path.Card} description={description}>
      <InfeedAd className="mypage-card-top" slot="3894548797" />

      {open &&
        (type === DialogType.CardInput ? (
          <CardInputDialog open={open} cardId={cardId} onClick={onClose} />
        ) : (
          <SyncDialog cardMap={cardMap} userCardMap={userCardMap} open={open} onClose={onClose} />
        ))}

      <Grid gap="1rem">
        <GridItem>
          {loggedIn ? (
            <Button onClick={onSyncDialogOpen} disabled={!loggedIn}>
              <FaFileUpload />
              画像データを同期
            </Button>
          ) : (
            <GooglePlayStoreBadge />
          )}
        </GridItem>
        <GridItem>
          <SearchInput limit={51} items={searchItems} onChange={setFilteredUserCards} />
        </GridItem>
        <GridItem>
          <StyledInput labelPosition="left" type="text">
            <Label>ならび替え</Label>
            <Dropdown
              selection
              value={sortValue}
              options={sortOptions}
              onChange={(_, data) => handleChange(HandleType.Generic, setSortValue)(data.value)}
            />
          </StyledInput>
          <StyledCheckbox label="降順" checked={!asc} onClick={() => setAsc((bool) => !bool)} />
        </GridItem>
        <Grid columns="1fr auto" align="end" gap="1rem">
          <Grid columns="repeat(2, auto)" align="end" justifyContent="start" gap="0.5rem">
            <PresetDropdown disabled={edit} presetName={presetName} onChange={setPresetName} />
            {presetName && userCards.length === 0 && (
              <Button onClick={onCopyClick}>
                <FaCopy />
                このカードセットをコピー
              </Button>
            )}
          </Grid>
          {!presetName && userCards.length > 0 && (
            <CardDeleteActions
              edit={edit}
              onEditChange={setEdit}
              cardIdSet={selectedUserCardIdSet}
              onCardIdChange={setSelectedUserCardIdSet}
              userCards={filteredUserCards}
            />
          )}
        </Grid>
        <CardList
          userCards={filteredUserCards}
          selectedUserCardIdSet={selectedUserCardIdSet}
          onClick={onCardListClick}
          onNewClick={onCardDialogOpen}
          disabledNew={!!presetName}
        />
      </Grid>

      <ResponsiveAd className="mypage-card-bottom" slot="4750310409" />
    </MypageContainer>
  );
}

const StyledInput = styled(Input)`
  margin: 0 1rem 0 0;
`;

const StyledCheckbox = styled(Checkbox)`
  margin: 0 1rem 0 0;
`;

interface SortOption {
  key: string;
  value: keyof entities.UserCard;
  text: string;
}

const sortOptions: SortOption[] = [
  {
    key: 'appeal',
    value: 'appeal',
    text: 'アピール',
  },
  {
    key: 'stamina',
    value: 'stamina',
    text: 'スタミナ',
  },
  {
    key: 'technique',
    value: 'technique',
    text: 'テクニック',
  },
  {
    key: 'id',
    value: 'id',
    text: 'ID',
  },
  {
    key: 'updatedAt',
    value: 'updatedAt',
    text: '更新順',
  },
];
