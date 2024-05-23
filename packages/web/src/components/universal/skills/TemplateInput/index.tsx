import React, { memo } from 'react';

import { entities, utils } from '@as-lab/core';

import { Flex } from '../../';
import { ParameterInput } from './ParameterInput';

interface Props {
  template: string;
  fields?: entities.Field[];
  values?: any[];
  onChange?: (index: number, value: any) => void;
}

export const TemplateInput = memo(Component, (prev, next) => utils.isEqual(prev, next, ['onChange']));

interface Field {
  field: entities.Field;
  index: Index;
}

const templateMemo = new Map<string, { words: string[]; keys: string[]; fieldMap: Map<string, Field> }>();

function Component({ template = '', fields, values, onChange }: Props) {
  const disabled = !onChange;
  if (!templateMemo.has(template)) {
    const words = template.split(/\${'.+?'}/g);
    const keys = Array.from(template.matchAll(/\${'(.+?)'}/g), ([, key]) => key);
    const fieldMap = new Map(fields?.map((field, index) => [field.name, { field, index }]));
    templateMemo.set(template, { words, keys, fieldMap });
  }
  const { words, keys, fieldMap } = templateMemo.get(template)!;
  return (
    <Flex justify="flex-start" align="center">
      {words.flatMap((word, index) => {
        const key = `${template}_${index}`;
        const component = <span key={key}>{word}</span>;
        const field = fieldMap.get(keys[index]);
        if (!field) {
          return component;
        }
        const {
          field: { name, type },
          index: fieldIndex,
        } = field;
        return (
          <React.Fragment key={key}>
            {component}
            <ParameterInput
              type={type}
              name={name}
              placeholder={type === entities.Field.Type.Parameter ? 'パラメータ' : '0'}
              value={values?.[fieldIndex] ?? ''}
              disabled={disabled}
              onChange={(value) => onChange && onChange(fieldIndex, value)}
            />
          </React.Fragment>
        );
      })}
    </Flex>
  );
}
