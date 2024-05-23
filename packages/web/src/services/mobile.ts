import { MobileRepository } from '../repositories';

export class MobileService {
  static isMobile() {
    return MobileRepository.isMobile();
  }
}
