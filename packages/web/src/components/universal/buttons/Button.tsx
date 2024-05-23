import React from 'react';
import styled from 'styled-components';

import { uiColorMap } from '../../../constants';
import { getColor } from '../../../utils';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  mode?: 'primary' | 'secondary' | 'danger';
  margin?: string;
}

export function Button({ children, mode = 'primary', onClick = () => {}, disabled = false, margin }: Props) {
  return (
    <StyledButton
      mode={mode}
      disabled={disabled}
      onClick={(e) => {
        e.preventDefault();
        onClick(e);
      }}
      margin={margin}
    >
      {children}
    </StyledButton>
  );
}

const white100 = getColor(uiColorMap.white);
const magenta100 = getColor(uiColorMap.magenta);
const cyan100 = getColor(uiColorMap.cyan);
const black700 = getColor(uiColorMap.black, 700);

const StyledButton = styled.button<Props>`
  cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin: ${({ margin }) => margin ?? '0'};
  padding: 0.5em 1em;
  font-size: 1rem;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  border: 2px solid;
  border-radius: 0.25rem;
  transition: 0.3s;

  ${({ mode }) => {
    switch (mode) {
      case 'danger':
        return `
          color: ${white100};
          background: ${cyan100};
          border-color: ${cyan100};
          `;
      case 'secondary':
        return `
          color: ${magenta100};
          background: ${white100};
        `;
      case 'primary':
      default: {
        return `
          color: ${white100};
          background: ${magenta100};
          border-color: ${magenta100};
        `;
      }
    }
  }}

  &:disabled {
    cursor: default;
    ${({ mode }) => (mode === 'secondary' ? `color: ${black700};` : `background: ${black700};`)}
    border-color: ${black700};

    &:hover {
      background: ${({ mode }) => (mode === 'secondary' ? white100 : black700)};
    }
  }

  &:hover {
    background: ${({ mode }) =>
      mode === 'secondary'
        ? getColor(uiColorMap.magenta, 700)
        : getColor(mode === 'danger' ? uiColorMap.cyan : uiColorMap.magenta, 300)};
  }

  & > svg {
    margin: 0 0.25rem 0 0;
    font-size: 1rem;
  }
`;
