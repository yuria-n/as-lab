import styled from 'styled-components';
import React, { Dispatch, MouseEvent, SetStateAction, memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Checkbox,
  Dropdown,
  DropdownItemProps,
  Pagination,
  PaginationProps,
  Radio,
  Table,
  TableHeaderCell,
} from 'semantic-ui-react';
import { entities, libs, utils } from '@as-lab/core';

import { CardDialog, Flex, Tooltip } from '../../../universal';
import { DeckSupportSimulatorCardFilter } from './index';
import { HandleType, getCardImageUrl, handleChange, roundRate } from '../../../../utils';
import { SupportTableHeader } from '../../../../repositories';
import { useSupportSimulator } from '../../../../hooks';

interface Props {
  centerCardId: entities.UserCard['id'];
  onCenterCardIdChange: Dispatch<SetStateAction<entities.UserCard['id']>>;
  selectedCardIds: entities.UserCard['id'][];
  onCardIdChange: Dispatch<SetStateAction<entities.UserCard['id'][]>>;
  filter: DeckSupportSimulatorCardFilter;
}

export const DeckSupportSimulatorTable = memo(Component);

enum ValueType {
  Value,
  Rate,
}

function Component({ centerCardId, onCenterCardIdChange, selectedCardIds, onCardIdChange, filter }: Props) {
  const [sortColumn, setSortColumn] = useState<keyof libs.DeckSupportSimulator.SupportCard>('teamScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentHeaderEntities, setCurrentHeaderEntities] = useState(tableHeaderEntities);
  const [activePage, setActivePage] = useState(1);
  const [dialogCardId, setDialogCardId] = useState<entities.Card['id'] | null>(null);

  const { result, tableHeaders, setTableHeaders } = useSupportSimulator();

  useEffect(() => {
    setActivePage(1);
  }, [filter]);
  useEffect(() => {
    if (!tableHeaders) {
      return;
    }
    const headerSet = new Set(tableHeaders);
    setCurrentHeaderEntities((entities) =>
      entities.map(([key, header]) => [key, { ...header, show: headerSet.has(key) }]),
    );
  }, [tableHeaders]);

  const mapCards = useCallback(
    (cards: libs.DeckSupportSimulator.SupportCard[] = []) =>
      utils.sortBy(cards, (card) => Number(card[sortColumn]) * (sortAsc ? 1 : -1)),
    [sortColumn, sortAsc],
  );
  const sortedSelectedCards = useMemo(() => mapCards(result?.selectedCards), [result, mapCards]);
  const sortedOtherCards = useMemo(() => mapCards(result?.otherCards), [result, mapCards]);
  const filteredSortedOtherCards = useMemo(
    () =>
      sortedOtherCards.filter(
        (card) =>
          filter.attributeSet.has(card.card.attribute) &&
          filter.typeSet.has(card.card.type) &&
          filter.schoolSet.has(card.idol.school) &&
          filter.gradeSet.has(card.idol.grade),
      ),
    [sortedOtherCards, filter],
  );
  const slicedSortedOtherCards = useMemo(() => {
    const index = maxPageItem * (activePage - 1);
    return filteredSortedOtherCards.slice(index, index + maxPageItem);
  }, [filteredSortedOtherCards, activePage]);
  const onHeaderClickMap = useMemo(
    () =>
      new Map(
        tableHeaderEntities.map(([key]) => [
          key,
          () => {
            if (sortColumn === key) {
              setSortAsc((sortAsc) => !sortAsc);
            } else {
              setSortColumn(key);
            }
          },
        ]),
      ),
    [sortColumn, setSortColumn, setSortAsc],
  );
  const selectedTableHeaderEntities = useMemo(() => currentHeaderEntities.filter(([, header]) => header.show), [
    currentHeaderEntities,
  ]);
  const tableHeaderDropdownLabelMap = useMemo(
    () =>
      currentHeaderEntities.map(([, header]) => ({
        color: header.show ? 'green' : undefined,
        empty: true,
        circular: true,
      })),
    [currentHeaderEntities],
  );
  const tableHeaderDropdownOnClick = useCallback(
    (event: MouseEvent<HTMLDivElement>, data: DropdownItemProps) => {
      event.stopPropagation();
      const header = data.value as SupportTableHeader;
      const prevHeaders = tableHeaders ?? currentHeaderEntities.filter(([, header]) => header.show).map(([key]) => key);
      if (prevHeaders.includes(header)) {
        setTableHeaders(prevHeaders.filter((key) => key !== header));
      } else {
        setTableHeaders([...prevHeaders, header]);
      }
    },
    [tableHeaders, setTableHeaders, currentHeaderEntities],
  );
  const onSelectedCardIdClick = useCallback(
    (_, data) => onCardIdChange((ids) => ids.filter((id) => id !== data['data-value'])),
    [onCardIdChange],
  );
  const onCenterCardIdClick = useCallback(
    (_, data) => {
      const value = data['data-value'];
      onCenterCardIdChange(centerCardId && centerCardId === value ? '' : value);
    },
    [onCenterCardIdChange, centerCardId],
  );
  const onOtherCardIdClick = useCallback(
    (_, data) => {
      if (selectedCardIds.length >= maxCardId) {
        return;
      }
      onCardIdChange((ids) => [...ids, data['data-value']]);
    },
    [selectedCardIds, onCardIdChange],
  );
  const onTablePageChange = useCallback(
    (_, data: PaginationProps) => handleChange(HandleType.Number, setActivePage)(data.activePage),
    [setActivePage],
  );
  const tableTotalPages = useMemo(() => Math.ceil(filteredSortedOtherCards.length / maxPageItem), [
    filteredSortedOtherCards,
  ]);
  const onImgCellClick = useCallback(
    (event: React.SyntheticEvent<any>) => setDialogCardId(event.currentTarget?.dataset?.id ?? null),
    [setDialogCardId],
  );
  const dialogResultCard = useMemo(() => {
    if (!result) {
      return null;
    }
    return [...result?.selectedCards, ...result?.otherCards].find(({ card }) => card.id === dialogCardId);
  }, [result, dialogCardId]);

  return (
    <>
      <Flex justify="flex-end">
        <Dropdown
          text={`${selectedTableHeaderEntities.length}/${tableHeaderEntities.length}選択中`}
          icon="filter"
          floating
          labeled
          button
          className="icon"
          closeOnChange={false}
          direction="left"
          scrolling
          options={useMemo(
            () =>
              tableHeaderEntities.map(([key, { title }], index) => ({
                key,
                value: key,
                onClick: tableHeaderDropdownOnClick,
                children: (
                  <Dropdown.Item key={key} value={key} text={` ${title}`} label={tableHeaderDropdownLabelMap[index]} />
                ),
              })),
            [tableHeaderDropdownOnClick, tableHeaderDropdownLabelMap],
          )}
        />
      </Flex>

      <Table sortable celled fixed>
        <Table.Header>
          <Table.Row verticalAlign="top" textAlign="center">
            <TableHeaderCell key="checkbox-center">
              <HeaderCellText>
                センター <Tooltip content="選択したフレンドゲストの効果を付与するスクールアイドル" />
              </HeaderCellText>
            </TableHeaderCell>
            <TableHeaderCell key="checkbox-main">
              <HeaderCellText>
                選択するスクールアイドル <Tooltip content="最大3人まで選択可能" />
              </HeaderCellText>
            </TableHeaderCell>
            <Table.HeaderCell key="img" />
            {selectedTableHeaderEntities.map(([key, header]) => (
              <Table.HeaderCell
                key={key}
                sorted={sortColumn !== key ? undefined : sortAsc ? 'ascending' : 'descending'}
                onClick={onHeaderClickMap.get(key)}
              >
                <HeaderCellText>
                  {header.title} {header.description && <Tooltip content={header.description} />}
                </HeaderCellText>
              </Table.HeaderCell>
            ))}
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {sortedSelectedCards.map((card) => (
            <Table.Row key={card.id} positive>
              <Table.Cell textAlign="center">
                <Radio checked={card.id === centerCardId} data-value={card.id} onClick={onCenterCardIdClick} />
              </Table.Cell>
              <Table.Cell textAlign="center">
                <Checkbox checked data-value={card.id} onClick={onSelectedCardIdClick} />
              </Table.Cell>
              <Table.Cell data-id={card.id} onClick={onImgCellClick}>
                <img height={40} alt={card.id} src={getCardImageUrl(card.id)} />
              </Table.Cell>
              {selectedTableHeaderEntities.map(([key, { type }]) => (
                <Table.Cell key={key}>
                  {type === ValueType.Value ? Math.floor(Number(card[key])) : `${roundRate(Number(card[key]))}％`}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>

        <Table.Body>
          {slicedSortedOtherCards.map((card) => (
            <Table.Row key={card.id}>
              <Table.Cell />
              <Table.Cell textAlign="center">
                <Checkbox
                  checked={false}
                  data-value={card.id}
                  onClick={onOtherCardIdClick}
                  disabled={selectedCardIds.length >= maxCardId}
                />
              </Table.Cell>
              <Table.Cell data-id={card.id} onClick={onImgCellClick}>
                <img height={40} alt={card.id} src={getCardImageUrl(card.id)} />
              </Table.Cell>
              {selectedTableHeaderEntities.map(([key, { type }]) => (
                <Table.Cell key={key}>
                  {type === ValueType.Value ? Math.floor(Number(card[key])) : `${roundRate(Number(card[key]))}％`}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>

        <Table.Footer>
          <Table.Row>
            <Table.HeaderCell colSpan={selectedTableHeaderEntities.length + 3} textAlign="center">
              <Pagination activePage={activePage} onPageChange={onTablePageChange} totalPages={tableTotalPages} />
            </Table.HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>

      <CardDialog
        open={!!dialogCardId}
        card={dialogResultCard?.card ?? null}
        userCard={dialogResultCard?.userCard ?? null}
        onClose={useCallback(() => setDialogCardId(null), [setDialogCardId])}
      />
    </>
  );
}

const maxCardId = 3;
const maxPageItem = 10;

interface Header {
  title: Title;
  type: ValueType;
  show: boolean;
  description?: string;
}

const tableHeaderMap: Map<keyof libs.DeckSupportSimulator.SupportCard, Header> = new Map([
  ['id', { title: 'ID', type: ValueType.Value, show: false }],
  [
    'teamScore',
    { title: 'チームスコア', description: '１ノーツあたりの獲得ボルテージ値', type: ValueType.Value, show: true },
  ],
  [
    'supportScore',
    {
      title: 'サポートスコア',
      description: '１ノーツあたりの選択中カードの獲得ボルテージ増加値',
      type: ValueType.Value,
      show: true,
    },
  ],
  ['appeal', { title: 'アピール', description: '１ノーツあたりのアピール値', type: ValueType.Value, show: true }],
  [
    'technique',
    { title: 'テクニック', description: '１ノーツあたりのテクニック値', type: ValueType.Value, show: true },
  ],
  ['stamina', { title: 'スタミナ', description: 'スタミナ値', type: ValueType.Value, show: true }],
  [
    'voltage',
    {
      title: 'ボルテージ',
      description: '１タップあたりのボルテージ値（クリティカルを除く）',
      type: ValueType.Value,
      show: false,
    },
  ],
  [
    'voltageWithCritical',
    {
      title: 'ボルテージ＆クリティカル',
      description: '１タップあたりのボルテージ値（クリティカルを含む）',
      type: ValueType.Value,
      show: true,
    },
  ],
  [
    'criticalValue',
    { title: 'クリティカル値', description: 'クリティカル時のボルテージ値', type: ValueType.Value, show: false },
  ],
  [
    'criticalRate',
    { title: 'クリティカル率', description: '１タップあたりのクリティカル率', type: ValueType.Rate, show: true },
  ],
  [
    'spVoltage',
    { title: 'SPボルテージ', description: '１SP特技発動あたりのSPボルテージ値', type: ValueType.Value, show: true },
  ],
  [
    'voltageGain',
    {
      title: 'ボルテージ獲得',
      description: '１ノーツあたりのスキルによるボルテージ獲得値',
      type: ValueType.Value,
      show: false,
    },
  ],
  [
    'spVoltageGain',
    {
      title: 'SPボルテージ獲得',
      description: '１ノーツあたりのスキルによるSPボルテージ獲得値',
      type: ValueType.Value,
      show: false,
    },
  ],
  [
    'spGaugeGain',
    { title: 'SPゲージ獲得', description: '１ノーツあたりのSPゲージ獲得値', type: ValueType.Value, show: true },
  ],
  [
    'staminaRecovery',
    { title: 'スタミナ回復', description: '1ノーツあたりのスタミナ回復値', type: ValueType.Value, show: false },
  ],
  [
    'shieldGain',
    { title: 'シールド獲得', description: '1ノーツあたりのシールド獲得値', type: ValueType.Value, show: false },
  ],
  [
    'staminaAndShield',
    {
      title: 'スタミナ＆シールド',
      description: '１ノーツあたりのスタミナ回復量とシールド獲得量の合計値',
      type: ValueType.Value,
      show: true,
    },
  ],
  [
    'damageReduction',
    { title: 'ダメージ軽減', description: '１ノーツあたりのダメージ軽減値', type: ValueType.Value, show: false },
  ],
  [
    'skillInvocationRate',
    { title: '特技発動率', description: '１タップあたりの特技発動率増加率', type: ValueType.Rate, show: true },
  ],
]);
const tableHeaderEntities = Array.from(tableHeaderMap);

const HeaderCellText = styled.p`
  white-space: normal;
`;
