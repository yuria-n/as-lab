import { useState } from 'react';
import { entities, utils } from '@as-lab/core';

import { ConditionService } from '../services';
import { useAsync } from './async';

export function useCondition() {
  const [conditions, setConditions] = useState<entities.Condition[]>([]);
  const [conditionMap, setConditionMap] = useState<entities.ConditionMap>(new Map());
  const { runAsync } = useAsync();

  return { conditions, conditionMap, getConditions };

  function getConditions() {
    runAsync(async () => {
      const conditions = await ConditionService.getConditions();
      setConditions(conditions);
      setConditionMap(utils.toMap(conditions, 'type'));
    });
  }
}
