import { useState } from 'react';
import { entities } from '@as-lab/core';

import { AcConditionService } from '../services';
import { useAsync } from './async';

export function useAcCondition() {
  const [acConditions, setAcConditions] = useState<entities.AcCondition[]>([]);
  const { runAsync } = useAsync();

  return { acConditions, getAcConditions };

  function getAcConditions() {
    runAsync(async () => {
      const conditions = await AcConditionService.getAcConditions();
      setAcConditions(conditions);
    });
  }
}
