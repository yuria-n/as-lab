import * as entities from '../entities';
import { QueryType, useMutation, useQuery } from './query';
import { UserConfigService } from '../services';
import { useObject } from './object';

export function useUserConfig() {
  const { data: userConfig, refetch: refetchUserConfig } = useQuery(
    QueryType.UserConfig,
    () => UserConfigService.getUserConfig(),
    {
      placeholderData: null,
    },
  );

  const { mutate: updateUserConfig } = useMutation(async (userConfig: entities.UserConfig) => {
    await UserConfigService.updateUserConfig(userConfig);
    await refetchUserConfig();
  });

  return useObject({
    userConfig,
    updateUserConfig,
  });
}
