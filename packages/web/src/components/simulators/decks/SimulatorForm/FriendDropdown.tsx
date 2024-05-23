import { entities } from '@as-lab/core';
import { memo, useCallback, useMemo } from 'react';

import { ConditionGrid } from './ConditionGrid';
import { Grid, ImageDropdown, InputLabel } from '../../../universal';
import { getCardImageUrl } from '../../../../utils';
import { useUserFriend } from '../../../../hooks';

interface FriendDropdownProps {
  id: entities.UserFriend['id'];
  onChange: (friend: entities.UserFriend | null) => void;
}

export const FriendDropdown = memo(Component);

function Component({ id, onChange }: FriendDropdownProps) {
  const { userFriends } = useUserFriend();

  const friendOptions = useMemo(
    () => [
      { key: '', value: '', text: 'なし', image: '' },
      ...userFriends.map((friend) => ({
        key: friend.id,
        value: friend.id,
        text: friend.name,
        image: { src: getCardImageUrl(friend.card.id) },
      })),
    ],
    [userFriends],
  );

  return (
    <ConditionGrid gap="1.5rem">
      <Grid>
        <InputLabel>フレンドゲスト</InputLabel>
        <ImageDropdown
          name="friend"
          placeholder="なし"
          openOnFocus
          autoFocus
          fluid
          search
          value={id}
          options={friendOptions}
          onChange={useCallback(
            (_, data) => onChange(userFriends?.find((friend) => friend.id === data.value) ?? null),
            [onChange, userFriends],
          )}
        />
      </Grid>
    </ConditionGrid>
  );
}
