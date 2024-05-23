import React, { memo } from 'react';
import { Input, Table } from 'semantic-ui-react';

import { entities, libs, utils } from '@as-lab/core';

import { handleChange, HandleType, roundRate } from '../../../utils';

export const TapRateTable = memo(Component, utils.makeEqual(['onChange']));

type TapRateMap = libs.SkillHandler.TapRateMap;

const tapEvents = [
  entities.Music.TapEvent.Wonderful,
  entities.Music.TapEvent.Great,
  entities.Music.TapEvent.Good,
  entities.Music.TapEvent.Bad,
  entities.Music.TapEvent.Miss,
] as const;

interface Props {
  tapRateMap: TapRateMap;
  onChange: (tapRateMap: TapRateMap) => void;
}

function Component({ tapRateMap, onChange }: Props) {
  const setRate = (tapEvent: keyof TapRateMap, value: Value) => {
    onChange({ ...tapRateMap, [tapEvent]: value / 100 });
  };
  return (
    <>
      <h4>タップ判定</h4>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>判定</Table.HeaderCell>
            <Table.HeaderCell>確率</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tapEvents.map((tapEvent) => (
            <Table.Row key={tapEvent}>
              <Table.Cell>{tapEvent}</Table.Cell>
              <Table.Cell>
                <Input
                  name="notes"
                  type="number"
                  min={0}
                  max={100}
                  value={roundRate(tapRateMap[tapEvent])}
                  onChange={handleChange(HandleType.Number, (value) => setRate(tapEvent, value))}
                />
                ％
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </>
  );
}
