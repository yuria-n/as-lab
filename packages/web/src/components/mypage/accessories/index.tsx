import React, { memo, useCallback, useEffect, useState } from 'react';
import { mount, route } from 'navi';

import { AccessoryCard } from '../../universal';
import { Analytics, LogType } from '../../../clients';
import { CardGrid, InfeedAd, NewCard, ResponsiveAd } from '../../universal';
import { HandleType, handleChange } from '../../../utils';
import { InputDialog } from './InputDialog';
import { MypageContainer } from '../MypageContainer';
import { Path } from '../../../constants';
import { useUserAccessory } from '../../../hooks';

const Accessory = memo(Component);

export default mount({
  '/': route({
    view: <Accessory />,
  }),
});

function Component() {
  const [selectedId, setSelectedId] = useState('');
  const [open, setOpen] = useState(false);

  const { userAccessories } = useUserAccessory();

  useEffect(() => {
    Analytics.logEvent(LogType.VisitAccessory);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClose = useCallback(() => setOpen(false), [setOpen]);
  const handleClick = useCallback(
    (id = '') => {
      handleChange(HandleType.String, setSelectedId)(id);
      setOpen(true);
    },
    [setSelectedId, setOpen],
  );

  return (
    <MypageContainer
      active={Path.Accessory}
      description="シミュレーターで使用するアクセサリー情報の登録や管理を行います。"
    >
      <InfeedAd className="mypage-accessory-top" slot="2581467127" />

      <InputDialog id={selectedId} open={open} onUpdate={handleClose} onClose={handleClose} />

      <CardGrid>
        <NewCard text="新しいアクセサリーを追加" onClick={() => handleClick()} />
        {userAccessories.map((userAccessory) => (
          <AccessoryCard key={userAccessory.id} {...userAccessory} onClick={handleClick} />
        ))}
      </CardGrid>

      <ResponsiveAd className="mypage-accessory-bottom" slot="4852583888" />
    </MypageContainer>
  );
}
