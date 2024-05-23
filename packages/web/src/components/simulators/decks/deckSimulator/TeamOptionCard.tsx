import styled from 'styled-components';
import React, { SyntheticEvent, memo, useCallback, useMemo } from 'react';
import { Dropdown, DropdownProps } from 'semantic-ui-react';
import { FaPlus } from 'react-icons/fa';
import { entities, libs } from '@as-lab/core';

import { DefenderCheckbox } from './DefenderCheckbox';
import { Flex, Grid, InputLabel, Paper, TeamColorDropdown } from '../../../universal';
import { ReductionInput } from './ReductionInput';
import { deckColorMap, teamMap, teamTypeOptions, uiColorMap } from '../../../../constants';
import { getColor } from '../../../../utils';

const defaultReduction: libs.DeckSimulator.Reduction = {
  targets: [entities.Card.Type.Vo],
  param: entities.Parameter.Appeal,
  rate: 0,
};

type TeamOptions = libs.DeckSimulator.TeamOptions;

interface Props {
  team: TeamOptions;
  onChange: (team: TeamOptions) => void;
}

export const TeamOptionCard = memo(Component);

function Component({ team, onChange }: Props) {
  // type
  const handleTypeUpdate = useCallback(
    (_: SyntheticEvent<HTMLElement>, data: DropdownProps) => {
      const type = data.value as TeamOptions['type'];
      if (type === libs.TeamType.Support) {
        onChange({
          team: team.team,
          type: libs.TeamType.Support,
          target: entities.Deck.Team.Red,
          reductions: team.reductions,
        });
      } else {
        onChange({ team: team.team, type, defender: true, reductions: team.reductions });
      }
    },
    [team, onChange],
  );

  // team
  const availableTeamSet = useMemo(
    () => new Set(Array.from(Object.values(entities.Deck.Team).filter((target) => target !== team.team))),
    [team],
  );
  const handleTargetChange = useCallback(
    (deckTeam: entities.Deck.Team) => {
      onChange({ ...team, target: deckTeam } as TeamOptions);
    },
    [team, onChange],
  );

  // defender
  const handleDefenderClick = useCallback(() => {
    if (team.type === libs.TeamType.Support) {
      return;
    }
    onChange({ ...team, defender: !team.defender });
  }, [team, onChange]);

  // reduction
  const handleReductionUpdate = useCallback(
    (index: number, reduction: libs.DeckSimulator.Reduction) => {
      onChange({
        ...team,
        reductions: [
          ...team.reductions.slice(0, index),
          reduction,
          ...team.reductions.slice(index + 1, team.reductions.length),
        ],
      } as TeamOptions);
    },
    [onChange, team],
  );
  const handleReductionCreate = useCallback(() => {
    onChange({ ...team, reductions: [...team.reductions, defaultReduction] } as TeamOptions);
  }, [onChange, team]);

  const handleReductionDelete = useCallback(
    (index: number) => {
      onChange({ ...team, reductions: team.reductions.filter((_, i) => i !== index) } as TeamOptions);
    },
    [onChange, team],
  );

  return (
    <ContainerCard color={getColor(deckColorMap[team.team], 100, 0.1)}>
      <h4>{teamMap[team.team]}</h4>
      <Grid gap="1rem">
        <Grid>
          <InputLabel>作戦タイプ</InputLabel>
          <Flex align="center" justify="start">
            <Dropdown
              name="team-type"
              selection
              value={team.type}
              options={teamTypeOptions}
              onChange={handleTypeUpdate}
            />
            {team.type === libs.TeamType.Support && (
              <TeamColorDropdown team={team.target} availableTeamSet={availableTeamSet} onChange={handleTargetChange} />
            )}
          </Flex>
        </Grid>
        {team.type !== libs.TeamType.Support && (
          <>
            <DefenderCheckbox checked={team.defender} onClick={handleDefenderClick} />
            <Grid>
              <InputLabel>効果</InputLabel>
              <Grid gap="0.5rem">
                {team.reductions.map((reduction, index) => (
                  <ReductionInput
                    key={`${team.team}-${index}-${reduction.targets?.join('_')}`}
                    index={index}
                    reduction={reduction}
                    onChange={handleReductionUpdate}
                    onDelete={handleReductionDelete}
                  />
                ))}

                <Grid columns="repeat(2, auto)" gap="0.5rem" justifyContent="start">
                  <AddLink onClick={handleReductionCreate}>
                    <FaPlus /> 効果を追加
                  </AddLink>
                </Grid>
              </Grid>
            </Grid>
          </>
        )}
      </Grid>
    </ContainerCard>
  );
}

interface StyledProps {
  color: string;
}

const ContainerCard = styled(Paper)<StyledProps>`
  background: ${({ color }) => color};
  border: 1px solid ${getColor(uiColorMap.black, 100, 0.1)};
  box-shadow: none;
  padding: 1rem;
`;

const AddLink = styled.p`
  cursor: pointer;
  padding: 0.25rem;
  transition: 0.3s;
  color: ${getColor(uiColorMap.magenta)};
  border-bottom: 1px solid ${getColor(uiColorMap.magenta)};

  &:hover {
    color: ${getColor(uiColorMap.magenta, 300)};
    border-bottom: 1px solid ${getColor(uiColorMap.magenta, 300)};
  }
`;
