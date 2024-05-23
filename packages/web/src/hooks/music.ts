import { useState } from 'react';

import { entities } from '@as-lab/core';

import { MusicService } from '../services';
import { useAsync } from './async';

export function useMusic() {
  const [musics, setMusics] = useState<entities.Music.Info[]>([]);
  const [liveStageMap, setLiveStageMap] = useState<Map<entities.Music.LiveStage['id'], entities.Music.LiveStage>>(
    new Map(),
  );
  const { runAsync } = useAsync();

  return {
    musics,
    getMusics,
    liveStageMap,
    getLiveStage,
  };

  function getMusics() {
    runAsync(async () => {
      const musics = await MusicService.getMusics();
      setMusics(musics);
    });
  }

  function getLiveStage(id: entities.Music.LiveStage['id']) {
    if (liveStageMap.has(id)) {
      return;
    }
    runAsync(async () => {
      const liveStage = await MusicService.getLiveStage(id);
      setLiveStageMap((map) => new Map([...map, [id, liveStage]]));
    });
  }
}
