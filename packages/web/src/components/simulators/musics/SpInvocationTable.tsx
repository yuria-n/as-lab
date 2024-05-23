import React, { memo } from 'react';
import { Input, Table } from 'semantic-ui-react';

import { utils } from '@as-lab/core';

import { Button, DeleteButton } from '../../universal/buttons';
import { handleChange, HandleType } from '../../../utils';

export const SpInvocationTable = memo(Component, utils.makeEqual(['onChange']));

interface Props {
  spSkillInvocationNotes: Value[];
  onChange: (spSkillInvocationNotes: Value[]) => void;
}

function Component({ spSkillInvocationNotes, onChange }: Props) {
  const setNotes = (index: Index, notes: Value) => {
    onChange(spSkillInvocationNotes.map((prev, i) => (index !== i ? prev : notes)));
  };
  const addRow = () => {
    const next = spSkillInvocationNotes[spSkillInvocationNotes.length - 1] ?? 0;
    onChange([...spSkillInvocationNotes, next + 1]);
  };
  const deleteRow = (index: Index) => {
    onChange(spSkillInvocationNotes.filter((_, i) => i !== index));
  };
  return (
    <>
      <h4>SP発動</h4>
      <p>
        SP発動判定は次のノーツの直前で行われます。例えばノーツ20と指定した場合、ノーツ21の直前で行われ3秒のボーナスが最大化されます。
        発動不可能な場合は、次に発動可能なタイミングで発動されます。また指定がない場合、発動可能なタイミングで自動的に発動されます。
      </p>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>ノーツ</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {spSkillInvocationNotes.map((notes, index) => (
            <Table.Row key={index}>
              <Table.Cell>
                <Input
                  name="notes"
                  type="number"
                  min={0}
                  max={999}
                  value={notes}
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
