import React, { memo } from 'react';
import { Input, Table } from 'semantic-ui-react';

import { entities, libs, utils } from '@as-lab/core';

import { Button, DeleteButton } from '../../universal/buttons';
import { changeTeamNotes } from '../../../constants';
import { handleChange, HandleType } from '../../../utils';
import { TeamColorDropdown } from '../../universal/decks';

export const ChangeTeamTable = memo(Component, utils.makeEqual(['onChange']));

type Team = entities.Deck.Team;
type ChangeTeam = libs.MusicSimulator.ChangeTeam;
interface Props {
  changeTeams: ChangeTeam[];
  onChange: (changeTeams: ChangeTeam[]) => void;
}

const teams = Object.values(entities.Deck.Team);

function Component({ changeTeams, onChange }: Props) {
  const setTeam = (index: Index, team: Team) => {
    onChange(changeTeams.map((prev, i) => (index !== i ? prev : { ...prev, team })));
  };
  const setNotes = (index: Index, notes: Value) => {
    onChange(changeTeams.map((prev, i) => (index !== i ? prev : { ...prev, notes })));
  };
  const addRow = () => {
    const prev = changeTeams[changeTeams.length - 1] || { team: utils.sample(teams), notes: 0 };
    const next = {
      team: utils.sample(teams.filter((team) => team !== prev.team)),
      notes: prev.notes + changeTeamNotes,
    };
    onChange([...changeTeams, next]);
  };
  const deleteRow = (index: Index) => {
    onChange(changeTeams.filter((_, i) => i !== index));
  };
  return (
    <>
      <h4>作戦変更</h4>
      <p>
        作戦変更の判定はノーツをタップ後に判定されます。変更不可能な場合、次に変更可能なタイミングで自動的に変更されます。
      </p>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>チーム</Table.HeaderCell>
            <Table.HeaderCell>ノーツ</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {changeTeams.map((changeTeam, index) => (
            <Table.Row key={index}>
              <Table.Cell>
                <TeamColorDropdown team={changeTeam.team} onChange={(team) => setTeam(index, team)} />
              </Table.Cell>
              <Table.Cell>
                <Input
                  name="notes"
                  type="number"
                  min={0}
                  max={999}
                  value={changeTeam.notes}
                  onChange={handleChange(HandleType.Number, (notes) => setNotes(index, notes))}
                />
              </Table.Cell>
              <Table.Cell>
                <DeleteButton onClick={() => deleteRow(index)} />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <Button onClick={addRow}>追加</Button>
    </>
  );
}
