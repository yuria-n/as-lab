import { User } from '@firebase/auth-types';

import { AuthRepository } from '../repositories/auth';

export class AuthService {
  static async getCurrentUser(): Promise<User | null> {
    return AuthRepository.getCurrentUser();
  }

  static async login() {
    return AuthRepository.login();
  }

  static async logout() {
    return AuthRepository.logout();
  }

  static subscribe(subscriber: Subscriber<User | null>) {
    AuthRepository.subscribe(subscriber);
  }

  static unsubscribe(subscriber: Subscriber<User | null>) {
    AuthRepository.unsubscribe(subscriber);
  }
}
