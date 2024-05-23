import React, { memo, useEffect, useState } from 'react';
import { Dropdown } from 'semantic-ui-react';
import { entities, utils } from '@as-lab/core';

import { Grid, GridItem } from '../Grid';
import { HandleType, createSortIterator, handleChange } from '../../../utils';
import { SearchInput, SearchInputItem } from '../SearchInput';
import { attributeTextMap, typeTextMap } from '../../../constants';
import { useCondition, useIdol, useSkill } from '../../../hooks';

export const CardSearchInput = memo(Component, utils.makeEqual(['onChange']));

interface Props {
  cards: entities.Card[];
  onChange: (cards: entities.Card[]) => any;
}

function Component({ cards: baseCards, onChange }: Props) {
  const [order, setOrder] = useState('desc');
  const [searchItems, setSearchItems] = useState<SearchInputItem<entities.Card>[]>([]);
  const [sortValue, setSortValue] = useState<keyof entities.Card>('id');

  const { idolMap, getIdols } = useIdol();
  const { conditions, getConditions } = useCondition();
  const { skillMap, getSkillMap, skillTargetTitleMap, getSkillTargetTitleMap } = useSkill();
  useEffect(() => {
    getIdols();
    getConditions();
    getSkillMap();
    getSkillTargetTitleMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (baseCards.length === 0 || idolMap.size === 0 || skillMap.size === 0 || conditions.length === 0) {
      return;
    }
    const conditionMap = utils.toMap(conditions, 'type');
    const items = baseCards
      .filter((card) => idolMap.has(card.idolId))
      .sort(createSortIterator(sortValue))
      .map((card) => {
        const idol = idolMap.get(card.idolId)!;
        const skillIds = [card.skill.skillId, ...card.personalSkills.map((skill) => skill.skillId)];
        return {
          item: card,
          searchTexts: [
            card.id,
            card.idolId,
            card.rarity,
            card.name,
            card.evolutionName,
            idol.name,
            idol.school,
            card.attribute,
            attributeTextMap[card.attribute],
            card.type,
            typeTextMap[card.type],
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
    setSearchItems(order === 'asc' ? items : items.reverse());
  }, [sortValue, order, baseCards, idolMap, skillMap]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Grid gap="1rem">
      <Grid columns="repeat(auto-fill, 14rem)" align="end" gap="1rem">
        <GridItem>
          <Dropdown
            selection
            value={sortValue}
            options={sortOptions}
            onChange={(_, data) => handleChange(HandleType.Generic, setSortValue)(data.value)}
          />
        </GridItem>
        <GridItem>
          <Dropdown
            selection
            value={order}
            options={orderOptions}
            onChange={(_, data) => handleChange(HandleType.Generic, setOrder)(data.value)}
          />
        </GridItem>
      </Grid>
      <SearchInput items={searchItems} onChange={onChange} />
    </Grid>
  );
}

interface SortOption {
  key: string;
  value: keyof entities.Card;
  text: string;
}

const sortOptions: SortOption[] = [
  {
    key: 'id',
    value: 'id',
    text: 'ID',
  },
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
];

const orderOptions = [
  {
    key: 'asc',
    value: 'asc',
    text: '昇順',
  },
  {
    key: 'desc',
    value: 'desc',
    text: '降順',
  },
];
