import { useEffect, useState } from 'react';

import { entities } from '@as-lab/core';

import { useSkill } from './skill';

export function useSkillInput() {
  const { skill, getSkill } = useSkill();
  const [effect, setEffect] = useState<entities.SkillEffect | ''>('');
  const [condition, setCondition] = useState<entities.Condition.Type | ''>('');
  const [target, setTarget] = useState<entities.SkillTarget | ''>('');

  useEffect(() => {
    if (!effect || !condition || !target) {
      return;
    }
    getSkill(effect, condition, target);
  }, [effect, condition, target]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    skill,
    effect,
    setEffect,
    condition,
    setCondition,
    target,
    setTarget,
  };
}
