import { useState } from 'react';

import { entities, libs } from '@as-lab/core';

import { useAsync } from './async';
import { MusicSimulatorService } from '../services';
import { MusicSimulatorOptionsMap, SimulationResult, MusicSimulatorOptions } from '../repositories';

interface SimulationInfo {
  totalCount: Value;
  totalLatency: Value;
}

export function useMusicSimulator() {
  const [info, setInfo] = useState<SimulationInfo | null>(null);
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [optionsMap, setOptionsMap] = useState<MusicSimulatorOptionsMap>({});
  const { runAsync } = useAsync();

  return {
    info,
    results,
    simulate,
    optionsMap,
    getOptionsMap,
    setOptions,
  };

  function simulate(
    userDeck: entities.UserDeck,
    liveStage: entities.Music.LiveStage,
    count: Value,
    options: libs.MusicSimulator.Options,
  ) {
    runAsync(async () => {
      const start = Date.now();
      const results = await MusicSimulatorService.simulate(userDeck, liveStage, count, options);
      const latency = Date.now() - start;
      setResults(results);
      setInfo((info) => ({
        totalCount: (info?.totalCount ?? 0) + count,
        totalLatency: (info?.totalLatency ?? 0) + latency,
      }));
    });
  }

  function getOptionsMap() {
    runAsync(async () => {
      const optionsMap = await MusicSimulatorService.getOptionsMap();
      setOptionsMap(optionsMap);
    });
  }

  function setOptions(musicId: entities.Music.LiveStage['id'], options: MusicSimulatorOptions) {
    runAsync(async () => {
      const optionsMap = await MusicSimulatorService.setOptions(musicId, options);
      setOptionsMap(optionsMap);
    });
  }
}
