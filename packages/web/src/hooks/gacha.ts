import { useState } from 'react';
import { entities, libs } from '@as-lab/core';

import { useAsync } from './async';
import { GachaService } from '../services';
import { SharedKey, useSharedState } from './sharedState';

export function useGacha() {
  const [gachas, setGachas] = useState<entities.Gacha[]>([]);
  const [gachaDetails, setGachaDetails] = useState<entities.GachaDetail[]>([]);
  const [cardInfoList, setCardInfoList] = useState<libs.GachaSimulator.CardInfo[]>([]);
  const [statsMap, setStatsMap] = useState(new Map<entities.Gacha['id'], libs.GachaSimulator.Stats>());
  const [historiesMap, setHistoriesMap] = useSharedState(
    SharedKey.GachaHistory,
    new Map<entities.Gacha['id'], libs.GachaSimulator.Stats[]>(),
  );
  const { runAsync } = useAsync();

  return {
    gachas,
    getGachas,
    gachaDetails,
    getGachaDetails,
    cardInfoList,
    drawGacha,
    statsMap,
    getStats,
    historiesMap,
    getHistories,
  };

  function getGachas() {
    runAsync(async () => {
      const gachas = await GachaService.getGachas();
      setGachas(gachas);
    });
  }

  function getGachaDetails() {
    runAsync(async () => {
      const details = await GachaService.getGachaDetails();
      setGachaDetails(details);
    });
  }

  function getStats(gacha: entities.Gacha) {
    runAsync(async () => {
      const stats = await GachaService.getStats(gacha);
      setStatsMap((map) => new Map([...map, [gacha.id, stats]]));
    });
  }

  function getHistories(gacha: entities.Gacha) {
    runAsync(async () => {
      const list = await GachaService.getHistories(gacha);
      setHistoriesMap((map) => new Map([...map, [gacha.id, list]]));
    });
  }

  function drawGacha(gacha: entities.Gacha, costIndex: number) {
    runAsync(async () => {
      const list = await GachaService.draw(gacha, costIndex);
      setCardInfoList(list);
    });
  }
}
