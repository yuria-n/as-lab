import React, { memo, useEffect, useState } from 'react';
import { DropdownItemProps } from 'semantic-ui-react';

import { entities } from '@as-lab/core';

import { handleChange, HandleType } from '../../../utils';
import { ImageDropdown } from '../';
import { teamMap, teamImageMap } from '../../../constants';

export const TeamColorDropdown = memo(Component);

type Team = entities.Deck.Team;

interface Props {
  team: Team | '';
  availableTeamSet?: Set<Team>;
  onChange: (team: entities.Deck.Team) => void;
  disabled?: boolean;
}

function Component({ team, availableTeamSet, onChange, disabled }: Props) {
  const [options, setOptions] = useState<DropdownItemProps[]>([]);
  useEffect(() => {
    const options = Object.values(entities.Deck.Team)
      .filter((team) => !availableTeamSet || availableTeamSet.has(team))
      .map((team) => ({
        key: team,
        value: team,
        text: teamMap[team],
        image: { src: teamImageMap[team] },
      }));
    setOptions(options);
  }, [availableTeamSet]);
  return (
    <>
      <ImageDropdown
        name="team"
        placeholder="作戦カラー (例: 赤)"
        value={team}
        options={options}
        onChange={(_, data) => handleChange(HandleType.Generic, onChange)(data.value)}
        disabled={disabled}
      />
    </>
  );
}
