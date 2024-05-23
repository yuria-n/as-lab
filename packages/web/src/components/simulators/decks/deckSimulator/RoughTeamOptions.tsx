import React, { SyntheticEvent, memo, useCallback, useEffect, useMemo } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { entities, libs } from '@as-lab/core';

import { DefenderCheckbox } from './DefenderCheckbox';
import { Flex, Grid, TeamColorDropdown } from '../../../universal';
import { SpMaxCheckbox } from './SpMaxCheckbox';
import { mainTeamTypeOptions } from '../../../../constants';

type TeamOptions = libs.DeckSimulator.TeamOptions;

const defaultMain: libs.DeckSimulator.MainTeamOptions = {
  team: entities.Deck.Team.Red,
  type: libs.TeamType.Appeal,
  defender: true,
  reductions: [],
};

interface Props {
  teams: TeamOptions[];
  onChange: (teams: any) => void;
  spTeam: boolean;
  onSpTeamClick: (spTeam: boolean) => void;
}

export const RoughTeamOptions = memo(Component);

function Component({ teams, onChange, spTeam, onSpTeamClick }: Props) {
  const main = useMemo(() => {
    const team = teams.find((team) => team.type !== libs.TeamType.Support) ?? defaultMain;
    return team as libs.DeckSimulator.MainTeamOptions;
  }, [teams]);
  const updateTeams = useCallback(
    ({ team = main.team, type = main.type, defender = main.defender }: Partial<libs.DeckSimulator.MainTeamOptions>) => {
      const newTeams = Object.values(entities.Deck.Team).map((currentTeam) => {
        const newTeam = { team: currentTeam, reductions: [] };
        return currentTeam === team
          ? { ...newTeam, type, defender }
          : { ...newTeam, type: libs.TeamType.Support, target: team };
      });
      onChange(newTeams);
    },
    [onChange, main],
  );
  useEffect(() => {
    if (teams.some((team) => team.type === libs.TeamType.Support)) {
      return;
    }
    // reset teams if all teams are support
    updateTeams({});
  }, [teams, updateTeams]);

  const handleTeamChange = useCallback((team: entities.Deck.Team) => updateTeams({ team }), [updateTeams]);
  const handleTypeChange = useCallback(
    (_: SyntheticEvent<HTMLElement>, data: DropdownProps) => updateTeams({ type: data.value as any }),
    [updateTeams],
  );
  const handleDefenderChange = useCallback(() => updateTeams({ defender: !main.defender }), [main, updateTeams]);

  return (
    <Grid gap="1rem">
      <Flex align="center" justify="start">
        <TeamColorDropdown team={main.team} onChange={handleTeamChange} />
        <span>を</span>
        <Dropdown
          name="team-type"
          selection
          value={main.type}
          options={mainTeamTypeOptions}
          onChange={handleTypeChange}
        />
        <span>重視で編成</span>
      </Flex>
      <DefenderCheckbox checked={main.defender} onClick={handleDefenderChange} />
      <SpMaxCheckbox checked={spTeam} onClick={onSpTeamClick} />
    </Grid>
  );
}
