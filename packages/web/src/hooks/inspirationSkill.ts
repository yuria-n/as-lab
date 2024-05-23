import { InspirationSkill } from '@as-lab/core/entities';
import { useState } from 'react';

import { InspirationSkillService } from '../services';
import { useAsync } from './async';

export function useInspirationSkill() {
  const [inspirationSkills, setInspirationSkills] = useState<InspirationSkill[]>([]);
  const { runAsync } = useAsync();

  return { inspirationSkills, getInspirationSkills };

  function getInspirationSkills() {
    if (inspirationSkills.length) {
      return;
    }
    runAsync(async () => {
      const inspirationSkills = await InspirationSkillService.getInspirationSkills();
      setInspirationSkills(inspirationSkills);
    });
  }
}
