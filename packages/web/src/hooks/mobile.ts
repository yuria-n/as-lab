import { MobileService } from '../services';
import { QueryType, useQuery } from './query';
import { useObject } from './object';

export function useMobile() {
  const { data: isMobile } = useQuery(QueryType.Mobile, () => MobileService.isMobile(), {
    placeholderData: null,
  });

  return useObject({
    isMobile,
  });
}
