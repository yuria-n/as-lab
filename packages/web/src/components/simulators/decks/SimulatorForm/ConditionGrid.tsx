import styled from 'styled-components';

import { Grid } from '../../../universal';
import { getColor } from '../../../../utils';
import { uiColorMap } from '../../../../constants';

export const ConditionGrid = styled(Grid)`
  &:not(:first-child) {
    padding: 1.5rem 0 0;
    border-top: 1px dashed ${getColor(uiColorMap.black, 100, 0.3)};
  }
`;
