import { useCallback } from 'react';

import { QueryType, useQuery } from './query';
import { UserCardService } from '../services';
import { config } from '../config';
import { useAsync } from './async';
import { useAuth } from './auth';
import { useObject } from './object';

export function useCloudUserCard() {
  const { user } = useAuth();
  const { runAsync } = useAsync();

  const { data: syncUserCardMap, refetch } = useQuery(
    [QueryType.SyncUserCardMap, user],
    () => (config.development ? testData : !user ? null : UserCardService.fetchUserCardMap(user.uid)),
    { placeholderData: null, enabled: false },
  );
  const getSyncUserCardMap = useCallback(() => runAsync(refetch), [runAsync, refetch]);

  return useObject({ syncUserCardMap, getSyncUserCardMap });
}

const testData = {
  '30': { appeal: 4580, stamina: 5343, updatedAt: 1610423674875, technique: 5097 },
  '108': {
    technique: 6392,
    updatedAt: 1611115839152,
    inspirationSkillIds: [
      'skillInvocationPlus_passive_friends_NR_medium',
      'skillInvocationPlus_passive_friends_N_small',
      'skillInvocationPlus_passive_friends_N_small',
    ],
    appeal: 5479,
    stamina: 6386,
  },
  '128': {
    technique: 5466,
    stamina: 5108,
    appeal: 7662,
    inspirationSkillIds: ['voltageUp_targetVoltage_everyone_R_small', 'voltageUp_targetVoltage_myself_N_large'],
    updatedAt: 1610355112009,
  },
  '146': {
    stamina: 6537,
    technique: 10786,
    updatedAt: 1610339961429,
    appeal: 15363,
    inspirationSkillIds: [
      'appealPlus_passive_sameTeam_NR_medium',
      'appealPlus_passive_sameTeam_NR_medium',
      'appealPlus_passive_sameAttribute_NR_medium',
      'appealPlus_passive_sameTeam_NR_medium',
    ],
  },
  '221': {
    inspirationSkillIds: ['criticalUp_acSuccess_myself_N_large', 'voltageGain_musicStart_none_SR_special'],
    updatedAt: 1610352104065,
  },
  '230': { appeal: 6755, technique: 6923, stamina: 3628, updatedAt: 1610352962532 },
  '319': {
    appeal: 15811,
    stamina: 6874,
    updatedAt: 1610339961429,
    technique: 11686,
    inspirationSkillIds: [
      'appealPlus_passive_sameAttribute_NR_medium',
      'appealPlus_passive_sameTeam_NR_medium',
      'appealPlus_passive_sameAttribute_NR_medium',
      'appealPlus_passive_sameAttribute_NR_medium',
    ],
  },
};
