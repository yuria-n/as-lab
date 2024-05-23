import { useState } from 'react';
import { entities } from '@as-lab/core';

import { ReferenceService } from '../services';
import { useAsync } from './async';

export function useReference() {
  const [referenceList, setReferenceList] = useState<entities.Reference[]>([]);
  const { runAsync } = useAsync();

  return { referenceList, getReferenceList };

  function getReferenceList() {
    runAsync(async () => {
      const conditions = await ReferenceService.getReferenceList();
      setReferenceList(conditions);
    });
  }
}
