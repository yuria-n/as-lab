import { entities } from '@as-lab/core';

export interface UserConfig {
  mobileView: boolean;
}

export interface StoredUserConfig extends entities.StoredData {
  userConfig: UserConfig;
}
