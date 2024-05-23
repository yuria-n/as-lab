import React, { memo, useEffect, useMemo } from 'react';
import { entities } from '@as-lab/core';

import { CardContainer, Loader } from '..';
import { getAccessoryImageUrl, getAccessoryTitle } from '../../../utils';
import { useAccessory } from '../../../hooks';

interface Props extends entities.UserAccessory {
  onClick: (id: Id) => void;
  team?: entities.Deck.Team;
}

export const AccessoryCard = memo(Component);

function Component({ id, accessoryId, appeal, stamina, technique, skillFields, onClick, team }: Props) {
  const { masterAccessories, getMasterAccessories, accessoryMap, getAccessoryMap } = useAccessory();

  useEffect(() => {
    getMasterAccessories();
    getAccessoryMap();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const accessory = useMemo(() => accessoryMap.get(accessoryId), [accessoryMap, accessoryId]);
  const masterAccessory = useMemo(() => masterAccessories.find((item) => item.type === accessory?.type), [
    masterAccessories,
    accessory,
  ]);
  const imgSrc = useMemo(() => (accessory ? getAccessoryImageUrl(accessory.type, accessory.attribute) : ''), [
    accessory,
  ]);
  const title = useMemo(() => (accessory ? getAccessoryTitle({ ...accessory, skillFields }) : ''), [
    accessory,
    skillFields,
  ]);

  if (!accessory || !masterAccessory) {
    return <Loader />;
  }

  return (
    <CardContainer
      id={id}
      rarity={accessory.rarity}
      attribute={accessory.attribute}
      imgSrc={imgSrc}
      title={title}
      appeal={appeal}
      stamina={stamina}
      technique={technique}
      onClick={onClick}
      team={team}
    />
  );
}
