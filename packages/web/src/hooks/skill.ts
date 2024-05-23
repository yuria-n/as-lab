import { useEffect, useState } from 'react';
import { entities, utils } from '@as-lab/core';

import { SkillService } from '../services';
import { useAsync } from './async';

export type SkillTargetTitleMap = Partial<Record<entities.SkillTarget, string>>;

export function useSkill() {
  const [skill, setSkill] = useState<entities.Skill | null>(null);
  const [skillMap, setSkillMap] = useState<entities.SkillMap<entities.Skill>>(new Map());
  const [masterSkills, setMasterSkills] = useState<entities.MasterSkill[]>([]);
  const [masterSkillMap, setMasterSkillMap] = useState<Map<entities.MasterSkill['effect'], entities.MasterSkill>>(
    new Map(),
  );
  const [skillTargetTitleMap, setSkillTargetTitleMap] = useState<SkillTargetTitleMap>({});
  const { runAsync } = useAsync();

  useEffect(() => {
    setMasterSkillMap(utils.toMap(masterSkills, 'effect'));
  }, [masterSkills]);

  return {
    skill,
    skillMap,
    getSkill,
    setSkill,
    getSkillMap,
    masterSkills,
    masterSkillMap,
    getMasterSkills,
    skillTargetTitleMap,
    getSkillTargetTitleMap,
  };

  function getSkill(effect: entities.SkillEffect, condition: entities.Condition.Type, target: entities.SkillTarget) {
    runAsync(async () => {
      const skill = await SkillService.getSkill(effect, condition, target);
      setSkill(skill);
    });
  }

  function getSkillMap() {
    if (skillMap.size !== 0) {
      return;
    }
    runAsync(async () => {
      const map = await SkillService.getSkillMap();
      setSkillMap(map);
    });
  }

  function getMasterSkills() {
    runAsync(async () => {
      const skills = await SkillService.getMasterSkills();
      setMasterSkills(skills);
    });
  }

  function getSkillTargetTitleMap() {
    if (!utils.isEmpty(skillTargetTitleMap)) {
      return;
    }
    runAsync(async () => {
      const map = await SkillService.getTargetTitleMap();
      setSkillTargetTitleMap(map);
    });
  }
}
