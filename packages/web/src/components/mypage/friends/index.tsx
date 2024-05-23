import { CardGrid, FriendCard, InfeedAd, NewCard, ResponsiveAd } from '../../universal';
import { HandleType, handleChange } from '../../../utils';
import React, { useState } from 'react';
import { mount, route } from 'navi';

import { InputDialog } from './InputDialog';
import { MypageContainer } from '../MypageContainer';
import { Path } from '../../../constants';
import { useUserFriend } from '../../../hooks';

export default mount({
  '/': route({
    view: <Component />,
  }),
});

function Component() {
  const [selectedId, setSelectedId] = useState('');
  const [open, setOpen] = useState(false);

  const { userFriends } = useUserFriend();

  const handleClose = () => setOpen(false);
  const handleClick = (id = '') => {
    handleChange(HandleType.String, setSelectedId)(id);
    setOpen(true);
  };

  return (
    <MypageContainer active={Path.Friend} description="シミュレーターで使用するフレンドの登録や管理を行います。">
      <InfeedAd className="mypage-friend-top" slot="9319100012" />

      <InputDialog id={selectedId} open={open} onUpdate={handleClose} onClose={handleClose} />

      <CardGrid>
        <NewCard text="新しいフレンドを追加" onClick={() => handleClick()} />
        {userFriends.map((userFriend) => (
          <FriendCard key={userFriend.id} userFriend={userFriend} onClick={handleClick} />
        ))}
      </CardGrid>

      <ResponsiveAd className="mypage-friend-bottom" slot="3252168546" />
    </MypageContainer>
  );
}
