import styled from 'styled-components';
import React, { memo, useMemo } from 'react';
import { entities, utils } from '@as-lab/core';

import { AccessoryCard, Flex, Grid } from '../../../universal';
import { PlaceholderCard } from '../../../universal/cards/PlaceholderCard';
import { cardNum } from '../../../../constants';
import { useCallbacks, useUserAccessory } from '../../../../hooks';

type DeckAccessory = entities.Deck.Accessory | null;

interface Props {
  accessories: DeckAccessory[];
  onClick: (index: number) => void;
}

export const DeckAccessories = memo(Component);

function Component({ accessories, onClick }: Props) {
  const { userAccessories } = useUserAccessory();

  const userAccessoryMap = useMemo(() => utils.toMap(userAccessories, 'id'), [userAccessories]);
  const filledAccessories = useMemo(() => Array.from({ length: cardNum }, (_, index) => accessories[index] ?? null), [
    accessories,
  ]);
  const onClicks = useCallbacks(filledAccessories, (_, index) => () => onClick(index), [filledAccessories, onClick]);

  return (
    <Flex direction="column">
      <StyledMissionContainer columns="repeat(3, 1fr)" gap="1rem">
        {filledAccessories.map((accessory, index) => {
          const props = accessory ? userAccessoryMap.get(accessory.id) : null;
          return !accessory || !props ? (
            <PlaceholderCard key={index} onClick={onClicks[index]} />
          ) : (
            <AccessoryCard key={accessory.id} {...accessory} {...props} onClick={onClicks[index]} />
          );
        })}
      </StyledMissionContainer>
    </Flex>
  );
}

const StyledMissionContainer = styled(Grid)`
  width: 100%;
  margin: 0 0 1rem;
  border-radius: 1rem;
`;
