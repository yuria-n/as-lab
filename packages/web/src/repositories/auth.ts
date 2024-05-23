import { User } from '@firebase/auth-types';

import { BadRequestError } from '../hooks';
import { Firebase } from '../clients';
import { config } from '../config';

export class AuthRepository {
  private static subscriberSet = new Set<Subscriber<User | null>>();
  private static subscribed = false;

  static async getCurrentUser(): Promise<User | null> {
    const auth = await Firebase.auth();
    if (this.subscribed) {
      return auth.currentUser;
    }
    this.subscribed = true;
    auth.onAuthStateChanged((user: User | null) => {
      for (const subscriber of this.subscriberSet) {
        subscriber(user);
      }
    });
    return auth.currentUser;
  }

  static async login() {
    const auth = await Firebase.auth();
    const provider = new Firebase.firebase.auth.GoogleAuthProvider();
    try {
      if (config.webview) {
        await auth.signInWithRedirect(provider);
      } else {
        await auth.signInWithPopup(provider);
      }
    } catch (err) {
      console.debug('firebase auth error', err);
      throw new BadRequestError('ログインできませんでした。');
    }
  }

  static async logout() {
    const auth = await Firebase.auth();
    await auth.signOut();
  }

  static subscribe(subscriber: Subscriber<User | null>) {
    this.subscriberSet.add(subscriber);
  }

  static unsubscribe(subscriber: Subscriber<User | null>) {
    this.subscriberSet.delete(subscriber);
  }
}
