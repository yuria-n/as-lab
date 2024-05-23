import styled from 'styled-components';
import React, { memo, useEffect } from 'react';
import { entities } from '@as-lab/core';

import { Flex } from '../..';
import { deckColorMap, spColor, uiColorMap } from '../../../../constants';
import { getAccessoryImageUrl } from '../../../../utils/accessory';
import { getCardImageUrl, getColor } from '../../../../utils';
import { teamNum } from '../../../../constants/deck';
import { useAccessory, useUserAccessory } from '../../../../hooks';

interface Props {
  team: entities.Deck.Team;
  cards: entities.UserDeck['cards'];
  accessories: entities.UserDeck['accessories'] | null;
  spCardIdSet: Set<entities.Card['id']>;
}

export const TeamCard = memo(Component);

function Component({ team, cards, accessories, spCardIdSet }: Props) {
  const { accessoryMap, getAccessoryMap } = useAccessory();
  const { userAccessories } = useUserAccessory();

  useEffect(() => {
    getAccessoryMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const teamColorMap = deckColorMap[team];

  const userAccessoryIdMap = new Map(userAccessories.map((accessory) => [accessory.id, accessory.accessoryId]));
  const accessoryIds =
    accessories !== null ? Array.from({ length: teamNum }, (_, index) => accessories[index]?.id ?? '') : null;

  return (
    <StyledDiv color={getColor(teamColorMap)}>
      <TopHalf justify="center" roundedCorner={accessories === null}>
        {cards.map(({ cardId }) => (
          <CardImg key={cardId} src={getCardImageUrl(cardId)} sp={spCardIdSet.has(cardId)} />
        ))}
      </TopHalf>
      {accessoryIds && (
        <BottomHalf justify="center" color={getColor(teamColorMap, 100, 0.15)}>
          {accessoryIds.map((id, index) => {
            const accessoryId = userAccessoryIdMap.get(id) ?? '';
            const accessory = accessoryMap.get(accessoryId);
            const src = accessory ? getAccessoryImageUrl(accessory.type, accessory.attribute) : undefined;
            return <AccessoryImg key={`${id}-${index}`} src={src} />;
          })}
        </BottomHalf>
      )}
    </StyledDiv>
  );
}

const black900 = getColor(uiColorMap.black, 900);

interface StyledProps {
  color?: string;
  roundedCorner?: boolean;
}

const StyledDiv = styled.div<StyledProps>`
  position: relative;
  border-radius: 0.25rem;
  box-shadow: 0 0.1rem 0.5rem 0 ${getColor(uiColorMap.black, 700, 0.4)};
  transition: all 0.3s ease;

  &::before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0.5rem;
    border-radius: 0.25rem 0.25rem 0 0;
    background: ${({ color }) => color};
  }
`;

const TopHalf = styled(Flex)<StyledProps>`
  padding: 1rem;
  background: ${getColor(uiColorMap.white)};
  border-radius: ${({ roundedCorner }) => (roundedCorner ? '0 0 0.25rem 0.25rem' : '0')};
`;

const BottomHalf = styled(Flex)<StyledProps>`
  padding: 0.5rem 1rem;
  background: ${({ color }) => color ?? getColor(uiColorMap.white)};
  border-radius: 0 0 0.25rem 0.25rem;
`;

interface CardImgProps {
  sp: boolean;
}

const CardImg = styled.img<CardImgProps>`
  width: 4rem;
  height: 4rem;
  margin: 0.25rem;
  background: ${black900};
  border: 0.25rem solid ${({ sp }) => getColor(sp ? spColor : uiColorMap.white)};
  border-radius: 0.25rem;
`;

const AccessoryImg = styled.img`
  width: 3rem;
  height: 3rem;
  margin: 0.5rem;
  background: ${black900};
  border-radius: 0.25rem;
`;
