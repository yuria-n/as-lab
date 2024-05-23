import React, { memo } from 'react';

import { entities } from '@as-lab/core';

import { SkillTargetTitleMap } from '../../../hooks';

export const SkillSlag = memo(Component);

interface Props {
  skill: entities.Skill;
  conditionMap: entities.ConditionMap;
  skillTargetTitleMap: SkillTargetTitleMap;
}

function Component({ skill, conditionMap, skillTargetTitleMap }: Props) {
  const none = skillTargetTitleMap[entities.SkillTarget.None];
  const skillTarget = skillTargetTitleMap[skill.target];
  const condition = conditionMap.get(skill.condition);
  const conditionTitle = condition?.title ?? '';
  return (
    <p>
      {`${skill.slug}${
        /(パッシブ|発動確率)/.test(conditionTitle)
          ? `${skillTarget === none ? '' : ` : ${skillTarget}`}`
          : ` : ${conditionTitle}${skillTarget === none ? '' : ` / ${skillTarget}`}`
      }`}
    </p>
  );
}
