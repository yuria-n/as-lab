import styled from 'styled-components';
import React, { memo } from 'react';
import { Table } from 'semantic-ui-react';
import { entities } from '@as-lab/core';

import { CardAttribute, CardImg, CardType } from '../../universal/cards';
import { Display, getCardTitle } from '../../../utils';

export const CardTableView = memo(Component);

interface Props {
  cards: entities.Card[];
  idolMap: Map<entities.Idol['id'], entities.Idol>;
  skillMap: entities.SkillMap<entities.Skill>;
  onClick: (event: React.SyntheticEvent<any>) => void;
}

function Component({ cards, idolMap, skillMap, onClick }: Props) {
  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell />
          <Table.HeaderCell>ID</Table.HeaderCell>
          <Table.HeaderCell>レア</Table.HeaderCell>
          <Table.HeaderCell>名前</Table.HeaderCell>
          <Table.HeaderCell>属性</Table.HeaderCell>
          <Table.HeaderCell>タイプ</Table.HeaderCell>
          <Table.HeaderCell>アピール</Table.HeaderCell>
          <Table.HeaderCell>スタミナ</Table.HeaderCell>
          <Table.HeaderCell>テクニック</Table.HeaderCell>
          <Table.HeaderCell>特技</Table.HeaderCell>
          <Table.HeaderCell>個性</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {cards.map((card) => (
          <Table.Row key={card.id}>
            <Table.Cell data-id={card.id} onClick={onClick}>
              <StyledImg id={card.id} />
            </Table.Cell>
            <Table.Cell>{card.id}</Table.Cell>
            <Table.Cell>{card.rarity}</Table.Cell>
            <Table.Cell>{getCardTitle(card, idolMap.get(card.idolId)!, Display.Both)}</Table.Cell>
            <Table.Cell>
              <CardAttribute attribute={card.attribute} />
            </Table.Cell>
            <Table.Cell>
              <CardType type={card.type} />
            </Table.Cell>
            <Table.Cell>{card.appeal}</Table.Cell>
            <Table.Cell>{card.stamina}</Table.Cell>
            <Table.Cell>{card.technique}</Table.Cell>
            <Table.Cell>{skillMap.get(card.skill.skillId)?.slug}</Table.Cell>
            <Table.Cell>{card.personalSkills.map((skill) => skillMap.get(skill.skillId)?.slug).join(',')}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}

const StyledImg = styled(CardImg)`
  width: 4rem;
  height: 4rem;
`;
