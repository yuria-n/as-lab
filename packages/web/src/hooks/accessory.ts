import { useState } from 'react';

import { entities } from '@as-lab/core';

import { useAsync } from './async';
import { AccessoryService } from '../services';

export function useAccessory() {
  const [masterAccessories, setMasterAccessories] = useState<entities.MasterAccessory[]>([]);
  const [accessory, setAccessory] = useState<entities.Accessory | null>(null);
  const [accessoryMap, setAccessoryMap] = useState<entities.AccessoryMap>(new Map());
  const { runAsync } = useAsync();

  return {
    masterAccessories,
    getMasterAccessories,
    accessory,
    getAccessory,
    accessoryMap,
    getAccessoryMap,
  };

  function getMasterAccessories() {
    runAsync(async () => {
      const accessories = await AccessoryService.getMasterAccessories();
      setMasterAccessories(accessories);
    });
  }

  function getAccessory(
    type: entities.Accessory['type'],
    attribute: entities.Card.Attribute,
    rarity: entities.Card.Rarity,
  ) {
    runAsync(async () => {
      const accessory = await AccessoryService.get(type, attribute, rarity);
      setAccessory(accessory);
    });
  }

  function getAccessoryMap() {
    runAsync(async () => {
      const map = await AccessoryService.getMap();
      setAccessoryMap(map);
    });
  }
}
