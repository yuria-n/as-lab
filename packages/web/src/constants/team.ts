import { libs } from '@as-lab/core';

import { toParamOptions } from '../utils';

const parameterTextMap: Record<libs.TeamType, string> = {
  [libs.TeamType.Voltage]: 'ボルテージ',
  [libs.TeamType.Appeal]: 'アピール',
  [libs.TeamType.Technique]: 'テクニック',
  [libs.TeamType.Stamina]: 'スタミナ',
  [libs.TeamType.SkillInvocation]: '特技発動率',
  [libs.TeamType.Sp]: 'SP',
  [libs.TeamType.Support]: 'サポート',
};

export const mainTeamTypeOptions = toParamOptions(
  [
    libs.TeamType.Voltage,
    libs.TeamType.Appeal,
    libs.TeamType.Technique,
    libs.TeamType.Stamina,
    libs.TeamType.SkillInvocation,
  ],
  parameterTextMap,
);

export const teamTypeOptions = [...mainTeamTypeOptions, ...toParamOptions([libs.TeamType.Support], parameterTextMap)];
