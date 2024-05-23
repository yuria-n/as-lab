import styled from 'styled-components';
import { Dispatch, SetStateAction, memo, useCallback, useEffect, useState } from 'react';
import { entities } from '@as-lab/core';

import { DeckSupportSimulatorCardFilter } from '.';
import { Grid, InputLabel, Paper } from '../../../universal';
import { attributeColorMap, attributeTextMap, schoolMap, typeColorMap, uiColorMap } from '../../../../constants';
import { getColor } from '../../../../utils';
import { useCallbacks } from '../../../../hooks';

interface Props {
  onChange: (filter: DeckSupportSimulatorCardFilter) => void;
}

export const DeckSupportSimulatorFilter = memo(Component);

function Component({ onChange }: Props) {
  const [selectedAttributes, setSelectedAttributes] = useState(attributeOptions.map(() => true));
  const [selectedTypes, setSelectedTypes] = useState(typeOptions.map(() => true));
  const [selectedSchools, setSelectedSchools] = useState(schoolOptions.map(() => true));
  const [selectedGrades, setSelectedGrades] = useState(gradeOptions.map(() => true));

  const onAllAttributeClick = useCallback(() => setSelectedAttributes(mapAllValues), [setSelectedAttributes]);
  const onAttributeClicks = useCallbacks(attributeOptions, createOnClickFactory(setSelectedAttributes), [
    setSelectedAttributes,
  ]);
  const onAllTypeClick = useCallback(() => setSelectedTypes(mapAllValues), [setSelectedTypes]);
  const onTypeClicks = useCallbacks(typeOptions, createOnClickFactory(setSelectedTypes), [setSelectedTypes]);
  const onAllSchoolClick = useCallback(() => setSelectedSchools(mapAllValues), [setSelectedSchools]);
  const onSchoolClicks = useCallbacks(schoolOptions, createOnClickFactory(setSelectedSchools), [setSelectedSchools]);
  const onAllGradeClick = useCallback(() => setSelectedGrades(mapAllValues), [setSelectedGrades]);
  const onGradeClicks = useCallbacks(gradeOptions, createOnClickFactory(setSelectedGrades), [setSelectedGrades]);

  useEffect(() => {
    onChange({
      attributeSet: new Set(mapSelectedFilter(attributeOptions, selectedAttributes)),
      typeSet: new Set(mapSelectedFilter(typeOptions, selectedTypes)),
      schoolSet: new Set(mapSelectedFilter(schoolOptions, selectedSchools)),
      gradeSet: new Set(mapSelectedFilter(gradeOptions, selectedGrades)),
    });
  }, [onChange, selectedAttributes, selectedTypes, selectedSchools, selectedGrades]);

  return (
    <Paper margin="0 0 2.5rem">
      <h3>絞り込み条件</h3>
      <Grid gap="1.5rem">
        <Grid>
          <InputLabel>属性</InputLabel>
          <Grid columns="repeat(auto-fill, 6rem)" gap="0.5rem">
            <AttributeButton
              key="all"
              value="all"
              color={defaultGrey}
              checked={selectedAttributes.every((value: boolean) => value)}
              onClick={onAllAttributeClick}
            >
              すべて
            </AttributeButton>
            {attributeOptions.map(({ value, label, color }, index) => (
              <AttributeButton
                key={value}
                value={value}
                checked={selectedAttributes[index]}
                color={color}
                onClick={onAttributeClicks[index]}
              >
                {label}
              </AttributeButton>
            ))}
          </Grid>
        </Grid>

        <Grid>
          <InputLabel>タイプ</InputLabel>
          <Grid columns="repeat(5, auto)" gap="0.5rem" justifyContent="start">
            <TypeButton
              key="all"
              value="all"
              color={defaultGrey}
              checked={selectedTypes.every((value: boolean) => value)}
              onClick={onAllTypeClick}
            >
              すべて
            </TypeButton>
            {typeOptions.map(({ value, label, color }, index) => (
              <TypeButton
                key={value}
                value={value}
                checked={selectedTypes[index]}
                color={color}
                onClick={onTypeClicks[index]}
              >
                {label}
              </TypeButton>
            ))}
          </Grid>
        </Grid>

        <Grid>
          <InputLabel>学校</InputLabel>
          <Grid columns="repeat(auto-fill, 8rem)" gap="0.5rem">
            <AttributeButton
              key="all"
              value="all"
              color={defaultGrey}
              checked={selectedSchools.every((value: boolean) => value)}
              onClick={onAllSchoolClick}
            >
              すべて
            </AttributeButton>
            {schoolOptions.map(({ value, label }, index) => (
              <AttributeButton
                key={value}
                value={value}
                checked={selectedSchools[index]}
                color={defaultGrey}
                onClick={onSchoolClicks[index]}
              >
                {label}
              </AttributeButton>
            ))}
          </Grid>
        </Grid>

        <Grid>
          <InputLabel>学年</InputLabel>
          <Grid columns="repeat(auto-fill, 5rem)" gap="0.5rem">
            <AttributeButton
              key="all"
              value="all"
              color={defaultGrey}
              checked={selectedGrades.every((value: boolean) => value)}
              onClick={onAllGradeClick}
            >
              すべて
            </AttributeButton>
            {gradeOptions.map(({ value, label }, index) => (
              <AttributeButton
                key={value}
                value={value}
                checked={selectedGrades[index]}
                color={defaultGrey}
                onClick={onGradeClicks[index]}
              >
                {label}
              </AttributeButton>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}

function createOnClickFactory(setter: Dispatch<SetStateAction<boolean[]>>) {
  return (_: any, index: number) => () =>
    setter((options) => options.map((value, i) => (i === index ? !value : value)));
}

function mapAllValues(selected: boolean[]) {
  const value = selected.some((value) => !value);
  return selected.map(() => value);
}

function mapSelectedFilter<T>(options: { value: T }[], selected: boolean[]) {
  return options.map((option) => option.value).filter((_, index) => selected[index]);
}

const attributeOptions = Object.values(entities.Card.Attribute)
  .filter((value) => value !== entities.Card.Attribute.None)
  .map((value) => ({
    value,
    label: attributeTextMap[value],
    color: getColor(attributeColorMap[value]),
  }));

const typeOptions = Object.entries(entities.Card.Type).map(([key, value]) => ({
  value,
  label: key,
  color: getColor(typeColorMap[value]),
}));

const schoolOptions = Object.values(entities.School).map((school) => ({ value: school, label: schoolMap[school] }));

const gradeOptions = [entities.Grade.First, entities.Grade.Second, entities.Grade.Third].map((grade) => ({
  value: grade,
  label: `${grade}年生`,
}));

const focusBlue = '#96c8da';
const white = getColor(uiColorMap.white);
const defaultGrey = getColor(uiColorMap.black, 300);

interface ButtonProps {
  checked: boolean;
  color: string;
}

const AttributeButton = styled.button<ButtonProps>`
  cursor: pointer;
  padding: 0.5rem;
  color: ${({ checked, color }) => (checked ? white : color)};
  background: ${({ checked, color }) => (checked ? color : white)};
  border: 2px solid ${({ color }) => color};
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 2rem;
  white-space: nowrap;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${focusBlue};
  }
`;

const TypeButton = styled.button<ButtonProps>`
  cursor: pointer;
  padding: 0.5rem 1rem;
  color: ${({ checked, color }) => (checked ? white : color)};
  background: ${({ checked, color }) => (checked ? color : white)};
  border: 2px solid ${({ color }) => color};
  font-size: 0.9rem;
  font-weight: bold;
  border-radius: 2rem;
  white-space: nowrap;
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${focusBlue};
  }
`;
