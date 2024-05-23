import { useState } from 'react';

import { entities } from '@as-lab/core';

import { useAsync } from './async';
import { KizunaService } from '../services';

export function useKizuna() {
  const [kizunaSkills, setKizunaSkills] = useState<entities.KizunaSkill[]>([]);
  const { runAsync } = useAsync();

  return {
    kizunaSkills,
    getKizunaSkills,
  };

  function getKizunaSkills() {
    runAsync(async () => {
      const skills = await KizunaService.getKizunaSkills();
      setKizunaSkills(skills);
    });
  }
}
