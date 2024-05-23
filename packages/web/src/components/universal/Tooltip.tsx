import React, { memo, useMemo } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { Popup, PopupProps } from 'semantic-ui-react';

import { getColor } from '../../utils';
import { uiColorMap } from '../../constants';

function Component({ trigger: customTrigger, position, ...props }: PopupProps) {
  const trigger = useMemo(() => customTrigger ?? <FaQuestionCircle color={getColor(uiColorMap.magenta)} />, [
    customTrigger,
  ]);
  return <Popup trigger={trigger} position={position ?? 'top center'} {...props} />;
}

export const Tooltip = memo(Component);
