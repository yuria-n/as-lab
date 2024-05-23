import styled from 'styled-components';

interface GridRowProps {
  columns?: string;
  rows?: string;
  gap?: string;
  justify?: 'start' | 'end' | 'center' | 'stretch';
  justifyContent?: 'start' | 'end' | 'center' | 'stretch' | 'inherit';
  align?: 'start' | 'end' | 'center' | 'stretch';
}

export const Grid = styled.div<GridRowProps>`
  display: grid;
  grid-template-columns: ${({ columns = 'auto' }) => columns};
  grid-template-rows: ${({ rows = 'auto' }) => rows};
  grid-gap: ${({ gap = '' }) => gap};
  justify-items: ${({ justify = 'stretch' }) => justify};
  justify-content: ${({ justifyContent = 'inherit' }) => justifyContent};
  align-items: ${({ align = 'stretch' }) => align};
`;

interface GridItemProps {
  columnStart?: string;
  columnEnd?: string;
  rowStart?: string;
  rowEnd?: string;
}

export const GridItem = styled.div<GridItemProps>`
  grid-column-start: ${({ columnStart = 'auto' }) => columnStart};
  grid-column-end: ${({ columnEnd = 'auto' }) => columnEnd};
  grid-row-start: ${({ rowStart = 'auto' }) => rowStart};
  grid-row-end: ${({ rowEnd = 'auto' }) => rowEnd};
`;
