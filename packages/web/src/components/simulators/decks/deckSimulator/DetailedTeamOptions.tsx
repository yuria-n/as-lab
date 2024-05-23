import React, { memo } from 'react';
import { libs } from '@as-lab/core';

import { Grid } from '../../../universal';
import { SpMaxCheckbox } from './SpMaxCheckbox';
import { TeamOptionCard } from './TeamOptionCard';
import { useCallbacks } from '../../../../hooks';

type TeamOptions = libs.DeckSimulator.TeamOptions;

interface Props {
  teams: TeamOptions[];
  onChange: (teams: TeamOptions[]) => void;
  spTeam: boolean;
  onSpTeamClick: (checked: boolean) => void;
}
export const DetailedTeamOptions = memo(Component);

function Component({ teams, spTeam, onSpTeamClick, onChange }: Props) {
  const handleChanges = useCallbacks(
    teams,
    (_, index) => (team: TeamOptions) => {
      const newTeams = [...teams];
      newTeams[index] = team;
      onChange(newTeams);
    },
    [teams, onChange],
  );

  return (
    <Grid gap="1rem">
      {teams.map((team, index) => (
        <TeamOptionCard key={team.team} team={team} onChange={handleChanges[index]} />
      ))}
      <SpMaxCheckbox checked={spTeam} onClick={onSpTeamClick} />
    </Grid>
  );
}
