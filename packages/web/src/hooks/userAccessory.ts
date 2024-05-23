import { entities } from '@as-lab/core';

import { QueryType, useMutation, useQuery } from './query';
import { UserAccessoryService } from '../services';

export function useUserAccessory() {
  const { data: userAccessories, refetch: refetchUserAccessories } = useQuery(
    QueryType.UserAccessory,
    () => UserAccessoryService.getUserAccessories(),
    {
      placeholderData: [],
    },
  );

  const { mutate: createUserAccessory } = useMutation(async (userAccessory: Omit<entities.UserAccessory, 'id'>) => {
    await UserAccessoryService.createUserAccessory(userAccessory);
    await refetchUserAccessories();
  });

  const { mutate: updateUserAccessory } = useMutation(async (userAccessory: entities.UserAccessory) => {
    await UserAccessoryService.updateUserAccessory(userAccessory);
    await refetchUserAccessories();
  });

  const { mutate: deleteUserAccessory } = useMutation(async (userAccessoryId: entities.UserAccessory['id']) => {
    await UserAccessoryService.deleteUserAccessory(userAccessoryId);
    await refetchUserAccessories();
  });

  const { mutate: exportUserAccessory } = useMutation(() => UserAccessoryService.export());

  const { mutate: importUserAccessory } = useMutation((data: entities.StoredUserAccessories) =>
    UserAccessoryService.import(data),
  );

  return {
    userAccessories,
    createUserAccessory,
    updateUserAccessory,
    deleteUserAccessory,
    exportUserAccessory,
    importUserAccessory,
  };
}
