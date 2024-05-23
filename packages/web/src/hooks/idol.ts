import { useEffect, useState } from 'react';

import { entities } from '@as-lab/core';

import { IdolService } from '../services';
import { useAsync } from './async';

export function useIdol() {
  const [idolMap, setIdolMap] = useState(new Map<entities.Idol['id'], entities.Idol>());
  const [idols, setIdols] = useState<entities.Idol[]>([]);
  const { runAsync } = useAsync();

  useEffect(() => {
    setIdolMap(new Map(idols.map((idol) => [idol.id, idol])));
  }, [idols]);

  return { idols, idolMap, getIdols };

  function getIdols() {
    if (idols.length !== 0) {
      return;
    }
    runAsync(async () => {
      const idols = await IdolService.getIdols();
      setIdols(idols);
    });
  }
}
